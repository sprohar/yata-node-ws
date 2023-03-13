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
import { QueryParams } from '../dto/query-params.dto';
import { TasksQueryParams } from '../tasks/dto/tasks-query-params.dto';
import { Task } from '../tasks/entities/task.entity';
import { TasksService } from '../tasks/tasks.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsQueryParams } from './dto/projects-query-params.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    return await this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll(@Query() query: ProjectsQueryParams) {
    const { skip, take } = query;
    return await this.projectsService.findAll({
      skip: skip ? parseInt(skip) : QueryParams.SKIP_DEFAULT,
      take: take ? parseInt(take) : QueryParams.TAKE_DEFAULT,
      where: {},
      orderBy: {
        name: Prisma.SortOrder.asc,
      },
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new NotFoundException();
    }
    return project;
  }

  @Get(':id/tasks')
  async getProjectTasks(
    @Param('id', ParseIntPipe) projectId: number,
    @Query() query: TasksQueryParams,
  ) {
    const orderBy = {};
    orderBy[`${query.orderBy ?? Task.OrderBy.DEFAULT}`] =
      query.dir ?? Prisma.SortOrder.desc;

    let where: Prisma.TaskWhereInput = {
      projectId,
    };

    if (query.title) {
      where = {
        ...where,
        content: {
          contains: query.title,
        },
      };
    }
    if (query.priority) {
      where = {
        ...where,
        priority: query.priority,
      };
    }

    const { skip, take } = query;
    return await this.tasksService.findAll({
      skip: skip ? parseInt(skip) : QueryParams.SKIP_DEFAULT,
      take: take ? parseInt(take) : QueryParams.TAKE_DEFAULT,
      where,
      orderBy,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const project = await this.projectsService.update(id, updateProjectDto);
    if (!project) {
      throw new NotFoundException();
    }

    return project;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const project = await this.projectsService.remove(id);
    if (!project) {
      throw new NotFoundException();
    }

    return HttpStatus.NO_CONTENT;
  }
}
