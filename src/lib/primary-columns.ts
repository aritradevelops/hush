import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



export enum Status {
  DRAFT,
  PENDING,
  ACTIVE,
  INACTIVE,
  LOCKED,
  DEACTIVATED,
  BLOCKED
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
  @Index()
  /** 
   * A precomputed search vector that indexes all relevant searchable fields  
   * of the entity. This column is automatically updated on entity creation  
   * and modification, enabling efficient full-text search queries.  
   * It improves search performance by consolidating multiple fields into  
   * a single indexed column, reducing the need for complex filtering.  
   */
  search: any;
}
