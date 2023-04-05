import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { Priority } from '../tasks/enum/priority.enum';
import { TaskAttributes } from '../tasks/task-attributes';
import { TasksService } from '../tasks/tasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { SubtasksService } from './subtasks.service';

@ApiTags('Subtasks')
@Controller('tasks/:taskId/subtasks')
export class SubtasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly subtasksService: SubtasksService,
  ) {}

  @Post()
  async create(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ) {
    const taskExists = await this.tasksService.exists({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!taskExists) {
      throw new BadRequestException();
    }

    try {
      return await this.subtasksService.create(createSubtaskDto);
    } catch (error) {
      console.error(error);
      throw new BadRequestException();
    }
  }

  @Get()
  async getSubtasks(
    @Param('id', ParseIntPipe) taskId: number,
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Query('orderBy') orderBy = TaskAttributes.OrderBy.CREATED_AT,
    @Query('dir') dir = Prisma.SortOrder.desc,
    @Query('skip') skip = 0,
    @Query('take') take = QueryParams.TAKE_DEFAULT,
    @Query('priority') priority?: Priority,
    @Query('title') title?: string,
  ) {
    const taskExists = await this.tasksService.exists({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!taskExists) {
      throw new BadRequestException();
    }

    const where: Prisma.SubtaskWhereInput = {
      taskId,
    };

    if (priority) {
      if (!Object.values(Priority).includes(priority)) {
        throw new BadRequestException();
      }
      where.priority = priority;
    }
    if (title) {
      where.title = {
        contains: title,
      };
    }

    return await this.subtasksService.findAll({
      skip: skip,
      take: Math.min(take, QueryParams.MAX_TAKE),
      where,
      orderBy: {
        [orderBy]: dir,
      },
    });
  }

  @Get(':id')
  async findOne(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      return await this.subtasksService.findOne({
        where: {
          id,
          taskId,
        },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Patch(':id')
  async update(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ) {
    const taskExists = await this.tasksService.exists({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!taskExists) {
      throw new BadRequestException();
    }

    try {
      return await this.subtasksService.update(id, updateSubtaskDto);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.subtasksService.remove({
        where: {
          id,
        },
      });
      return HttpStatus.NO_CONTENT;
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
