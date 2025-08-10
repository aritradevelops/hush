
import { Expose } from "class-transformer";
import { IsString, IsUUID, Length } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'calls' })
export default class Call extends PrimaryColumns {
  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  channel_id!: UUID;

  @Expose()
  @Column({ type: 'varchar', length: 10 })
  channel_type!: 'dm' | 'group'

  @Expose()
  @IsString()
  @Length(24, 24)
  @Column({ type: 'varchar', length: 24 })
  /** 16 bytes initial vector */
  iv!: string;

  @Column({ nullable: true, type: 'timestamptz' })
  ended_at!: Date | null;

  @Column({ nullable: true, type: 'uuid' })
  ended_by!: UUID | null;
}
