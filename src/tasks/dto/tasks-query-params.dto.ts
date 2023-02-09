import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  projectId: number;

  @ApiProperty({ enum: Task.OrderBy })
  @IsOptional()
  @IsEnum(Task.OrderBy)
  orderBy?: Task.OrderBy;

  @ApiProperty()
  @IsOptional()
  @MaxLength(Task.Name.MAX_LENGTH)
  name?: string;

  @ApiProperty({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  start?: Date;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  end?: Date;

  @ApiProperty()
  @IsOptional()
  // TODO: Add the label's max length
  label?: string;
}
