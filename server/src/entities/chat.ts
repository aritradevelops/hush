
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsBoolean, IsString, IsUUID, Length, MinLength } from "class-validator-custom-errors";
import { Column, Entity, ForeignKey } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";
import { UUID } from "crypto";
import User from "./user";

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
  @Length(16, 16)
  @Column({ type: 'varchar', length: 16 })
  /** 12 bytes initial vector */
  iv!: string;

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => Chat)
  /** chat id of the chat that this is a reply to */
  replied_to?: UUID;


  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  @ForeignKey(() => User)
  override created_by!: `${string}-${string}-${string}-${string}-${string}`;

  get sent_by() {
    return this.created_by;
  }

  get sent_at() {
    return this.created_at;
  }

}
