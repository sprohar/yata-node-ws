import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';
import { PrismaClientErrorCode } from '../../prisma/enums/prisma-client-error-code.enum';
import { UsersService } from '../../users/users.service';
import { ActiveUserData } from '../active-user-data';
import jwtConfig from '../config/jwt.config';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto, SignUpDto } from './dto';
import { InvalidatedRefreshTokenError } from './errors';
import { RefreshTokenPayload } from './interfaces';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';

@Injectable()
export class AuthenticationService {
  constructor(
    private usersService: UsersService,
    private hashingService: HashingService,
    private jwtService: JwtService,
    private refreshTokenIdsStorage: RefreshTokenIdsStorage,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async refreshTokens(refreshToken: string) {
    try {
      const tokenPayload =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        });

      const user = await this.usersService.findOne({
        id: parseInt(tokenPayload.sub),
      });

      await this.refreshTokenIdsStorage.validate(
        user.id,
        tokenPayload.refreshTokenId,
      );

      // refresh token rotation -> ensure that this token cannot be used again.
      await this.refreshTokenIdsStorage.invalidate(user.id);

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidatedRefreshTokenError) {
        console.error(error);
      }
      throw new UnauthorizedException();
    }
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = await this.usersService.create({
        email: signUpDto.email,
        pwd: await this.hashingService.hash(signUpDto.password),
      });

      return user;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === PrismaClientErrorCode.UNIQUE_CONSTRAINT_VIOLATION) {
          throw new ConflictException();
        }
        throw err;
      }
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOne({
      email: signInDto.email,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.pwd,
    );

    if (!isEqual) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // create tokens in parallel
    return await this.generateTokens(user);
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email },
      ),
      this.signToken<Partial<RefreshTokenPayload>>(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        { refreshTokenId },
      ),
    ]);

    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
    return { accessToken, refreshToken };
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
