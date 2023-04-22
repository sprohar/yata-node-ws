import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { PgErrorCode } from '../../../enums';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthenticationService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string) {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });

      const { email, sub: googleId, picture, name } = loginTicket.getPayload();
      const user = await this.prisma.user.findFirst({
        where: { googleId },
        select: { id: true, email: true, loginsCount: true },
      });

      if (user) {
        const updatedUser = await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            loginsCount: user.loginsCount + 1,
            lastLogin: new Date().toISOString(),
          },
          select: {
            id: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            loginsCount: true,
            lastLogin: true,
            picture: true,
            name: true,
          },
        });

        const result = await this.authService.generateTokens(user as User);
        return {
          user: updatedUser,
          ...result,
        };
      }

      const newUser = await this.prisma.user.create({
        data: {
          email,
          googleId,
          name,
          picture,
          lastLogin: new Date().toISOString(),
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          loginsCount: true,
          lastLogin: true,
        },
      });

      const result = await this.authService.generateTokens(newUser as User);
      return {
        user: newUser,
        ...result,
      };
    } catch (err) {
      if (err.code === PgErrorCode.UniqueValidation) {
        throw new ConflictException();
      }
      throw new UnauthorizedException();
    }
  }
}
