import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { Section } from '../entities/section.entity';

export class CreateSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(Section.Name.MaxLength)
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}
