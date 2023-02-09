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
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsQueryParams } from './dto/projects-query-params.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

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
      skip: query.skip ?? 0,
      take: query.take ?? 30,
      where: {},
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.projectsService.findOne(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException();
      }
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    try {
      return await this.projectsService.update(id, updateProjectDto);
    } catch (error) {
      throw new NotFoundException();
      // if (error instanceof PrismaClientKnownRequestError) {
      //   if (error.code === 'P2025') {
      //   }
      // }
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.projectsService.remove(id);
      return HttpStatus.NO_CONTENT;
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
