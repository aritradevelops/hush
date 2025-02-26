import { isCuid } from "@paralleldrive/cuid2";
import {
  IsEmail, IsIn, IsOptional, IsString, IsUrl, Matches, ValidateBy, ValidateIf
} from "class-validator-custom-errors";
import { Transform } from "class-transformer";

const responseTypes = ['code', 'token'] as const;
const codeChallengeMethods = ['S256', 'plain'] as const;

export class OAuth2 {
  @IsString()
  @ValidateBy({ validator: isCuid, name: 'isClientId' })
  client_id!: string;

  @IsString()
  @IsUrl({ require_tld: false })
  redirect_uri!: string;

  @IsIn(responseTypes)
  response_type!: (typeof responseTypes)[number];

  @IsString()
  @IsOptional()
  code_challenge?: string;

  @IsIn(codeChallengeMethods)
  @ValidateIf(({ code_challenge }) => !!code_challenge)
  code_challenge_method?: typeof codeChallengeMethods[number];

  @IsString()
  @IsOptional()
  state?: string;

  @Transform(({ value }) => value?.toLowerCase())
  @IsEmail()
  @IsOptional()
  login_hint?: string;

  @Matches(/^[a-zA-Z0-9_-]{8,128}$/, { message: 'nonce must be 8-128 characters long and alphanumeric with dashes or underscores.' })
  @IsOptional()
  nonce?: string;
}
