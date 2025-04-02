
import { UUID } from "crypto";
import { Column, Entity } from "typeorm";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: 'direct_messages' })
export default class DirectMessage extends PrimaryColumns {
  @Column({ type: 'uuid', array: true })
  member_ids!: [UUID, UUID]
}
