import { Injectable } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { QueryParams } from '../dto/query-params.dto';
import { PaginatedList } from '../interfaces/paginated-list.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: createProjectDto,
    });
  }

  async findAll(params: {
    skip: number;
    take: number;
    cursor?: Prisma.ProjectWhereUniqueInput;
    where: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
  }): Promise<PaginatedList<Project>> {
    if (!params.orderBy) {
      params.orderBy = {
        name: Prisma.SortOrder.asc,
      };
    }

    const count = await this.prisma.project.count({
      where: params.where,
    });

    params.skip = params.skip;
    params.take = Math.min(params.take, QueryParams.TAKE_MAX);
    const data = await this.prisma.project.findMany({
      ...params,
    });

    return {
      pageIndex: params.skip,
      pageSize: params.take,
      count,
      data,
    };
  }

  async findOne(id: number): Promise<Project> {
    return this.prisma.project.findFirst({
      where: {
        id,
      },
      include: {
        sections: true,
        tasks: true,
      },
    });
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    if (!(await this.exists(id))) {
      return null;
    }

    return this.prisma.project.update({
      where: {
        id,
      },
      include: {
        sections: true,
      },
      data: updateProjectDto,
    });
  }

  async remove(id: number): Promise<Project> {
    if (!(await this.exists(id))) {
      return null;
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.project.count({
      where: {
        id,
      },
    });

    return count > 0;
  }
}
