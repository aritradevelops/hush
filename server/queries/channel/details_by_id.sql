/*
  Fetches a specific channel (group or dm) by channel ID
  and includes unread count and last message for the given user

  @param {uuid} $1 - the user's id
  @param {uuid} $2 - the channel id
*/

WITH base_channel AS (
  -- For groups
  SELECT
    ch.id,
    'group' AS type,
    ch.metadata ->> 'name' AS name,
    ch.metadata ->> 'image' AS image,
    p.has_muted,
    p.has_pinned,
    false AS has_blocked,
    CASE
      WHEN p.deleted_at IS NULL THEN false
      ELSE true
    END AS has_left,
    p.deleted_at AS permissible_last_message_timestamp
  FROM
    channels ch
    LEFT JOIN channel_participants p
      ON p.channel_id = ch.id AND p.user_id = $1::uuid
  WHERE
    ch.id = $2::uuid
    AND ch.type = '1'::channels_type_enum
    AND ch.deleted_at IS NULL

  UNION

  -- For DMs
  SELECT
    ch.id,
    'dm' AS type,
    COALESCE(c.nickname, u.name) AS name,
    u.dp AS image,
    me.has_muted,
    me.has_pinned,
    false AS has_left,
    CASE
      WHEN b.id IS NULL THEN false
      ELSE true
    END AS has_blocked,
    b.created_at AS permissible_last_message_timestamp
  FROM
    channels ch
    LEFT JOIN channel_participants p
      ON p.channel_id = ch.id AND p.user_id != $1::uuid
    LEFT JOIN users u ON u.id = p.user_id
    LEFT JOIN channel_participants me
      ON me.channel_id = ch.id AND me.user_id = $1::uuid
    LEFT JOIN contacts c
      ON c.user_id = p.user_id AND c.created_by = $1::uuid AND c.deleted_at IS NULL
    LEFT JOIN blocked_users b
      ON b.user_id = p.user_id AND b.created_by = $1::uuid AND b.deleted_at IS NULL
  WHERE
    ch.id = $2::uuid
    AND ch.type = '0'::channels_type_enum
    AND ch.deleted_at IS NULL
)

SELECT
  bc.*,
  CASE
    WHEN last_chat.id IS NULL THEN NULL
    ELSE row_to_json(last_chat)
  END AS last_chat,
  (
    SELECT COUNT(1)
    FROM user_chat_interactions uci
    WHERE uci.channel_id = bc.id
      AND uci.status != 2
      AND uci.created_by = $1::uuid
      AND uci.deleted_at IS NULL
  ) AS unread_count
FROM
  base_channel bc
  LEFT JOIN LATERAL (
    SELECT
      c.id,
      CASE
        WHEN c.deleted_at IS NULL THEN c.encrypted_message
        ELSE 'deleted message'
      END AS encrypted_message,
      c.iv,
      c.created_at,
      c.updated_at,
      c.deleted_at,
      c.created_by,
      c.updated_by,
      c.deleted_by,
      COALESCE(contact.nickname, u.name) AS sender_name,
      u.dp AS sender_dp
    FROM chats c
      LEFT JOIN users u ON u.id = c.created_by
      LEFT JOIN contacts contact
        ON contact.user_id = c.created_by AND contact.created_by = $1::uuid
    WHERE
      c.channel_id = bc.id
      AND c.created_at < COALESCE(bc.permissible_last_message_timestamp, current_timestamp)
    ORDER BY c.created_at DESC
    LIMIT 1
  ) AS last_chat ON true
ORDER BY last_chat.created_at DESC NULLS LAST;
