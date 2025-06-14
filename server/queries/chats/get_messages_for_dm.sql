/*
  Fetches the messages of a direct message channel
  @param {uuid} $1 - the user's id
  @param {uuid} $2 - the channel id
  @param {integer} $3 - the offset
  @param {integer} $4 - the limit
*/
WITH
  chats AS (
    SELECT
      c.*,
      CASE
        WHEN c.deleted_at IS NULL THEN c.encrypted_message
        ELSE 'deleted message'
      END AS encrypted_message,
      CASE
        WHEN reply.id IS NULL THEN NULL
        ELSE row_to_json(reply)
      END AS reply,
      (
        SELECT
          array_agg(row_to_json(uci))
        FROM
          user_chat_interactions uci
        WHERE
          uci.chat_id = c.id
          AND uci.created_by != $1::uuid
      ) as ucis
    FROM
      chats c
      LEFT JOIN chats reply ON reply.id = c.replied_to
      LEFT JOIN channel_participants cp ON cp.channel_id = $2::uuid
      AND cp.user_id != $1::uuid
      LEFT JOIN blocked_users bu ON bu.user_id = cp.user_id
      AND bu.deleted_at IS NULL
    WHERE
      c.channel_id = $2::uuid
      AND c.created_at < COALESCE(bu.created_at, current_timestamp)
    ORDER BY
      c.created_at DESC
  )
SELECT
  (
    SELECT
      COUNT(1) as total_count
    FROM
      chats
  ),
  chats.*
FROM
  chats
OFFSET
  $3::integer
LIMIT
  $4::integer;

  