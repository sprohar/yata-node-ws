import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PaginatedList } from '../interfaces/paginated-list.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChronoService {
  constructor(private prisma: PrismaService) {}

  async getTasks(args: Prisma.TaskFindManyArgs): Promise<PaginatedList<Task>> {
    const count = await this.prisma.task.count({
      where: args.where,
    });

    const data = await this.prisma.task.findMany(args);

    return {
      pageIndex: args.skip,
      pageSize: args.take,
      count,
      data,
    };
  }
}
