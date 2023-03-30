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
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ProjectsService } from '../projects/projects.service';
import { TaskAttributes } from './attributes';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Priority } from './enum/priority.enum';
import { TaskQueryParams } from './task-query-params';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller()
export class TasksController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  @Post('projects/:projectId/tasks')
  async create(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const projectExists = await this.projectsService.exists({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!projectExists)
      throw new BadRequestException('Project does not exist.');

    const selectedTags = createTaskDto.tags ?? [];
    delete createTaskDto.tags;
    const newTags = selectedTags.filter((t) => t.id === undefined);

    return await this.tasksService.create({
      data: {
        ...createTaskDto,
        userId,
        tags: {
          connect: selectedTags
            .filter((t) => t.id !== undefined)
            .map((t) => ({ id: t.id })),
          create: newTags.map((tag) => ({ ...tag, userId })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  @Get('tasks')
  async getAll(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Query() query: TaskQueryParams,
  ) {
    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [query.orderBy ?? TaskAttributes.OrderBy.CREATED_AT]:
        query.dir ?? Prisma.SortOrder.asc,
    };

    const where: Prisma.TaskWhereInput = {
      userId,
    };

    if (query.priority) {
      if (!Object.values(Priority).includes(+query.priority)) {
        throw new BadRequestException();
      }
      where.priority = +query.priority as Priority;
    }
    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.title) {
      where.title = {
        contains: query.title,
      };
    }

    // date strings are in ISO format & take precedence over numeric timestamps
    if (query.startDate || query.endDate) {
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
    } else if (query.from || query.to) {
      const from = +query.from;
      const to = +query.to;

      if (from && to) {
        where.dueDate = {
          gte: new Date(from).toISOString(),
          lte: new Date(to).toISOString(),
        };
      } else if (from) {
        where.dueDate = {
          gte: new Date(from).toISOString(),
        };
      } else if (to) {
        where.dueDate = {
          lte: new Date(to).toISOString(),
        };
      }
    }

    return await this.tasksService.findAll({
      skip: query.skip,
      take: Math.min(query.take, QueryParams.MAX_TAKE),
      where,
      orderBy,
      include: {
        subtasks: true,
      },
    });
  }

  @Get('projects/:projectId/tasks/:id')
  async findOne(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const task = await this.tasksService.findOne({
      where: {
        id,
        projectId,
        userId,
      },
      include: {
        subtasks: true,
        tags: true,
      },
    });

    if (task === null) {
      throw new NotFoundException();
    }

    return task;
  }

  @Post('projects/:projectId/tasks/:id/duplicate')
  async duplicate(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) taskId: number,
  ) {
    const projectExists = await this.projectsService.exists({
      where: {
        id: projectId,
      },
    });

    if (!projectExists) {
      throw new BadRequestException();
    }

    const taskExists = await this.tasksService.exists({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!taskExists) {
      throw new NotFoundException();
    }

    try {
      return await this.tasksService.duplicate(taskId);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Patch('projects/:projectId/tasks/:id')
  async update(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const taskExists = await this.tasksService.exists({
      where: {
        id: taskId,
        userId,
        projectId,
      },
    });

    if (!taskExists) {
      throw new NotFoundException();
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
      return await this.tasksService.update({
        data: updateTaskDto,
        where: {
          id: taskId,
        },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Delete('projects/:projectId/tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const taskExists = await this.tasksService.exists({
      where: {
        id,
        userId,
        projectId,
      },
    });

    if (!taskExists) {
      throw new NotFoundException();
    }

    try {
      return await this.tasksService.remove({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
