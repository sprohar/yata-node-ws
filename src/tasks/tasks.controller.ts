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
import { CreateTaskDto, UpdateTaskDto, TasksQueryParams } from './dto';
import { Task } from './entities/task.entity';
import { TaskRecurrence } from './recur/task-recurrence';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) { }

  private ensureValidRecurrence(dto: CreateTaskDto) {
    if (dto.recurrence && dto.startDate) {
      if (dto.recurrence.count !== undefined && dto.endDate) {
        return;
      }
      if (dto.recurrence.count && dto.endDate === undefined) {
        throw new BadRequestException('"endDate" is undefined');
      }
    }

    throw new BadRequestException('"startDate" is undefined');
  }

  private async ensureProjectExists(projectId: number, userId: number) {
    const projectExists = await this.projectsService.exists({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!projectExists)
      throw new BadRequestException('Project does not exist.');
  }

  @Post()
  async create(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    await this.ensureProjectExists(projectId, userId);

    let recurrencePattern: string | null = null;
    if (createTaskDto.recurrence) {
      this.ensureValidRecurrence(createTaskDto);
      recurrencePattern = TaskRecurrence.toPattern(createTaskDto.recurrence);
    }

    const selectedTags = createTaskDto.tags;
    const newTags = selectedTags?.filter((t) => t.id === undefined);

    delete createTaskDto.tags;
    delete createTaskDto.recurrence;

    const task = await this.tasksService.create({
      data: {
        ...createTaskDto,
        userId,
        recurrencePattern,
        tags: {
          connect: !selectedTags
            ? undefined
            : selectedTags
              .filter((t) => t.id !== undefined)
              .map((t) => ({ id: t.id })),
          create: !newTags
            ? undefined
            : newTags.map((tag) => ({ ...tag, userId })),
        },
      },
      include: {
        tags: selectedTags || newTags ? true : false,
      },
    });

    return {
      ...task,
      recurrence: TaskRecurrence.parse(task.recurrencePattern),
    } as Task;
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
        tags: true,
      },
    });

    if (task === null) {
      throw new NotFoundException();
    }

    if (!task.recurrencePattern) return task;

    return {
      ...task,
      recurrence: TaskRecurrence.parse(task.recurrencePattern),
    };
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
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.tasksService.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!task) {
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

    let recurrencePattern: string | null = null;
    if (updateTaskDto.recurrence) {
      recurrencePattern = TaskRecurrence.toPattern(updateTaskDto.recurrence);
    }

    delete updateTaskDto.recurrence;
    try {
      if (task.recurrencePattern !== recurrencePattern) {
        const updatedTask = await this.tasksService.update({
          data: {
            ...updateTaskDto,
            recurrencePattern,
          },
          where: {
            id,
          },
        });

        return {
          ...updatedTask,
          recurrence: TaskRecurrence.parse(updatedTask.recurrencePattern),
        } as Task;
      }

      const updatedTask = await this.tasksService.update({
        data: updateTaskDto,
        where: {
          id,
        },
      });

      return {
        ...updatedTask,
        recurrence: TaskRecurrence.parse(updatedTask.recurrencePattern),
      } as Task;
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
