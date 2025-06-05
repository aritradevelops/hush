
import { Expose } from "class-transformer";
import { IsIn, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";


export const UserChatInteractionStatusEnum = {
  NO_INTERACTION: 0,
  RECEIVED: 1,
  SEEN: 2,
} as const
export type UserChatInteractionStatus = typeof UserChatInteractionStatusEnum[keyof typeof UserChatInteractionStatusEnum];

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
  @IsIn(Object.values(UserChatInteractionStatusEnum))
  @Column({ type: 'int', default: UserChatInteractionStatusEnum.RECEIVED })
  status!: UserChatInteractionStatus
}
