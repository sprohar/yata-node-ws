import { Priority } from '@prisma/client';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Task } from '../entities/task.entity';

export class CreateTaskDto {
  @IsNotEmpty()
  @MaxLength(Task.Name.MAX_LENGTH)
  name: string;

  @IsNotEmpty()
  @IsNumberString()
  projectId: number;

  @IsOptional()
  @MaxLength(Task.Description.MAX_LENGTH)
  description?: string;

  @IsISO8601()
  @IsOptional()
  dueDate?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
