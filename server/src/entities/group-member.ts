
import { Expose } from "class-transformer";
import { IsBoolean, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'group_members' })
/** GroupMember represents a member of a group. */
export default class GroupMember extends PrimaryColumns {
  @Expose()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  /** Refers to the group that the member is a part of. */
  group_id!: UUID

  @Expose()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  /** Refers to the user who is a member of the group. */
  user_id!: UUID

  @Expose()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  /** Indicates if the member has pinned the channel. */
  has_pinned!: boolean

  @Expose()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  /** Indicates if the member has muted the channel. */
  has_muted!: boolean
}
