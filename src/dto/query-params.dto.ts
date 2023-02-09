import { IsOptional } from 'class-validator';

export class QueryParams {
  @IsOptional()
  skip?: number;

  @IsOptional()
  take?: number;
}
