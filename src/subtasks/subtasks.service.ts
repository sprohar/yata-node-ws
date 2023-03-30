import { Injectable } from '@nestjs/common';
import { Prisma, Subtask } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubtaskDto: CreateSubtaskDto): Promise<Subtask | null> {
    return await this.prisma.subtask.create({
      data: createSubtaskDto,
    });
  }

  async findAll(params: {
    skip: number;
    take: number;
    cursor?: Prisma.SubtaskWhereUniqueInput;
    where?: Prisma.SubtaskWhereInput;
    orderBy?: Prisma.SubtaskOrderByWithRelationInput;
  }) {
    const count = await this.prisma.subtask.count({
      where: params.where,
    });

    const { skip, take, orderBy, where } = params;
    const subtasks = await this.prisma.subtask.findMany({
      where,
      skip,
      take: Math.min(take, QueryParams.MAX_TAKE),
      orderBy,
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

  async findOne(params: { where: Prisma.SubtaskWhereInput }) {
    const { where } = params;
    return await this.prisma.subtask.findFirst({
      where,
    });
  }

  async update(id: number, updateSubtaskDto: UpdateSubtaskDto) {
    return await this.prisma.subtask.update({
      data: updateSubtaskDto,
      where: {
        id,
      },
    });
  }

  async remove(params: {
    where: Prisma.SubtaskWhereUniqueInput
  }) {
    const { where } = params;

    return await this.prisma.subtask.delete({
      where
    });
  }
}
