import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Priority } from './enum/priority.enum';
import { TaskAttributes } from './task-attributes';
import { TaskQueryParams } from './task-query-params';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const selectedTags = createTaskDto.tags ?? [];
    delete createTaskDto.tags;
    const newTags = selectedTags.filter((t) => t.id === undefined);
    try {
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
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Get()
  async getAll(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Query() query: TaskQueryParams,
  ) {
    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [query.orderBy ?? TaskAttributes.OrderBy.DUE_DATE]:
        query.dir ?? Prisma.SortOrder.asc,
    };

    const where: Prisma.TaskWhereInput = {
      userId,
      parentId: null,
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
    });
  }

  @Get(':id')
  async findOne(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const task = await this.tasksService.findOne({
      where: {
        id,
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

  @Post(':id/duplicate')
  async duplicate(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) taskId: number,
  ) {
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

  @Patch(':id')
  async update(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const taskExists = await this.tasksService.exists({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!taskExists) {
      throw new NotFoundException();
    }

    if (updateTaskDto.isCompleted) {
      updateTaskDto.completedAt = new Date().toISOString();
    } else if (
      updateTaskDto.isCompleted !== undefined &&
      !updateTaskDto.isCompleted
    ) {
      updateTaskDto.completedAt = null;
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

  @Delete(':id/tags/:tagId')
  async removeTagFromTask(
    @ActiveUser('sub', ParseIntPipe) _userId: number,
    @Param('id', ParseIntPipe) taskId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    try {
      return await this.tasksService.update({
        data: {
          tags: {
            disconnect: {
              id: tagId,
            },
          },
        },
        where: {
          id: taskId,
        },
        include: {
          subtasks: true,
          tags: true,
        },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  @Delete(':id')
  async remove(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const taskExists = await this.tasksService.exists({
      where: {
        id,
        userId,
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
