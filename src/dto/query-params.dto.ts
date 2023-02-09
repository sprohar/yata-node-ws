import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryParams {
  @ApiProperty({ description: 'The page index' })
  @IsOptional()
  skip?: number;

  @ApiProperty({ description: 'The page size' })
  @IsOptional()
  take?: number;

  @ApiProperty({
    enum: Prisma.SortOrder,
    description: 'To sort by ascending or descending order',
  })
  @IsOptional()
  @IsEnum(Prisma.SortOrder)
  dir?: string;
}
