
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsEnum, IsString, IsUUID, MinLength } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";
import { UUID } from "crypto";


export enum UserChatInteractionStatus {
  DELIVERED = 0,
  RECEIVED,
  SEEN,
}


@Entity({ name: 'user_chat_interactions' })
/** UserChatInteraction represents a user's interaction with a chat. 
 * A chat can be delivered, received, or seen by a user.
 * In case a user chooses to hide seen or received status, these records should not be inserted.
 */
export default class UserChatInteraction extends PrimaryColumns {

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  /** The chat that has been interacted with */
  chat_id!: UUID;

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  channel_id!: UUID;

  @Expose()
  @IsEnum(UserChatInteractionStatus)
  @Column({ type: 'enum', enum: UserChatInteractionStatus, default: UserChatInteractionStatus.DELIVERED })
  status!: UserChatInteractionStatus;

}
