/**
 * ⚠️ This file is auto-generated with `npm run cli g:query`
 * Do NOT edit this file manually. Changes will be overwritten.
 */
export class ChannelQuery {
  /**
   * Get all group channels for a user
   * @param {uuid} $1 - The user's id
   * @param {string} $2 - The search query
   */
  getGroupChannels() {
    return `SELECT group_channel.id, group_channel.metadata->>'group_name' AS name, group_channel.metadata->>'group_group_image' AS picture, me.user_id AS user_id, me.has_pinned AS is_pinned, me.has_muted AS is_muted, me.created_at AS joined_at, me.deleted_at AS left_at, COALESCE(unread_chats.unread_count, 0) AS unread_count, COALESCE(last_chat.created_at, group_channel.created_at) as last_event_time, CASE WHEN last_chat.id IS NOT NULL THEN json_build_object( 'id', last_chat.id, 'message', last_chat.message, 'iv', last_chat.iv, 'created_at', last_chat.created_at, 'sender', CASE WHEN last_chat.created_by = COALESCE(last_chat_contact.user_id, last_chat_user.id) THEN last_chat_contact.name ELSE 'You' END ) ELSE NULL END AS last_chat FROM channels AS group_channel LEFT JOIN group_members AS me ON me.channel_id = group_channel.id AND me.user_id = $1 LEFT JOIN LATERAL ( SELECT chat.id, chat.message, chat.iv, chat.created_by, chat.created_at FROM chats AS chat WHERE chat.channel_id = group_channel.id AND ( me.deleted_at IS NULL OR chat.created_at < me.deleted_at ) ORDER BY chat.created_at DESC LIMIT 1 ) AS last_chat ON true LEFT JOIN LATERAL ( SELECT contact.name, contact.user_id FROM contacts AS contact WHERE contact.user_id = last_chat.created_by AND contact.created_by = $1 ) AS last_chat_contact ON true LEFT JOIN LATERAL ( SELECT u.id, u.name FROM users AS u WHERE u.id = last_chat.created_by ) AS last_chat_user ON true LEFT JOIN LATERAL ( SELECT COUNT(1) AS unread_count FROM chats AS chat WHERE chat.channel_id = group_channel.id AND chat.unread = true AND chat.created_by != $1 ) AS unread_chats ON true WHERE group_channel.type = '1' AND ( $2 = '' OR to_tsvector('english', group_channel.metadata->>'group_name') @@ to_tsquery('english', $2) ) ORDER BY COALESCE(last_chat.created_at, group_channel.created_at) DESC;`;
  }

  /**
   * Get all the private channels for a user
   * @param {uuid} $1 - user's id
   * @param {string} $2 - Search for contacts' names
   */
  getPrivateChannels() {
    return `SELECT private_channel.id, my_contact.name, u.avatar as picture, my_contact.user_id, my_contact.is_pinned, my_contact.is_muted, my_contact.search, (CASE WHEN my_contact.status = '1' THEN true else false END ) as is_pending, my_contact.is_blocked AS have_blocked, COALESCE(unread_chats.unread_count, 0) AS unread_count, COALESCE(their_contact.is_blocked, false) AS been_blocked, COALESCE(last_chat.created_by, private_channel.created_by) as last_event_time, CASE WHEN last_chat.id IS NOT NULL THEN json_build_object( 'id', last_chat.id, 'message', last_chat.message, 'iv', last_chat.iv, 'created_at', last_chat.created_at, 'sender', CASE WHEN last_chat.created_by = my_contact.user_id THEN my_contact.name ELSE 'You' END ) ELSE NULL END AS last_chat FROM channels private_channel LEFT JOIN contacts my_contact ON my_contact.created_by = $1 AND private_channel.id = my_contact.channel_id LEFT JOIN users u ON u.id = my_contact.user_id LEFT JOIN contacts their_contact ON their_contact.user_id = $1 AND their_contact.created_by = my_contact.user_id LEFT JOIN LATERAL ( SELECT chat.id, chat.message, chat.iv, chat.created_by, chat.created_at FROM chats chat WHERE chat.channel_id = private_channel.id ORDER BY chat.created_at DESC LIMIT 1 ) last_chat ON true LEFT JOIN LATERAL ( SELECT COUNT(*) AS unread_count FROM chats chat WHERE chat.channel_id = private_channel.id AND chat.unread = true AND chat.created_by != $1 ) unread_chats ON true WHERE private_channel.type = '0' AND $2 = '' OR my_contact.search @@ to_tsquery($2) ORDER BY COALESCE(last_chat.created_by, private_channel.created_by) DESC;`;
  }
}
export default new ChannelQuery();