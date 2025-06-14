
import { Expose } from "class-transformer";
import { IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity, ForeignKey } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";
import User from "./user";

@Entity({ name: 'blocked_users' })
/** BlockedUser represents a user that has been blocked by the another user. */

export default class BlockedUser extends PrimaryColumns {
  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  @ForeignKey(() => User)
  /** The user who has been blocked */
  user_id!: UUID;

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  @ForeignKey(() => User)
  override created_by!: `${string}-${string}-${string}-${string}-${string}`;

  get blocked_at() {
    return this.created_at;
  }
  /** The user who blocked the user */
  get blocked_by() {
    return this.created_by;
  }

  toJSON() {
    return { ...this, blocked_at: this.blocked_at, blocked_by: this.blocked_by };
  }
}
