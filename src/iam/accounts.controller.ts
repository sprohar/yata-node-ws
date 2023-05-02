import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { ActiveUser } from './decorators';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(
    private readonly tokenStorage: RefreshTokenIdsStorage,
    private readonly usersService: UsersService,
  ) {}

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async delete(@ActiveUser('sub') userId: string) {
    try {
      await this.usersService.delete({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });
      this.logger.log(`Success: deleted user ${userId}`);

      await this.tokenStorage.invalidate(userId);
      this.logger.log(`Success: invalidated refresh token ${userId}`);

      return HttpStatus.OK;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException();
    }
  }
}
