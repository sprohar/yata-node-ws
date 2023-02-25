import { Injectable } from '@nestjs/common';
import { Subtask } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubtaskDto: CreateSubtaskDto): Promise<Subtask | null> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: createSubtaskDto.taskId,
      }
    });
    
    if (!task) {
      return null;
    }

    return await this.prisma.subtask.create({
      data: createSubtaskDto
    })
  }

  findAll() {
    return `This action returns all subtasks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subtask`;
  }

  update(id: number, updateSubtaskDto: UpdateSubtaskDto) {
    return `This action updates a #${id} subtask`;
  }

  remove(id: number) {
    return `This action removes a #${id} subtask`;
  }
}
