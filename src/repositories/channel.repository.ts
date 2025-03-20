
import { UUID } from "node:crypto";
import Channel from "../entities/channel";
import { Repository } from "../lib/repository";

export class ChannelRepository extends Repository<typeof Channel> {
  constructor() {
    super(Channel);
  }
  async forUser(userId: UUID, search: string){

  }

  async groupChats(userId: string) {
    const result = await this.entity.query(
      `SELECT DISTINCT ON (channels.id) 
        channels.id, 
        channels.name, 
        channels.type, 
        channels.participants, 
        jsonb_build_object(
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
      FROM channels
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
          channels.type = '1' 
          AND channels.participants @> ARRAY[$1]::uuid[]
      ORDER BY channels.id;`
      , [userId]
    ) as GroupChat[]
    return result;
  }

}

export default new ChannelRepository();


export interface ChatUser {
  id: string;
  name: string;
  email: string;
}

export interface LastChat {
  id: string;
  message: string;
  channel_id: string;
  created_at: string;
  created_by: ChatUser;
}

export interface GroupChat {
  id: string;
  name: string;
  type: string;
  participants: string[];
  last_chat: LastChat;
  unread_chats_count: number;
}
