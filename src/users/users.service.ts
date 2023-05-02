import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(args: Prisma.UserCreateArgs) {
    return await this.prisma.user.create(args);
  }

  delete(args: Prisma.UserDeleteArgs) {
    return this.prisma.user.delete(args);
  }

  async findOne(args: Prisma.UserFindUniqueArgs) {
    return await this.prisma.user.findUnique(args);
  }

  async update(args: Prisma.UserUpdateArgs) {
    return this.prisma.user.update(args);
  }
}
