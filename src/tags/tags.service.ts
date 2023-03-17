import { Injectable } from '@nestjs/common';
import { Prisma, Tag } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { PaginatedList } from '../interfaces/paginated-list.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(args: Prisma.TagCreateArgs) {
    return await this.prisma.tag.create(args);
  }

  async findAll(params: Prisma.TagFindManyArgs): Promise<PaginatedList<Tag>> {
    const { skip, take, orderBy } = params;
    const count = await this.prisma.tag.count();
    const data = await this.prisma.tag.findMany({
      skip,
      take: take < QueryParams.TAKE_MAX ? take : QueryParams.TAKE_DEFAULT,
      orderBy,
    });

    return {
      pageIndex: skip + 1,
      pageSize: take,
      count,
      data,
    };
  }

  async findOne(args: Prisma.TagFindFirstArgs) {
    return await this.prisma.tag.findFirst(args);
  }

  async update(args: Prisma.TagUpdateArgs) {
    return this.prisma.tag.update(args);
  }

  async remove(args: Prisma.TagDeleteArgs) {
    return await this.prisma.tag.delete(args);
  }

  async exists(args: Prisma.TagCountArgs) {
    const count = await this.prisma.tag.count(args);
    return count > 0;
  }
}
