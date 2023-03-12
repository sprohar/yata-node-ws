import { Injectable } from '@nestjs/common';
import { Prisma, Tag } from '@prisma/client';
import { PaginatedList } from '../interfaces/paginated-list.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) { }

  async create(createTagDto: CreateTagDto) {
    return await this.prisma.tag.create({
      data: createTagDto,
    });
  }

  async findAll(params: Prisma.TagFindManyArgs): Promise<PaginatedList<Tag>> {
    const { skip, take, orderBy } = params;
    const count = await this.prisma.tag.count();
    const data = await this.prisma.tag.findMany({
      skip, take, orderBy
    });

    return {
      pageIndex: skip + 1,
      pageSize: take,
      count,
      data,
    };
  }

  async findOne(id: number) {
    return await this.prisma.tag.findUnique({
      where: {
        id,
      }
    })
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    return this.prisma.tag.update({
      where: {
        id, 
      },
      data: updateTagDto,
    })
  }

  async remove(id: number) {
    return await this.prisma.tag.delete({
      where: {
        id,
      }
    })
  }

  async exists(id: number) {
    const count = await this.prisma.tag.count({
      where: {
        id,
      }
    });

    return count > 0;
  }
}
