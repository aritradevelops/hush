
import { Expose } from "class-transformer";
import { IsDateString, IsString, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'email_verification_requests' })
export default class EmailVerificationRequest extends PrimaryColumns {

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  user_id!: UUID

  @Expose()
  @IsString()
  @Column({ type: 'text' })
  hash!: string;

  @Expose()
  @IsDateString()
  @Column({ type: 'timestamptz' })
  expires_at!: Date;
}
