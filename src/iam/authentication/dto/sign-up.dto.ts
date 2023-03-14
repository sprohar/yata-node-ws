import { IsEmail, MinLength } from 'class-validator';
import { User } from '../../../users/entities/user.entity';

export class SignUpDto {
  @IsEmail()
  email: string;

  @MinLength(User.Password.MinLength)
  password: string;
}
