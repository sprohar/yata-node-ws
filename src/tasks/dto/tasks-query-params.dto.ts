import { Priority, Prisma } from '@prisma/client';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { QueryParams } from '../../dto/query-params.dto';
import { Task } from '../entities/task.entity';

export class TasksQueryParams extends QueryParams {
  @IsNotEmpty()
  @IsNumberString()
  projectId: number;

  @IsOptional()
  @IsEnum(Task.OrderBy)
  orderBy?: Task.OrderBy;

  @IsOptional()
  @MaxLength(Task.Name.MAX_LENGTH)
  name?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsISO8601()
  start?: Date;

  @IsOptional()
  @IsISO8601()
  end?: Date;

  @IsOptional()
  // TODO: Add the label's max length
  label?: string;
}
