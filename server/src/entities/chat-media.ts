
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsString, IsUrl, IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

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
  @IsUrl()
  @Column({ type: 'text' })
  cloud_storage_url!: string;

  @Expose()
  @IsString()
  @Column({ type: 'varchar', length: 100 })
  mime_type!: string;
}
