

SELECT
  uci.id,
  uci.channel_id,
  row_to_json(chat) as chat
FROM user_chat_interactions uci
LEFT JOIN chats chat ON chat.id = uci.chat_id AND chat.channel_id = uci.channel_id
WHERE 
  uci.created_by = $1::uuid
  AND uci.status = 0
  AND uci.deleted_at IS NULL
