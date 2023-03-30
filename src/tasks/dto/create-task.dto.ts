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
import { TaskAttributes } from '../attributes';
import { Priority } from '../enum/priority.enum';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(TaskAttributes.Title.MAX_LENGTH)
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
  @MaxLength(TaskAttributes.Content.MAX_LENGTH)
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

  @ApiProperty({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsArray()
  tags?: Tag[];
}
