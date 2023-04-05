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
import { Priority } from '../../tasks/enum/priority.enum';
import { TaskAttributes } from '../../tasks/task-attributes';

export class CreateSubtaskDto {
  @IsNotEmpty()
  @IsNumber()
  taskId: number;

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
  startedOn?: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  completedOn?: string;

  @ApiProperty({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
