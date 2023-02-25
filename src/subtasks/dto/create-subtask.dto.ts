import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Task } from '../../tasks/entities/task.entity';

export class CreateSubtaskDto {
  @IsNotEmpty()
  @IsNumber()
  taskId: number;

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
  startedOn?: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  completedOn?: string;

  @ApiProperty({ enum: Task.Priority })
  @IsOptional()
  @IsEnum(Task.Priority)
  priority?: Task.Priority;
}
