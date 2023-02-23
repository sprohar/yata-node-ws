import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';
import { QueryParams } from '../../dto/query-params.dto';
import { Task } from '../entities/task.entity';

export class TasksQueryParams extends QueryParams {
  @ApiProperty({ enum: Task.OrderBy, required: false })
  @IsOptional()
  @IsEnum(Task.OrderBy)
  orderBy?: Task.OrderBy;

  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(Task.Title.MAX_LENGTH)
  title?: string;

  @ApiProperty({ enum: Task.Priority, required: false })
  @IsOptional()
  @IsEnum(Task.Priority)
  priority?: Task.Priority;

  @ApiProperty({ required: false })
  @IsOptional()
  // TODO: Add the label's max length
  label?: string;
}
