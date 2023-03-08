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
import { QueryParams } from '../dto/query-params.dto';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksChronoQueryParamsDto } from './dto/tasks-chrono-query-params.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  async create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const projectExists = await this.projectsService.exists(projectId);
    if (!projectExists) {
      throw new BadRequestException('Project does not exist.');
    }

    return await this.tasksService.create(createTaskDto);
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
  async getTodaysTasks(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: QueryParams,
  ) {
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
        projectId,
        dueDate: {
          lte: upperBound,
          gte: lowerBound,
        },
      },
    });
  }

  @Get(':id')
  async findOne(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      return await this.tasksService.findOne({
        where: {
          id,
          projectId,
        },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Patch(':id')
  async update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const projectExists = await this.projectsService.exists(projectId);
    if (!projectExists) {
      throw new BadRequestException();
    }

    if (updateTaskDto.completed) {
      updateTaskDto.completedOn = new Date().toISOString();
    } else if (
      updateTaskDto.completed !== undefined &&
      !updateTaskDto.completed
    ) {
      updateTaskDto.completedOn = null;
    }

    try {
      return await this.tasksService.update(id, updateTaskDto);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const projectExists = await this.projectsService.exists(projectId);
    if (!projectExists) {
      throw new BadRequestException();
    }

    try {
      return await this.tasksService.remove(id);
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
