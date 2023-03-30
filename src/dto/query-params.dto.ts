import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';

export class QueryParams {
  static readonly SKIP_DEFAULT = 0;
  static readonly TAKE_DEFAULT = 100;
  static readonly MAX_TAKE = 100;

  @IsNumberString()
  @ApiProperty({ description: 'The page index' })
  @IsOptional()
  skip?: string;

  @IsNumberString()
  @ApiProperty({ description: 'The page size' })
  @IsOptional()
  take?: string;

  @ApiProperty({
    enum: Prisma.SortOrder,
    description: 'To sort by ascending or descending order',
    required: false,
  })
  @IsOptional()
  @IsEnum(Prisma.SortOrder)
  dir?: string;
}
