
import { Expose } from "class-transformer";
import { IsIP } from "class-validator-custom-errors";
import { Column, Entity, Index } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";
import { UUID } from "crypto";

@Entity({ name: 'sessions' })
export default class Session extends PrimaryColumns {

  @Column('uuid')
  user_id!: UUID;

  @Expose()
  @IsIP("4")
  @Column({ type: 'inet' })
  user_ip!: string;

  @Expose()
  @Column('text')
  user_agent!: string;

  @Expose()
  @Index({ unique: true })
  @Column('text')
  refresh_token!: string;
}
