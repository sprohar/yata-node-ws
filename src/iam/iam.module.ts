import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AccountsController } from './accounts.controller';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard, AuthenticationGuard } from './authentication/guards';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { GoogleAuthenticationController } from './authentication/social/google-authentication.controller';
import { GoogleAuthenticationService } from './authentication/social/google-authentication.service';
import jwtConfig from './config/jwt.config';
import { ArgonService } from './hashing/argon.service';
import { HashingService } from './hashing/hashing.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: ArgonService,
    },
    AuthenticationService,
    AuthenticationGuard,
    AccessTokenGuard,
    RefreshTokenIdsStorage,
    UsersService,
    RedisService,
    GoogleAuthenticationService,
  ],
  controllers: [
    AccountsController,
    AuthenticationController,
    GoogleAuthenticationController,
  ],
  exports: [AuthenticationService, AccessTokenGuard, AuthenticationGuard],
})
export class IamModule {}
