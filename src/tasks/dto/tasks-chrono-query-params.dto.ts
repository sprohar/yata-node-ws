import { TasksQueryParams } from "./tasks-query-params.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsISO8601, IsOptional } from "class-validator";

export class TasksChronoQueryParamsDto extends TasksQueryParams {
  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  start?: Date;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  end?: Date;
}