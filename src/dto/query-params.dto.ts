import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryParams {
  @IsOptional()
  skip?: number;

  @IsOptional()
  take?: number;

  @IsOptional()
  @IsEnum(Prisma.SortOrder)
  dir?: string;
}
