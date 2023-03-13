import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { TasksService } from '../tasks/tasks.service';
import { ChronoQueryParams } from './chrono-query-params';

@ApiTags('Chrono')
@Controller('chrono')
export class ChronoController {
  constructor(private tasksService: TasksService) {}

  private timespanPredicate(query: ChronoQueryParams): Prisma.TaskWhereInput {
    const { from, to } = query;

    if (from && to) {
      return {
        dueDate: {
          gte: new Date(+from).toISOString(),
          lte: new Date(+to).toISOString(),
        },
      };
    }

    if (from && !to) {
      return {
        dueDate: {
          gte: new Date(+from).toISOString(),
        },
      };
    }

    return {
      dueDate: {
        lte: new Date(+to).toISOString(),
      },
    };
  }

  @Get('tasks')
  async getWithinTimeSpan(@Query() query: ChronoQueryParams) {
    const { from, to } = query;
    if (from === undefined && to === undefined) {
      return [];
    }

    const { skip, take } = query;
    return await this.tasksService.findAll({
      where: this.timespanPredicate(query),
      orderBy: {
        dueDate: Prisma.SortOrder.asc,
      },
      skip: skip ? parseInt(skip) : QueryParams.SKIP_DEFAULT,
      take: take ? parseInt(take) : QueryParams.TAKE_DEFAULT,
    });
  }

  @Get('today/tasks')
  async getTodaysTasks(@Query() query: QueryParams) {
    const upperBound = new Date();
    upperBound.setHours(23);
    upperBound.setMinutes(59);
    upperBound.setSeconds(0);

    const lowerBound = new Date();
    lowerBound.setHours(0);
    lowerBound.setMinutes(0);
    lowerBound.setSeconds(0);

    const { skip, take } = query;
    return await this.tasksService.findAll({
      skip: skip ? parseInt(skip) : QueryParams.SKIP_DEFAULT,
      take: take ? parseInt(take) : QueryParams.TAKE_DEFAULT,
      orderBy: {
        dueDate: Prisma.SortOrder.asc,
      },
      where: {
        dueDate: {
          lte: upperBound,
          gte: lowerBound,
        },
      },
    });
  }
}
