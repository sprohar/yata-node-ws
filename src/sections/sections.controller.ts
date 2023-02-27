import {
  BadRequestException,
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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionsService } from './sections.service';

@ApiTags('Sections')
@Controller('projects/:projectId/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  async create(@Body() createSectionDto: CreateSectionDto) {
    const section = await this.sectionsService.create(createSectionDto);
    if (!section) {
      throw new BadRequestException();
    }
    return section;
  }

  @Get()
  async findAll(@Param('projectId', ParseIntPipe) projectId: number) {
    return await this.sectionsService.findAll({
      where: {
        projectId,
      },
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const section = await this.sectionsService.findOne(id);
    if (!section) {
      throw new NotFoundException();
    }
    return section;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    const section = await this.sectionsService.update(id, updateSectionDto);
    if (!section) {
      throw new NotFoundException();
    }
    return section;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const section = await this.sectionsService.remove(id);
    if (!section) {
      throw new NotFoundException();
    }
    return section;
  }
}
