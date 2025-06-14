
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsString, IsUUID, MinLength } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity, ForeignKey, VirtualColumn } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";
import User from "./user";

@Entity({ name: 'contacts' })
/** Contact represents a user that has been added as a known user. */
export default class Contact extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column()
  /** Refers to the contact name or the custom name set by the user(created_by). */
  nickname!: string;

  @Expose()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  @ForeignKey(() => User)
  /** Refers to the user being contacted. */
  user_id!: UUID


  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  @ForeignKey(() => User)
  override created_by!: `${string}-${string}-${string}-${string}-${string}`;

  get contacted_by() {
    return this.created_by;
  }
}
