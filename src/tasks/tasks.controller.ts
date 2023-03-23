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
import { Prisma, Tag } from '@prisma/client';
import { TagsService } from '../tags/tags.service';
import { QueryParams } from '../dto/query-params.dto';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
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
    private readonly tagsService: TagsService,
  ) { }

  @Post()
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

    const tagIds = createTaskDto.tagIds;
    if (tagIds === undefined) {
      return await this.tasksService.create({
        data: {
          ...createTaskDto,
          userId,
        },
      });
    }

    const ids: number[] = [];
    for (const id of tagIds) {
      const parsed = parseInt(id);
      if (isNaN(parsed)) throw new BadRequestException();
      ids.push(parsed);
    }

    const tags: Tag[] = [];
    for (const id of ids) {
      const tag = await this.tagsService.findOne({
        select: { id: true },
        where: {
          id,
        },
      });

      if (!tag) throw new BadRequestException();

      tags.push(tag);
    }

    delete createTaskDto.tagIds;
    await this.tasksService.create({
      data: {
        ...createTaskDto,
        userId,
        tags: {
          connect: tags,
        },
      },
    });
  }

  @Get()
  async getAll(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: TasksQueryParams,
  ) {
    const orderBy = {};
    orderBy[`${query.orderBy ?? Task.OrderBy.DEFAULT}`] =
      query.dir ?? Prisma.SortOrder.desc;

    let where: Prisma.TaskWhereInput = {
      projectId,
      userId,
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
      },
    });
  }

  @Get(':id')
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
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
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
          id,
        },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
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
