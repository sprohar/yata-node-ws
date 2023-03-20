import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, pwd } = createUserDto;
    return await this.prisma.user.create({
      data: {
        email,
        pwd,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(args: Prisma.UserFindUniqueArgs) {
    return await this.prisma.user.findUnique(args);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
