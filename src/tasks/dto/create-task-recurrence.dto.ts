import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { TaskRecurrence } from '../recur/task-recurrence';

export class CreateTaskRecurrenceDto {
  @IsNotEmpty()
  @IsEnum(TaskRecurrence.Frequency)
  frequency: TaskRecurrence.Frequency;

  @IsNotEmpty()
  @IsNumberString()
  interval: number;

  @IsOptional()
  @IsNumberString()
  count?: number;
}
