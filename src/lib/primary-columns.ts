import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



export enum Status {
  DRAFT,
  PENDING,
  ACTIVE,
  INACTIVE,
  LOCKED,
  DEACTIVATED,
}

export class PrimaryColumns extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: 'enum', enum: Status, default: Status.DRAFT })
  status!: Status

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date | null;

  @Column({ nullable: true, type: Date })
  deleted_at!: Date | null;

  @Column()
  created_by!: string;

  @Column({ nullable: true, type: String })
  updated_by!: string | null;

  @Column({ nullable: true, type: String })
  deleted_by!: string | null;

  @Column('tsvector', { select: false, nullable: true })
  search: any;
}
