import { Body, Controller, Patch } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ActiveUser } from '../iam/decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  async update(@ActiveUser('sub') userId: string, @Body() dto: UpdateUserDto) {
    return await this.usersService.update({
      where: {
        id: userId,
      },
      data: {
        username: dto.username,
        preferences: dto.preferences as Prisma.JsonObject,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
