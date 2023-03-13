import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { TasksService } from './tasks.service';

@ApiTags('Eisenhower')
@Controller('tasks')
export class EisenhowerMatrixController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getAll(@Query() query: QueryParams) {
    const { skip, take } = query;

    return await this.tasksService.findAll({
      skip: skip ? parseInt(skip) : QueryParams.SKIP_DEFAULT,
      take: take ? parseInt(take) : QueryParams.TAKE_DEFAULT,
      orderBy: {
        createdAt: Prisma.SortOrder.asc,
      },
    });
  }
}
