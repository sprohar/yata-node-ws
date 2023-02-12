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
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist/decorators';
import { Prisma } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksQueryParams } from './dto/tasks-query-params.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { TasksChronoQueryParamsDto } from './dto/tasks-chrono-query-params.dto';
import { Task } from './entities/task.entity';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    try {
      return await this.tasksService.create(createTaskDto);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Get()
  async findAll(@Query() query: TasksQueryParams) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 30;
    const orderBy = {};
    orderBy[`${query.orderBy ?? Task.OrderBy.DEFAULT}`] =
      query.dir ?? Prisma.SortOrder.asc;

    let where: Prisma.TaskWhereInput = {
      projectId: +query.projectId,
    };

    if (query.name) {
      where = {
        ...where,
        name: {
          contains: query.name,
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
  async filterByDate(@Query() query: TasksChronoQueryParamsDto) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 30;
    const orderBy = {};
    orderBy[`${query.orderBy ?? Task.OrderBy.DEFAULT}`] =
      query.dir ?? Prisma.SortOrder.asc;

    let where: Prisma.TaskWhereInput = {
      projectId: +query.projectId,
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.tasksService.findOne(id);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      return await this.tasksService.update(id, updateTaskDto);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.tasksService.remove(id);
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
