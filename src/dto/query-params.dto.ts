import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';

export class QueryParams {
  @IsNumberString()
  @ApiProperty({ description: 'The page index' })
  @IsOptional()
  skip?: number;
  
  @IsNumberString()
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
