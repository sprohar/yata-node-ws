import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { QueryParams } from '../dto/query-params.dto';
import { TaskAttributes } from '../tasks/attributes';

export class ChronoQueryParams extends QueryParams {
  @ApiProperty()
  @IsOptional()
  @IsEnum(TaskAttributes.OrderBy)
  orderBy?: TaskAttributes.OrderBy;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
