
import { Expose } from "class-transformer";
import { IsString, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'passwords' })
export default class Password extends PrimaryColumns {

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  user_id!: UUID

  @Expose()
  @IsString()
  @Column({ type: 'text' })
  password!: string;
}
