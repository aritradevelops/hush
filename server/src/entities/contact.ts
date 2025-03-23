
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsBoolean, IsString, IsUUID, MinLength } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'contacts' })
/** Contact represents one-to-one contact relation from created_by to user_id. 
 * i.e for a direct channel there will be two contacts representing relations from
 * each direction. A contact is_blocked means that the `created_by` has blocked the `user_id`
*/
export default class Contact extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column()
  /** Refers to the contact name or the custom name set by the user(created_by). */
  name!: string;

  @Expose()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  /** Refers to the user being contacted. */
  user_id!: UUID

  @Expose()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  /** Refers to the `direct` channel b/w the created_by and the user_id. */
  channel_id!: UUID

  @Expose()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  /** Indicates if the contact is pinned. */
  is_pinned!: boolean

  @Expose()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  /** Indicates if the contact is muted. */
  is_muted!: boolean

  @Expose()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  /** Indicates if the contact is blocked. */
  is_blocked!: boolean

}
