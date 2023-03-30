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
import { TaskAttributes } from '../attributes';
import { Priority } from '../enum/priority.enum';

export class UpdateTaskDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(TaskAttributes.Title.MAX_LENGTH)
  title?: string;

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
  @IsOptional()
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
  completedOn?: string;

  @ApiProperty({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

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
}
