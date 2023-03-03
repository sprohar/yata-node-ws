import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ApiTags } from '@nestjs/swagger/dist/decorators';
import { Prisma } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { SubtasksService } from '../subtasks/subtasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksChronoQueryParamsDto } from './dto/tasks-chrono-query-params.dto';
import { TasksQueryParams } from './dto/tasks-query-params.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly subtasksService: SubtasksService,
  ) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.tasksService.create(createTaskDto);
    if (!task) {
      throw new BadRequestException('Project does not exist.');
    }
    return task;
  }

  @Get('chrono')
  async filterByDate(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: TasksChronoQueryParamsDto,
  ) {
    const skip = query.skip ?? QueryParams.SKIP_DEFAULT;
    const take = query.take ?? QueryParams.TAKE_DEFAULT;
    const orderBy: { [key: string]: string } = {};
    orderBy[`${query.orderBy ?? Task.OrderBy.DEFAULT}`] =
      query.dir ?? Prisma.SortOrder.asc;

    let where: Prisma.TaskWhereInput = {
      projectId,
    };

    if (query.start && query.end) {
      where = {
        ...where,
        dueDate: {
          gte: query.start,
          lte: query.end,
        },
      };
    } else if (query.start && !query.end) {
      where = {
        ...where,
        dueDate: {
          gte: query.start,
        },
      };
    } else if (!query.start && query.end) {
      where = {
        ...where,
        dueDate: {
          lte: query.end,
        },
      };
    }

    return await this.tasksService.findAll({
      skip,
      take,
      where,
      orderBy,
    });
  }

  @Get('chrono/today')
  async getTodaysTasks(@Query() query: QueryParams) {
    const skip = query.skip ?? QueryParams.SKIP_DEFAULT;
    const take = query.take ?? QueryParams.TAKE_DEFAULT;
    const upperBound = new Date();
    upperBound.setHours(23);
    upperBound.setMinutes(59);
    upperBound.setSeconds(0);

    const lowerBound = new Date();
    lowerBound.setHours(0);
    lowerBound.setMinutes(0);
    lowerBound.setSeconds(0);

    return await this.tasksService.findAll({
      skip,
      take,
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }

  @Get(':id/subtask')
  async getSubtasks(@Param('id', ParseIntPipe) taskId: number, @Query() query: TasksQueryParams) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 30;
    const orderBy = {};
    orderBy[`${query.orderBy ?? Task.OrderBy.DEFAULT}`] =
      query.dir ?? Prisma.SortOrder.desc;

    return await this.subtasksService.findAll({
      skip,
      take,
      where: {
        taskId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    if (updateTaskDto.completed) {
      updateTaskDto.completedOn = new Date().toISOString();
    }

    const task = await this.tasksService.update(id, updateTaskDto);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const task = await this.tasksService.remove(id);
    if (!task) {
      throw new NotFoundException();
    }

    return HttpStatus.NO_CONTENT;
  }
}
