import { IsObject, IsOptional, IsString } from 'class-validator';
import { UserPreference } from '../interfaces';

export class UpdateUserDto {
  @IsObject()
  @IsOptional()
  preferences?: UserPreference;

  @IsOptional()
  @IsString()
  username?: string;
}
