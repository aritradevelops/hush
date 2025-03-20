
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
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column()
  /** Message is the encrypted message. */
  message!: string;

  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Column()
  /** IV is the initialization vector that was used to encrypt the message. */
  iv!: string;

  @Expose()
  @IsString()
  @IsUUID('4')
  @MinLength(3)
  @Trim()
  @Column({ type: "uuid" })
  /** Channel id is the id of channel the chat belongs to. */
  channel_id!: UUID;

  @Expose()
  @IsBoolean()
  @MinLength(3)
  @Trim()
  @Column()
  /** Unread is true until the chat is read by all the participants of the channel. */
  unread!: boolean;
}
