import { ApiProperty } from '@nestjs/swagger';
import { ProjectView } from '@prisma/client';
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

  @ApiProperty({ enum: ProjectView })
  @IsEnum(ProjectView)
  @IsOptional()
  view?: ProjectView;
}
