
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsIn, IsString, IsUUID, MinLength, ValidateIf } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";
import { UUID } from "crypto";

export enum ChannelType {
  DIRECT,
  GROUP
}

@Entity({ name: 'channels' })
/** Channel represents communication channel b/w one or more people. */
export default class Channel extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @ValidateIf((c) => c.type === ChannelType.DIRECT)
  @Trim()
  @Searchable()
  @Column()
  /** Name can be used for group type channels  */
  name?: string;

  @Expose()
  @IsString()
  @IsEnum(ChannelType)
  @Column({ type: 'enum', enum: ChannelType })
  type!: ChannelType

  @Expose()
  @IsUUID('4', { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @Column({ type: 'uuid', array: true })
  /** Participants are the one who are taking part in the communication. */
  participants!: UUID[]
}
