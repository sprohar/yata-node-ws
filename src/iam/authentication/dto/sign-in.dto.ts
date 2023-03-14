import { IsEmail, MinLength } from "class-validator";
import { User } from "../../../users/entities/user.entity";

export class SignInDto {
  @IsEmail()
  email: string;

  @MinLength(User.Password.MinLength)
  password: string;
}
