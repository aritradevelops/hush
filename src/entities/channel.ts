
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsString, IsUUID, MinLength, ValidateIf } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";
import { UUID } from "crypto";

export const ChannelTypes = ['direct', 'group'] as const

@Entity({ name: 'channels' })
/** Channel represents communication channel b/w one or more people. */
export default class Channel extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @ValidateIf((c) => c.type === ChannelTypes[1])
  @Trim()
  @Searchable()
  @Column()
  /** Name can be used for group type channels  */
  name?: string;

  @Expose()
  @IsString()
  @IsIn(ChannelTypes)
  @Column()
  type!: typeof ChannelTypes[number]

  @Expose()
  @IsUUID('4', { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @Column({ type: 'uuid', array: true })
  /** Participants are the one who are taking part in the communication. */
  participants!: UUID[]
}
