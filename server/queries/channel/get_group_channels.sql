
/*
  Get all group channels for a user
  @param {uuid} $1 - The user's id
  @param {string} $2 - The search query
*/
SELECT 
  group_channel.id,
  group_channel.metadata->>'group_name' AS name,
  group_channel.metadata->>'group_group_image' AS picture,
  me.user_id AS user_id,                                
  me.has_pinned AS is_pinned,
  me.has_muted AS is_muted,
  me.created_at AS joined_at,
  me.deleted_at AS left_at,
  COALESCE(unread_chats.unread_count, 0) AS unread_count,
  COALESCE(last_chat.created_at, group_channel.created_at) as last_event_time,
  CASE 
    -- If there is no last chat, return NULL. Otherwise, construct a JSON object with details.
    WHEN last_chat.id IS NOT NULL THEN 
      json_build_object(
      'id', last_chat.id,
        'message', last_chat.message,
        'iv', last_chat.iv,
        'created_at', last_chat.created_at,
        'sender', 
        CASE 
          WHEN last_chat.created_by = COALESCE(last_chat_contact.user_id, last_chat_user.id) 
          THEN last_chat_contact.name
          ELSE 'You'
        END
      )
    ELSE NULL
  END AS last_chat
FROM channels AS group_channel
-- Join with group_members to get the user's membership details in the group
LEFT JOIN group_members AS me 
  ON me.channel_id = group_channel.id
  AND me.user_id = $1                                
-- Get the last chat message in the group
LEFT JOIN LATERAL (
  SELECT 
    chat.id,  
    chat.message,
    chat.iv,
    chat.created_by,
    chat.created_at
  FROM chats AS chat 
  WHERE chat.channel_id = group_channel.id
    AND (
      me.deleted_at IS NULL 
      OR chat.created_at < me.deleted_at
    )
  ORDER BY chat.created_at DESC
  LIMIT 1
) AS last_chat ON true
-- Fetch the contact name of the user who sent the last message
LEFT JOIN LATERAL (
  SELECT contact.name, contact.user_id 
  FROM contacts AS contact
  WHERE contact.user_id = last_chat.created_by
  AND contact.created_by = $1
) AS last_chat_contact ON true
-- Fetch the name from the users table if the sender is not in contacts
LEFT JOIN LATERAL (
  SELECT 
  	u.id,
    u.name
  FROM users AS u
  WHERE u.id = last_chat.created_by
) AS last_chat_user ON true
-- Get the count of unread messages in the group for the user
LEFT JOIN LATERAL (
  SELECT COUNT(1) AS unread_count
  FROM chats AS chat
  WHERE chat.channel_id = group_channel.id 
    AND chat.unread = true 
    AND chat.created_by != $1
) AS unread_chats ON true
-- Only fetch groups of type 1
WHERE group_channel.type = '1'
-- If search is provided, filter based on group name
AND (
  $2 = '' 
  OR to_tsvector('english', group_channel.metadata->>'group_name') @@ to_tsquery('english', $2)
)
-- Order by the latest chat or fallback to channel creation time
ORDER BY COALESCE(last_chat.created_at, group_channel.created_at) DESC;