
import { NormalizeEmail, Trim } from "class-sanitizer";
import { Expose, Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, IsStrongPassword, IsUrl, MinLength } from "class-validator-custom-errors";
import { Column, Entity, Index, Unique } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";
import { hash } from "../utils/string";

@Entity({ name: 'users' })
export default class User extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column({ type: "varchar", length: 100 })
  first_name!: string;

  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column({ type: "varchar", length: 100 })
  last_name!: string;

  @Expose()
  @IsString()
  @IsEmail()
  @MinLength(3)
  @NormalizeEmail()
  @Index()
  @Searchable()
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string

  @Expose()
  @IsUrl()
  @IsOptional()
  @Trim()
  @Column({ type: "text", nullable: true })
  dp?: string;

  @Expose()
  @Trim()
  @IsStrongPassword({ minLength: 8, minLowercase: 1, minNumbers: 1, minSymbols: 1, minUppercase: 1 })
  @Transform(({ value }) => value ? hash(value) : undefined)
  @Column('varchar', { length: 255 })
  password!: string;


  @Expose()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  /** will be created at the time of user creation */
  email_verification_hash!: string | null;

  @Expose()
  @IsString()
  @IsOptional()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  /** will be updated on reset password request */
  reset_password_hash!: string | null;

  @Expose()
  @IsString({ each: true })
  @IsOptional()
  @Column('text', { array: true, default: [] })
  contacts!: string[];

  @Expose()
  @IsString()
  @IsOptional()
  @Column({ type: 'text', nullable: true })
  public_key!: string | null;

  toJSON() {
    return {
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      dp: this.dp,
      // password: this.password, // password is not returned in json
      // email_verification_hash: this.email_verification_hash,
      // reset_password_hash: this.reset_password_hash
    };
  }
}
