import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma, Task } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { PaginatedList } from '../interfaces/paginated-list.interface';
import { PrismaService } from '../prisma/prisma.service';
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

    const from = lowerBound.toISOString();
    const to = upperBound.toISOString();

    const skip: number = query.skip ? +query.skip : QueryParams.SKIP_DEFAULT;
    const take: number = query.take ? +query.take : QueryParams.TAKE_DEFAULT;
    const prisma: PrismaService = this.tasksService.db();
    const count: number = await prisma.$executeRaw`
        SELECT COUNT(id) FROM task 
        WHERE due_date 
          BETWEEN 
            TO_TIMESTAMP(${from}, 'YYYY-MM-DD') 
              AND 
            TO_TIMESTAMP(${to}, 'YYYY-MM-DD')`;

    const resultSet: Array<Task> = await prisma.$queryRaw`
        SELECT 
          id, 
          title,
          content,
          priority,
          completed,
          deleted,
          all_day AS "allDay",
          due_date AS "dueDate",
          completed_on AS "completedOn",
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          project_id AS "projectId",
          section_id AS "sectionId",
          user_id AS "userId"
        FROM task 
        WHERE due_date 
          BETWEEN 
            TO_TIMESTAMP(${from}, 'YYYY-MM-DD') 
              AND 
            TO_TIMESTAMP(${to}, 'YYYY-MM-DD') 
        ORDER BY due_date ASC 
        LIMIT ${take} 
        OFFSET ${skip};`;

    return {
      pageIndex: skip,
      pageSize: take,
      count,
      data: resultSet,
    } as PaginatedList<Task>;
  }
}
