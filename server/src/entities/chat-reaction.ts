
import { Expose } from "class-transformer";
import { IsUUID } from "class-validator-custom-errors";
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'chat_reactions' })
export default class ChatReaction extends PrimaryColumns {
  @Expose()
  @IsUUID()
  @Column({ type: 'uuid' })
  chat_id!: UUID;

  @Expose()
  @IsUUID()
  @Column({ type: 'text' })
  emoji!: string;

  get reacted_at() {
    return this.created_at;
  }
  get reacted_by() {
    return this.created_by;
  }
}
