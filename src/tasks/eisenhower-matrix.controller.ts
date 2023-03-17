import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { TasksService } from './tasks.service';
import { ActiveUser } from '../iam/decorators/active-user.decorator';

@ApiTags('Eisenhower')
@Controller('tasks')
export class EisenhowerMatrixController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getAll(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Query() query: QueryParams) {
    const { skip, take } = query;

    return await this.tasksService.findAll({
      skip: skip ? parseInt(skip) : QueryParams.SKIP_DEFAULT,
      take: take ? parseInt(take) : QueryParams.TAKE_DEFAULT,
      orderBy: {
        createdAt: Prisma.SortOrder.asc,
      },
      where: {
        userId,
      }
    });
  }
}
