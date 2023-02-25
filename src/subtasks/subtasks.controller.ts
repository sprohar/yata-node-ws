import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { SubtasksService } from './subtasks.service';

@ApiTags('Subtasks')
@Controller('/tasks/:taskId/subtasks')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Post()
  async create(
    @Param('taskId', ParseIntPipe) taskId,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ) {
    const subtask = await this.subtasksService.create(createSubtaskDto);
    if (!subtask) {
      throw new BadRequestException();
    }

    return subtask;
  }

  @Get()
  findAll() {
    return this.subtasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subtasksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubtaskDto: UpdateSubtaskDto) {
    return this.subtasksService.update(+id, updateSubtaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subtasksService.remove(+id);
  }
}
