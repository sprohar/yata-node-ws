import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { Auth } from './decorators';
import { SignInDto, SignUpDto } from './dto';
import { AuthType } from './enums';
import { COOKIE_REFRESH_TOKEN_KEY } from '../iam.constants';

@ApiTags('Authentication')
@Auth(AuthType.NONE)
@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() request: Request) {
    if (!request.cookies) {
      throw new UnauthorizedException();
    }

    const refreshToken = request.cookies[COOKIE_REFRESH_TOKEN_KEY];
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('sign-up')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignInDto,
  ) {
    const { accessToken, refreshToken } = await this.authService.signIn(dto);
    res.cookie(COOKIE_REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
    });

    return {
      accessToken,
    };
  }
}
