import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist';
import { Prisma } from '@prisma/client';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/active-user-data';
import { QueryParams } from '../dto/query-params.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsQueryParams } from './dto/projects-query-params.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    return await this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Query() query: ProjectsQueryParams,
  ) {
    const { skip, take } = query;
    return await this.projectsService.findAll({
      skip: skip ? parseInt(skip) : QueryParams.SKIP_DEFAULT,
      take: take ? parseInt(take) : QueryParams.TAKE_DEFAULT,
      where: {
        userId,
      },
      orderBy: {
        name: Prisma.SortOrder.asc,
      },
    });
  }

  @Get(':id')
  async findOne(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const project = await this.projectsService.findOne({
      where: {
        id,
        userId,
      },
      include: {
        sections: true,
        tasks: true,
      },
    });

    if (!project) {
      throw new NotFoundException();
    }

    return project;
  }

  @Patch(':id')
  async update(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const projectExists = await this.projectsService.exists({
      where: {
        id,
        userId,
      },
    });

    if (!projectExists) {
      throw new NotFoundException();
    }

    const project = await this.projectsService.update(id, updateProjectDto);
    if (!project) {
      throw new NotFoundException();
    }

    return project;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const projectExists = await this.projectsService.exists({
      where: {
        id,
        userId,
      },
    });

    if (!projectExists) {
      throw new NotFoundException();
    }

    const project = await this.projectsService.remove(id);
    if (!project) {
      throw new NotFoundException();
    }

    return HttpStatus.NO_CONTENT;
  }
}
