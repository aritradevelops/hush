
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsString, MinLength } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'chat_statuses' })
export default class ChatStatus extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column()
  title!: string;
}
  