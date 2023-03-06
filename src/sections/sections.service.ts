import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSectionDto: CreateSectionDto) {
    try {
      return await this.prisma.section.create({
        data: createSectionDto,
      });
    } catch (error) {
      return null;
    }
  }

  async findAll(params: {
    where: Prisma.SectionWhereInput;
    orderBy?: Prisma.SectionOrderByWithRelationInput;
  }) {
    return await this.prisma.section.findMany({
      where: params.where,
    });
  }

  async findOne(id: number) {
    return await this.prisma.section.findFirst({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateSectionDto: UpdateSectionDto) {
    const section = await this.prisma.section.findFirst({ where: { id }});
    if (!section) {
      return;
    }

    try {
      if (section.projectId !== updateSectionDto.projectId) {
        // Move section and its tasks to a different project
        await this.prisma.task.updateMany({
          where: {
            sectionId: section.id,
          },
          data: {
            projectId: updateSectionDto.projectId,
          }
        })
      }

      return await this.prisma.section.update({
        where: {
          id,
        },
        data: updateSectionDto,
      });
    } catch (error) {
      return null;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.section.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      return null;
    }
  }
}
