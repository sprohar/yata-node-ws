import { Injectable } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { PaginatedList } from '../interfaces/paginated-list.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: createProjectDto,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProjectWhereUniqueInput;
    where: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
  }): Promise<PaginatedList<Project>> {
    if (!params.skip) {
      params.skip = 0;
    }
    if (!params.take) {
      params.take = 30;
    }
    if (!params.orderBy) {
      params.orderBy = {
        name: 'asc',
      };
    }

    const count = await this.prisma.project.count({
      where: params.where,
    });

    const data = await this.prisma.project.findMany(params);

    return {
      data,
      count,
      pageIndex: params.skip,
      pageSize: params.take,
    };
  }

  async findOne(id: number) {
    return this.prisma.project.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: {
        id,
      },
      data: updateProjectDto,
    });
  }

  async remove(id: number) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
