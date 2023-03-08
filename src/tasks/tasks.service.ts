import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PaginatedList } from 'src/interfaces/paginated-list.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const projectExists = await this.projectExists(createTaskDto.projectId);
    if (!projectExists) {
      return null;
    }

    return this.prisma.task.create({
      data: createTaskDto,
      include: {
        subtasks: true,
      },
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

  async findOne(id: number): Promise<Task> {
    return this.prisma.task.findFirst({
      where: {
        id,
      },
      include: {
        subtasks: true,
      },
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    if (!(await this.exists(id))) {
      return null;
    }
    if (updateTaskDto.completed != undefined && !updateTaskDto.completed) {
      updateTaskDto.completedOn = null;
    }

    return this.prisma.task.update({
      where: {
        id,
      },
      data: updateTaskDto,
      include: {
        subtasks: true,
      },
    });
  }

  async remove(id: number): Promise<Task> {
    if (!(await this.exists(id))) {
      return null;
    }

    return this.prisma.task.delete({
      where: {
        id,
      },
    });
  }

  async exists(id: number): Promise<boolean> {
    return (await this.prisma.task.count({ where: { id } })) != 0;
  }

  private async projectExists(projectId: number) {
    const count = await this.prisma.project.count({
      where: {
        id: projectId,
      },
    });

    return count !== 0;
  }
}
