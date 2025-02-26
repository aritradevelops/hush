import { IsEmail, IsString } from "class-validator-custom-errors";

export class SignIn {
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
}