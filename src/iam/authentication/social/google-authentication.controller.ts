import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../decorators';
import { GoogleAuthenticationService } from './google-authentication.service';
import { GoogleOAuthDto } from './google-oauth.dto';

@Public()
@Controller('authentication/google')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthService: GoogleAuthenticationService,
  ) {}

  @Post()
  authenticate(@Body() dto: GoogleOAuthDto) {
    return this.googleAuthService.authenticate(dto.credential);
  }
}
