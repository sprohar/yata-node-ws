import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(User.Password.MinLength)
  pwd: string;
}
