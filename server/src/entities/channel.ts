
import { Trim } from "class-sanitizer";
import { Expose, Type } from "class-transformer";
import { IsEnum, IsObject, IsOptional, IsString, IsUrl, MinLength, Validate, ValidateIf } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";

export enum ChannelType {
  DM = 0,
  GROUP = 1,
}

export class ChannelMetadata {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  name!: string;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @Expose()
  @IsString()
  @IsUrl()
  @IsOptional()
  image?: string;
}

@Entity({ name: 'channels' })
/** Channel represents a communication channel between one or more participants 
 * Channel can have one (self chat), two (DM) or many participants (group chat)
 * Group channels can have metadata like name, description and image
*/
export default class Channel extends PrimaryColumns {
  @Expose()
  @IsEnum(ChannelType)
  @Column({ type: 'enum', enum: ChannelType })
  type!: ChannelType;

  @Expose()
  @ValidateIf((o) => o.type === ChannelType.GROUP)
  @IsObject()
  @Type(() => ChannelMetadata)
  @Column({ type: 'jsonb', default: '{}' })
  metadata!: ChannelMetadata;
}

