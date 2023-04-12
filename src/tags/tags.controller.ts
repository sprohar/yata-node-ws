import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { QueryParams } from '../dto/query-params.dto';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Body() createTagDto: CreateTagDto,
  ) {
    return await this.tagsService.create({
      data: {
        ...createTagDto,
        userId,
      },
    });
  }

  @Get()
  async findAll(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Query() query: QueryParams,
  ) {
    const { skip, take } = query;
    return await this.tagsService.findAll({
      skip: skip ? parseInt(skip) : QueryParams.SKIP_DEFAULT,
      take: take ? parseInt(take) : QueryParams.TAKE_DEFAULT,
      orderBy: {
        name: Prisma.SortOrder.asc,
      },
      where: {
        userId,
      },
    });
  }

  @Get(':id')
  async findOne(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.tagsService.findOne({
      where: {
        id,
        userId,
      },
    });
  }

  @Get(':id/tasks')
  async getTasks(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) tagId: number,
    @Query() query: QueryParams,
  ) {
    return await this.tagsService.getTasks({
      skip: query.skip ? +query.skip : QueryParams.SKIP_DEFAULT,
      take: query.take
        ? Math.min(+query.take, QueryParams.TAKE_DEFAULT)
        : QueryParams.TAKE_DEFAULT,
      where: {
        userId,
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      orderBy: {
        id: Prisma.SortOrder.asc,
      },
    });
  }

  @Patch(':id')
  async update(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    const tagExists = await this.tagsService.exists({
      where: {
        id,
        userId,
      },
    });
    if (!tagExists) {
      throw new NotFoundException();
    }

    return await this.tagsService.update({
      data: {
        ...updateTagDto,
      },
      where: {
        id,
      },
    });
  }

  @Delete(':id')
  async remove(
    @ActiveUser('sub', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const tagExists = await this.tagsService.exists({
      where: {
        id,
        userId,
      },
    });
    if (!tagExists) {
      throw new NotFoundException();
    }

    return await this.tagsService.remove({
      where: {
        id,
      },
    });
  }
}
