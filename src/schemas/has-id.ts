import { IsString, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";

export class HasId {
  @IsString()
  @IsUUID('4')
  id!: UUID;
}