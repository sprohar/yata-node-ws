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
  async findAll(@Query() query: ProjectsQueryParams) {
    return await this.projectsService.findAll({
      skip: query.skip,
      take: query.take,
      where: {},
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
