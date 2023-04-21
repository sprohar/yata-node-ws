import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  authCookieOptions,
  COOKIE_REFRESH_TOKEN_KEY,
} from '../../iam.constants';
import { Public } from '../decorators';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { GoogleAuthenticationService } from './google-authentication.service';
import { GoogleOAuthDto } from './google-oauth.dto';

@Public()
@Controller('authentication/google')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthService: GoogleAuthenticationService,
  ) {}

  @Post()
  async authenticate(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: GoogleOAuthDto,
  ) {
    const result = await this.googleAuthService.authenticate(dto.credential);
    res.cookie(
      COOKIE_REFRESH_TOKEN_KEY,
      result.refreshToken,
      authCookieOptions,
    );

    const authResponse: AuthResponseDto = {
      accessToken: result.accessToken,
      user: result.user,
    };

    return authResponse;
  }
}
