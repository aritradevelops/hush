
import { Expose } from "class-transformer";
import { IsDateString, IsString, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'reset_password_requests' })
export default class ResetPasswordRequest extends PrimaryColumns {
  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  /** The reset password request that this request belongs to */
  user_id!: UUID;

  @Expose()
  @IsString()
  @Column({ type: 'text' })
  hash!: string;

  @Expose()
  @IsDateString()
  @Column({ type: 'timestamptz' })
  expires_at!: Date;
}
