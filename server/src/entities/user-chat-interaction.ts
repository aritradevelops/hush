
import { Expose } from "class-transformer";
import { IsEnum, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";


export enum UserChatInteractionStatus {
  NO_INTERACTION = 0,
  RECEIVED,
  SEEN,
}


@Entity({ name: 'user_chat_interactions' })
/** UserChatInteraction represents a user's interaction with a chat. 
 * A chat can be received, or seen by a user.
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
  @Column({ type: 'enum', enum: UserChatInteractionStatus, default: UserChatInteractionStatus.RECEIVED })
  status!: UserChatInteractionStatus;

}
