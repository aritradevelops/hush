
import { Trim } from "class-sanitizer";
import { Expose, Type } from "class-transformer";
import { IsEnum, IsObject, IsOptional, IsString, IsUrl, MinLength, ValidateNested } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

export enum ChannelType {
  PRIVATE,
  GROUP
}

export class ChannelMetadata {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  group_name!: string

  @Expose()
  @IsString()
  @IsOptional()
  group_description?: string

  @Expose()
  @IsUrl()
  @IsOptional()
  group_image?: string
}

@Entity({ name: 'channels' })
/** Channel represents communication channel b/w one or more people. */
export default class Channel extends PrimaryColumns {

  @Expose()
  @IsString()
  @IsEnum(ChannelType)
  @Column({ type: 'enum', enum: ChannelType })
  type!: ChannelType

  @Expose()
  @IsObject()
  @ValidateNested()
  @IsOptional()
  @Type(() => ChannelMetadata)
  @Column({ type: 'jsonb', default: '{}' })
  metadata?: ChannelMetadata
}



