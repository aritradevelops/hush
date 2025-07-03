
import { Expose } from "class-transformer";
import { IsIn, IsUUID } from "class-validator-custom-errors";
import { UUID } from "node:crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

export const CallStatusEnum = {
  RUNNING: 0,
  ENDED: 1
} as const

export type CallStatus = typeof CallStatusEnum[keyof typeof CallStatusEnum]

@Entity({ name: 'calls' })
export default class Call extends PrimaryColumns {
  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  channel_id!: UUID;

  @Expose()
  @Column({ type: 'varchar', length: 10 })
  channel_type!: 'dm' | 'group'

  @Expose()
  @IsIn(Object.values(CallStatusEnum))
  @Column({ type: 'int', default: CallStatusEnum.RUNNING })
  status!: CallStatus
}
