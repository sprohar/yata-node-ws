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
import { TasksQueryParams } from './dto/tasks-query-params.dto';
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
    const projectExists = await this.projectsService.exists({
      where: {
        id: projectId,
      }
    });

    if (!projectExists) {
      throw new BadRequestException('Project does not exist.');
    }

    return await this.tasksService.create(createTaskDto);
  }

  @Get()
  async getAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: TasksQueryParams,
  ) {
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

    const { skip, take } = query;
    return await this.tasksService.findAll({
      skip: skip ? parseInt(skip) : QueryParams.SKIP_DEFAULT,
      take: take ? parseInt(take) : QueryParams.TAKE_DEFAULT,
      where,
      orderBy,
      include: {
        subtasks: true,
      }
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

  @Post(':id/duplicate')
  async duplicate(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) taskId: number,
  ) {
    const projectExists = await this.projectsService.exists({
      where: {
        id: projectId,
      }
    });

    if (!projectExists) {
      throw new BadRequestException();
    }

    const taskExists = await this.tasksService.exists(taskId);
    if (!taskExists) {
      throw new BadRequestException();
    }

    try {
      return this.tasksService.duplicate(taskId);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Patch(':id')
  async update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const projectExists = await this.projectsService.exists({
      where: {
        id: projectId,
      }
    });

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
    const projectExists = await this.projectsService.exists({
      where: {
        id: projectId,
      }
    });
    
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
