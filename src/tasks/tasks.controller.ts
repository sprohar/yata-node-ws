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
  Query,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ApiTags } from '@nestjs/swagger/dist/decorators';
import { Prisma } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksChronoQueryParamsDto } from './dto/tasks-chrono-query-params.dto';
import { TasksQueryParams } from './dto/tasks-query-params.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(createTaskDto);
    if (!task) {
      throw new BadRequestException('Project does not exist.');
    }
    return task;
  }

  @Get()
  async findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: TasksQueryParams,
  ) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 30;
    const orderBy = {};
    orderBy[`${query.orderBy ?? Task.OrderBy.DEFAULT}`] =
      query.dir ?? Prisma.SortOrder.desc;

    let where: Prisma.TaskWhereInput = {
      projectId,
    };

    if (query.title) {
      where = {
        ...where,
        content: {
          contains: query.title,
        },
      };
    }
    if (query.priority) {
      where = {
        ...where,
        priority: query.priority,
      };
    }

    return await this.tasksService.findAll({
      skip,
      take,
      where,
      orderBy,
    });
  }

  @Get('chrono')
  async filterByDate(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: TasksChronoQueryParamsDto,
  ) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 30;
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

  @Get(':taskId')
  async findOne(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    const task = await this.tasksService.findOne(taskId);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }

  @Patch(':taskId')
  async update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    if (updateTaskDto.completed) {
      updateTaskDto.completedOn = new Date().toISOString();
    }

    const task = await this.tasksService.update(taskId, updateTaskDto);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    const task = await this.tasksService.remove(taskId);
    if (!task) {
      throw new NotFoundException();
    }
    return HttpStatus.NO_CONTENT;
  }
}
