
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsBoolean, IsString, IsUUID, MinLength } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";
import { UUID } from "crypto";

@Entity({ name: 'chats' })
/** Chat represents a single message and it's meta data. */
export default class Chat extends PrimaryColumns {

  @Expose()
  @IsUUID()
  @Column({ type: "uuid" })
  /** Channel id is the id of channel the chat belongs to. */
  channel_id!: UUID;

  @Expose()
  @IsString()
  @Column({ type: 'text' })
  /** Message is the encrypted message. */
  encrypted_message!: string;

  @Expose()
  @IsString()
  @Column({ type: 'varchar', length: 100 })
  /** IV is the initialization vector that was used to encrypt the message. */
  iv!: string;

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid', nullable: true })
  /** chat id of the chat that this is a reply to */
  replied_to?: UUID;


  get sent_by() {
    return this.created_by;
  }

  get sent_at() {
    return this.created_at;
  }

}
