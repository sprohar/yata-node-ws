import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ActiveUser, RefreshToken } from '../decorators';
import { COOKIE_REFRESH_TOKEN_KEY } from '../iam.constants';
import { AuthenticationService } from './authentication.service';
import { Auth, Public } from './decorators';
import { SignInDto, SignUpDto } from './dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthType } from './enums';
import { authCookieOptions } from '../iam.constants';

@ApiTags('Authentication')
@Public()
@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  private clearRefreshCookie(res: Response) {
    res.clearCookie(COOKIE_REFRESH_TOKEN_KEY, authCookieOptions);
  }

  private putRefreshTokenInCookieJar(res: Response, token: string) {
    res.cookie(COOKIE_REFRESH_TOKEN_KEY, token, authCookieOptions);
  }

  @Post('logout')
  @Auth(AuthType.BEARER)
  @HttpCode(HttpStatus.OK)
  async logout(
    @ActiveUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    this.clearRefreshCookie(res);
    return HttpStatus.OK;
  }

  @Post('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const authServiceRes = await this.authService.refreshTokens(refreshToken);
    this.putRefreshTokenInCookieJar(res, authServiceRes.refreshToken);
    return {
      accessToken: authServiceRes.accessToken,
      user: authServiceRes.user,
    };
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.OK)
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignUpDto,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.signUp(
      dto,
    );

    this.putRefreshTokenInCookieJar(res, refreshToken);

    const authResponseDto: AuthResponseDto = { accessToken, user };
    return authResponseDto;
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignInDto,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.signIn(
      dto,
    );

    this.putRefreshTokenInCookieJar(res, refreshToken);

    const authResponseDto: AuthResponseDto = { accessToken, user };
    return authResponseDto;
  }
}
