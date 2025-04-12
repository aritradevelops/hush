/*
  Fetches the messages of a group channel
  @param {uuid} $1 - the user's id
  @param {uuid} $2 - the channel id
  @param {integer} $3 - the offset
  @param {integer} $4 - the limit
*/
WITH chats AS (SELECT
  c.*,
  CASE
    WHEN c.deleted_at IS NULL THEN c.encrypted_message
    ELSE 'deleted message'
  END AS encrypted_message,
  CASE
    WHEN reply.id IS NULL THEN NULL
    ELSE row_to_json(reply)
  END AS reply,
  uci.status
FROM
  chats c
  LEFT JOIN chats reply ON reply.id = c.replied_to
  LEFT JOIN user_chat_interactions uci ON uci.chat_id = c.id AND uci.created_by = $1::uuid
  CROSS JOIN LATERAL (
    SELECT
      cp.created_at,
      cp.deleted_at
    FROM
      channel_participants cp
    WHERE
      cp.channel_id = $2::uuid
      AND cp.user_id = $1::uuid
    LIMIT 1
  ) AS user_participation
WHERE
  c.channel_id = $2::uuid
  AND c.created_at > user_participation.created_at
  AND c.created_at < COALESCE(user_participation.deleted_at, current_timestamp)
  ORDER BY
  c.created_at DESC)
  SELECT (SELECT COUNT(1) as total_count FROM chats), chats.* FROM chats OFFSET $3::integer LIMIT $4::integer;