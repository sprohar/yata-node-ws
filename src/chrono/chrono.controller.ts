import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { ActiveUser } from '../iam/decorators';
import { TaskAttributes } from '../tasks/task-attributes';
import { ChronoQueryParams } from './chrono-query-params';
import { ChronoService } from './chrono.service';

@Controller('chrono')
export class ChronoController {
  constructor(private chronoService: ChronoService) {}

  @Get('tasks')
  async getTasks(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Query() query: ChronoQueryParams,
  ) {
    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [query.orderBy ?? TaskAttributes.OrderBy.DUE_DATE]:
        query.dir ?? Prisma.SortOrder.asc,
    };

    const where: Prisma.TaskWhereInput = {
      userId,
    };

    if (query.startDate && query.endDate) {
      where.dueDate = {
        gte: query.startDate,
        lte: query.endDate,
      };
    } else if (query.startDate) {
      where.dueDate = {
        gte: query.startDate,
      };
    } else if (query.endDate) {
      where.dueDate = {
        lte: query.endDate,
      };
    }

    return await this.chronoService.getTasks({
      where,
      orderBy,
      skip: query.skip ? +query.skip : QueryParams.SKIP_DEFAULT,
      take: query.take
        ? Math.min(+query.take, QueryParams.MAX_TAKE)
        : QueryParams.TAKE_DEFAULT,
    });
  }
}
