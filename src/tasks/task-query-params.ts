import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { QueryParams } from '../dto/query-params.dto';
import { TaskAttributes } from './task-attributes';

export class TaskQueryParams {
  @ApiProperty()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(TaskAttributes.OrderBy)
  orderBy?: TaskAttributes.OrderBy;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Prisma.SortOrder)
  dir = Prisma.SortOrder.asc;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  skip = 0;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  take = QueryParams.TAKE_DEFAULT;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  priority?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  projectId?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  from?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  to?: number;
}
