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
    const projectExists =
      (await this.prisma.project.count({
        where: { id: createTaskDto.projectId },
      })) != 0;
    if (!projectExists) {
      return null;
    }
    return this.prisma.task.create({
      data: createTaskDto,
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

    const data = await this.prisma.task.findMany({
      where: params.where,
      skip: +params.skip,
      take: +params.take,
      orderBy: params.orderBy,
    });

    return {
      pageIndex: params.skip,
      pageSize: params.take,
      count,
      data,
    };
  }

  async findOne(id: number): Promise<Task> {
    return this.prisma.task.findFirst({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    if (!(await this.exists(id))) {
      return null;
    }
    return this.prisma.task.update({
      where: {
        id,
      },
      data: updateTaskDto,
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
}
