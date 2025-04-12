
import { NormalizeEmail, Trim } from "class-sanitizer";
import { Expose, Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsOptional, IsString, IsStrongPassword, IsUrl, MinLength } from "class-validator-custom-errors";
import { Column, Entity, Index, OneToMany, Unique } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";
import { hash } from "../utils/string";
import DirectMessage from "./direct-message";
import Group from "./group";


@Entity({ name: 'users' })
export default class User extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Expose()
  @IsEmail()
  @NormalizeEmail()
  @Index()
  @Searchable()
  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string

  @Expose()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  /** Whether the user has verified their email or not */
  email_verified!: boolean

  @Expose()
  @IsUrl()
  @IsOptional()
  @Trim()
  @Column({ type: "text", nullable: true })
  dp?: string;

}
