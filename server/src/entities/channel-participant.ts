
import { Expose } from "class-transformer";
import { IsBoolean, IsOptional, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'channel_participants' })
/** ChannelParticipant represents a participant in a channel. 
 * participants can join, leave, mute or pin a channel.
 */
export default class ChannelParticipant extends PrimaryColumns {

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  user_id!: UUID

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  channel_id!: UUID;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', default: false })
  has_muted!: boolean;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', default: false })
  has_pinned!: boolean;

  get joined_at() {
    return this.created_at;
  }
  get left_at() {
    return this.deleted_at;
  }

  toJSON() {
    return { ...this, joined_at: this.joined_at, left_at: this.left_at };
  }
}
