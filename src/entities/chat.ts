
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsBoolean, IsString, MinLength } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'chats' })
export default class Chat extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column()
  message!: string;

  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Column()
  iv!: string;

  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Column()
  room_id!: string;

  @Expose()
  @IsBoolean()
  @MinLength(3)
  @Trim()
  @Column()
  unread!: boolean;
}
