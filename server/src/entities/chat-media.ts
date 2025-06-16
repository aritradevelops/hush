
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsIn, IsInt, IsString, IsUrl, IsUUID, Length } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";
// TODO: store url
export const ChatMediaStatusEnum = {
  INITIALIZED: 0,
  UPLOADED: 2,
} as const
export type ChatMediaStatus = typeof ChatMediaStatusEnum[keyof typeof ChatMediaStatusEnum];

@Entity({ name: 'chat_medias' })
/** ChatMedia represents a media file that has been sent in a chat. 
 * Media can be an image, video, audio or any other type of file.
 * Metadata about the media is stored in this table.
 */
export default class ChatMedia extends PrimaryColumns {

  @Expose()
  @IsString()
  @Trim()
  @Column({ type: 'text' })
  name!: string;

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  chat_id!: UUID;

  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  channel_id!: UUID;

  @Expose()
  @IsString()
  @Length(24, 24)
  @Column({ type: 'varchar', length: 24 })
  // 16 bytes initial vector
  iv!: string;

  @Expose()
  @IsInt()
  @Column({ type: 'int' })
  // in bytes
  file_size!: number

  @Expose()
  @Column({ type: 'text', nullable: true })
  cloud_storage_url?: string;

  @Expose()
  @IsString()
  @Column({ type: 'varchar', length: 100 })
  mime_type!: string;

  @Expose()
  @Column({ type: 'int', default: ChatMediaStatusEnum.INITIALIZED })
  status!: ChatMediaStatus
}
