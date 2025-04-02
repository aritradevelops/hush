/*
  List direct messages with the last chat for a user
  @param {uuid} $1 - The user's id
*/
SELECT 
    dm.*,
    CASE 
        WHEN last_chat.id IS NOT NULL 
        THEN row_to_json(last_chat) 
        ELSE NULL 
    END AS last_chat,
    CASE 
        WHEN contact.id IS NOT NULL 
        THEN row_to_json(contact) 
        ELSE NULL 
    END AS contact,
    row_to_json(chat_user) AS chat_user
FROM direct_messages dm
LEFT JOIN LATERAL (
    SELECT chat.*
    FROM chats chat
    WHERE chat.channel_id = dm.id
    ORDER BY chat.created_at DESC
    LIMIT 1
) AS last_chat ON TRUE
LEFT JOIN LATERAL (
  SELECT u.id, u.name, u.avatar, u.email
  FROM users u
  WHERE u.id = CASE WHEN dm.member_ids[1] = $1::uuid THEN dm.member_ids[2] ELSE dm.member_ids[1] END
  LIMIT 1
) AS chat_user ON TRUE
LEFT JOIN LATERAL (
  SELECT c.*
  FROM contacts c
  WHERE c.channel_id = dm.id
  AND c.user_id = CASE WHEN dm.member_ids[1] = $1::uuid THEN dm.member_ids[2] ELSE dm.member_ids[1] END
  AND c.created_by = $1::uuid
  LIMIT 1
) AS contact ON TRUE
WHERE dm.member_ids @> ARRAY[$1]::uuid[]
ORDER BY last_chat.created_at DESC;
