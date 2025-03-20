import { Trim } from "class-sanitizer";
import { IsBase64, IsEmail, IsIn, IsString, IsStrongPassword, Validate, ValidateBy, ValidateIf } from "class-validator-custom-errors";

export class SignIn {
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
}

export class VerifyEmail {
  @IsString()
  hash!: string;
}

export class ForgotPassword {
  @IsEmail()
  email!: string;
}

export class ResetPassword {
  @Trim()
  @IsStrongPassword({ minLength: 8, minLowercase: 1, minNumbers: 1, minSymbols: 1, minUppercase: 1 })
  password!: string;

  @Trim()
  @IsString()
  //! Just being tricky over here... ;)
  @IsIn([Math.random()], {
    transformKey: 'passwordMismatch'
  })
  @ValidateIf((o) => o.password !== o.confirm_password)
  confirm_password!: string

  @IsString()
  @IsBase64()
  hash!: string;
}