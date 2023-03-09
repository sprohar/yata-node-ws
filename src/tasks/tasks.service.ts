import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PaginatedList } from 'src/interfaces/paginated-list.interface';
import { threadId } from 'worker_threads';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.prisma.task.create({
      data: createTaskDto,
      include: {
        subtasks: true,
      },
    });
  }

  async duplicate(taskId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    const subtasks = await this.prisma.subtask.findMany({
      where: {
        taskId,
      },
    });

    delete task.id;
    subtasks.forEach((subtask) => delete subtask.id && delete subtask.taskId);

    return await this.prisma.task.create({
      data: {
        ...task,
        subtasks: {
          createMany: {
            data: subtasks,
          },
        },
      },
      include: {
        subtasks: true,
      }
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<PaginatedList<Task>> {
    const count = await this.prisma.task.count({
      where: params.where,
    });

    const tasks = await this.prisma.task.findMany({
      where: params.where,
      include: {
        subtasks: true,
      },
      skip: +params.skip,
      take: +params.take,
      orderBy: params.orderBy,
    });

    // Remove undefined and null fields
    tasks.forEach((task) => {
      Object.keys(task).forEach((key) => task[key] == null && delete task[key]);
      if (task.subtasks.length) {
        task.subtasks.forEach((subtask) => {
          Object.keys(subtask).forEach(
            (key) => subtask[key] == null && delete subtask[key],
          );
        });
      }
    });

    return {
      pageIndex: params.skip,
      pageSize: params.take,
      count,
      data: tasks,
    };
  }

  async findOne(params: { where: Prisma.TaskWhereInput }): Promise<Task> {
    const { where } = params;
    return await this.prisma.task.findFirst({
      where,
      include: {
        subtasks: true,
      },
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return await this.prisma.task.update({
      where: {
        id,
      },
      data: updateTaskDto,
      include: {
        subtasks: true,
      },
    });
  }

  /**
   * @see https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#delete
   * @param where
   * @returns The Task that was deleted or `null` if the record was not found.
   */
  async remove(id: number): Promise<Task> {
    return await this.prisma.task.delete({
      where: { id },
    });
  }

  async exists(id: number) {
    const count = await this.prisma.task.count({ where: { id } });
    return count > 0;
  }
}
