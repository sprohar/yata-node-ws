import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // @Get(':id')
  // async findOne(
  //   @ActiveUser('sub') sub: string,
  //   @Param('id') userId: string,
  // ) {
  //   try {
  //     return await this.usersService.findOne({
  //       where: {
  //         userId,
  //       },
  //       select: {
  //         id: true,
  //         email: true,
  //         username: true,
  //         createdAt: true,
  //         updatedAt: true,
  //       },
  //     });
  //   } catch (error) {
  //     throw new NotFoundException();
  //   }
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
