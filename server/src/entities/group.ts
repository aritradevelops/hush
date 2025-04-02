
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsOptional, IsString, MinLength } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'groups' })
export default class Group extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column()
  name!: string;

  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @IsOptional()
  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'uuid', array: true })
  member_ids!: UUID[]
}

