
import { Expose } from "class-transformer";
import { IsString, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'public_keys' })
/**
 * PublicKey represents the public part of the key pair used for encryption of the shared secret
 * of a channel.
 */
export default class PublicKey extends PrimaryColumns {
  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  /** The user that this public key belongs to */
  user_id!: UUID;

  @Expose()
  @IsString()
  @Column({ type: 'text' })
  key!: string;
}
