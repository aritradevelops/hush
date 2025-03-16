
import { UUID } from "node:crypto";
import Contact from "../entities/contact";
import { Repository } from "../lib/repository";

export class ContactRepository extends Repository<typeof Contact> {
  constructor() {
    super(Contact);
  }

  async directChats(userId: UUID) {
    const result = await this.entity.query(`
      SELECT DISTINCT ON (contacts.id) 
        ch.id,
        contact.name,
        ch.type,
        ch.participants,
        json_build_object(
          'id', last_chat.id,
          'message', last_chat.message,
          'created_at', last_chat.created_at,
          'channel_id', last_chat.channel_id,
          'created_by', jsonb_build_object(
              'id', users.id,
              'name', users.name,
              'email', users.email
            )
        ) AS last_chat,
        COALESCE(unread_count.count, 0) AS unread_chats_count
      FROM contacts 
      LEFT JOIN channels ch ON contacts.channel_id = ch.id
      LEFT JOIN LATERAL (
          SELECT 
              chats.id, 
              chats.message, 
              chats.created_at, 
              chats.channel_id,
              chats.created_by
          FROM chats
          WHERE chats.channel_id = channels.id
          ORDER BY chats.created_at DESC
          LIMIT 1
      ) last_chat ON true
      LEFT JOIN users ON users.id = last_chat.created_by
      LEFT JOIN LATERAL (
          SELECT COUNT(*) AS count
          FROM chats 
          WHERE chats.channel_id = channels.id 
          AND chats.unread = true
          AND chats.created_by != $1
      ) unread_count ON true
      WHERE 
          contacts.created_at = $1
      `, [userId])
  }
};
export default new ContactRepository();
