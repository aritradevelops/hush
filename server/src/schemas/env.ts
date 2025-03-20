import { ToInt } from "class-sanitizer";
import { IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString, IsUrl, MinLength } from "class-validator-custom-errors";

export const NodeEnv = ['development', 'production', 'test'] as const;
export const AppEnv = ['local', 'development', 'staging', 'production', 'test'] as const;

export class Env {

  @ToInt()
  @IsNumberString()
  @IsOptional()
  PORT!: number;

  @IsIn(NodeEnv)
  @IsOptional()
  NODE_ENV: typeof NodeEnv[number] = 'development';

  @IsIn(AppEnv)
  @IsOptional()
  APP_ENV: typeof AppEnv[number] = 'local';

  @IsString()
  @IsOptional()
  DB_HOST: string = 'localhost';

  @ToInt()
  @IsOptional()
  @IsNumberString()
  DB_PORT!: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string = 'postgres';

  @IsString()
  @IsOptional()
  DB_PASSWORD: string | undefined = undefined;

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string;

  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY: string = '';

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  JWT_SECRET!: string


  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  CLIENT_URL!: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_OAUTH_REDIRECT_URI!: string;

  @IsString()
  @IsNotEmpty()
  FACEBOOK_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  FACEBOOK_CLIENT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  FACEBOOK_OAUTH_REDIRECT_URI!: string;

  get ROOT() {
    return this.NODE_ENV === 'production' ? 'dist' : 'src';
  }
  get EXT() {
    return this.NODE_ENV === 'production' ? 'js' : 'ts';
  }
}
