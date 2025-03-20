
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsString, MinLength } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'secrets' })
export default class Secret extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @Column()
  encrypted_shared_secret!: string;

  @Expose()
  @IsString()
  @MinLength(3)
  @Column()
  @Trim()
  room_id!: string;

  @Expose()
  @IsString()
  @MinLength(3)
  @Column()
  @Trim()
  user_id!: string;
}
