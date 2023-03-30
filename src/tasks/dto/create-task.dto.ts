import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Task } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(Task.Title.MAX_LENGTH)
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  sectionId?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(Task.Content.MAX_LENGTH)
  content?: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  dueDate?: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  endDate?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  rrule?: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  completedOn?: string;

  @ApiProperty({ enum: Task.Priority })
  @IsOptional()
  @IsEnum(Task.Priority)
  priority?: Task.Priority;

  @IsOptional()
  @IsArray()
  tags?: Tag[];
}
