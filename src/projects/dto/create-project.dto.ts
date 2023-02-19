import { ApiProperty } from '@nestjs/swagger';
import { View } from '@prisma/client';
import {
  IsString,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Project } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(Project.Name.MAX_LENGTH)
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;

  @ApiProperty({ enum: View })
  @IsEnum(View)
  @IsOptional()
  view?: View;

  @ApiProperty()
  @IsOptional()
  @IsString()
  ownerId?: string;
}
