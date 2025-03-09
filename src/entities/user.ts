
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
  name!: string;

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

  // TODO: implement group wise password checking
  @Expose()
  @Trim()
  @IsStrongPassword({ minLength: 8, minLowercase: 1, minNumbers: 1, minSymbols: 1, minUppercase: 1 })
  @IsOptional()
  @Transform(({ value }) => value ? hash(value) : undefined)
  @Column('varchar', { length: 255, nullable: true })
  password?: string | null;

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
  @Index({ unique: true })
  @Column({ type: Date, nullable: true })
  /** will be updated on reset password request */
  reset_password_hash_expiry!: Date | null;

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
      name: this.name,
      email: this.email,
      dp: this.dp,
      // password: this.password, // password is not returned in json
      // email_verification_hash: this.email_verification_hash,
      // reset_password_hash: this.reset_password_hash
    };
  }
}
