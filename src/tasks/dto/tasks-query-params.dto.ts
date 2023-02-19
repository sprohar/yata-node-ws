import { ApiProperty } from '@nestjs/swagger';
import { Priority } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { QueryParams } from '../../dto/query-params.dto';
import { Task } from '../entities/task.entity';

export class TasksQueryParams extends QueryParams {
  @ApiProperty({ enum: Task.OrderBy, required: false })
  @IsOptional()
  @IsEnum(Task.OrderBy)
  orderBy?: Task.OrderBy;

  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(Task.Name.MAX_LENGTH)
  name?: string;

  @ApiProperty({ enum: Priority, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ required: false })
  @IsOptional()
  // TODO: Add the label's max length
  label?: string;
}
