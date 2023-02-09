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
  @IsString()
  @IsNotEmpty()
  @MaxLength(Project.Name.MAX_LENGTH)
  name: string;

  @IsOptional()
  @IsBoolean()
  favorite?: boolean;

  @IsEnum(View)
  @IsOptional()
  view?: View;

  @IsOptional()
  @IsString()
  userId?: string;
}
