import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Priority } from '../enum/priority.enum';
import { TaskAttributes } from '../task-attributes';

export class UpdateTaskDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(TaskAttributes.Title.MAX_LENGTH)
  title?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(TaskAttributes.Content.MAX_LENGTH)
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  projectId?: number;

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
  completedAt?: string;

  @ApiProperty({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
