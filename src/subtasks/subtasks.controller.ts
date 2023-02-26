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
import { TasksQueryParams } from '../tasks/dto/tasks-query-params.dto';
import { Task } from '../tasks/entities/task.entity';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { SubtasksService } from './subtasks.service';

@ApiTags('Subtasks')
@Controller('/tasks/:taskId/subtasks')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Post()
  async create(@Body() createSubtaskDto: CreateSubtaskDto) {
    const subtask = await this.subtasksService.create(createSubtaskDto);
    if (!subtask) {
      throw new BadRequestException();
    }

    return subtask;
  }

  @Get()
  async findAll(
    @Param('taskId', ParseIntPipe) taskId,
    @Query() query: TasksQueryParams,
  ) {
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const subtask = await this.subtasksService.findOne(id);
    if (!subtask) {
      throw new NotFoundException();
    }
    return subtask;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ) {
    const subtask = await this.subtasksService.update(id, updateSubtaskDto);
    if (!subtask) {
      throw new NotFoundException();
    }
    return subtask;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const subtask = await this.subtasksService.remove(id);
    if (!subtask) {
      throw new NotFoundException();
    }

    return HttpStatus.NO_CONTENT;
  }
}
