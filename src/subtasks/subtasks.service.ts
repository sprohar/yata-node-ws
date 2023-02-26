import { Injectable } from '@nestjs/common';
import { Prisma, Subtask } from '@prisma/client';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubtaskDto: CreateSubtaskDto): Promise<Subtask | null> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: createSubtaskDto.taskId,
      },
    });

    if (!task) {
      return null;
    }

    return await this.prisma.subtask.create({
      data: createSubtaskDto,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SubtaskWhereUniqueInput;
    where?: Prisma.SubtaskWhereInput;
    orderBy?: Prisma.SubtaskOrderByWithRelationInput;
  }) {
    const count = await this.prisma.subtask.count({
      where: params.where,
    });

    const subtasks = await this.prisma.subtask.findMany({
      where: params.where,
      skip: +params.skip,
      take: +params.take,
      orderBy: params.orderBy,
    });

    // Remove undefined and null fields
    subtasks.forEach((subtask) => {
      Object.keys(subtask).forEach(
        (key) => subtask[key] == null && delete subtask[key],
      );
    });

    return {
      pageIndex: params.skip,
      pageSize: params.take,
      count,
      data: subtasks,
    };
  }

  findOne(id: number) {
    return this.prisma.subtask.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateSubtaskDto: UpdateSubtaskDto) {
    try {
      if (updateSubtaskDto.completed) {
        updateSubtaskDto.completedOn = new Date().toISOString();
      }
      return await this.prisma.subtask.update({
        data: updateSubtaskDto,
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const clientError: PrismaClientKnownRequestError = error;
        if (clientError.code === 'P2025') {
          console.error(`Could not update Subtask. Subtask ${id} does not exist.`);
        }
      }

      return null;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.subtask.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        const clientError: PrismaClientKnownRequestError = error;
        if (clientError.code === 'P2025') {
          console.error(`Could not delete Subtask. Subtask ${id} does not exist.`);
        }
      }

      return null;
    }
  }
}
