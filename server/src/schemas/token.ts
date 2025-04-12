import { isCuid } from "@paralleldrive/cuid2";
import { IsString, ValidateBy } from "class-validator-custom-errors";

export class Token {
  @IsString()
  @ValidateBy({ validator: isCuid, name: 'isClientId' })
  client_id!: string;
  @IsString()
  client_secret!: string;
  @IsString()
  code!: string;
}