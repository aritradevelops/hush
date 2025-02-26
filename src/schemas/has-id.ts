import { IsString } from "class-validator-custom-errors";

export class HasId {
  @IsString()
  id!: string;
}