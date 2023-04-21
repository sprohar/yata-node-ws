import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
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

      const { email, sub: googleId } = loginTicket.getPayload();
      const user = await this.prisma.user.findFirst({
        where: { googleId },
      });

      if (user) {
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            loginsCount: user.loginsCount + 1,
            lastLogin: new Date().toISOString(),
          },
        });

        return this.authService.generateTokens(user);
      }

      const newUser = await this.prisma.user.create({
        data: {
          email,
          googleId,
          lastLogin: new Date().toISOString(),
        },
      });

      return this.authService.generateTokens(newUser);
    } catch (err) {
      const pgUniqueViolationErrorCode = '23505';
      if (err.code === pgUniqueViolationErrorCode) {
        throw new ConflictException();
      }
      throw new UnauthorizedException();
    }
  }
}
