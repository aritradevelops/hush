/*
  Fetches the channel id of a group by id
  @param {uuid} $1 - the user's id
  @param {uuid} $2 - the channel id
*/
WITH
  gms AS (
    SELECT
      cp.*,
      CASE
        WHEN bu.id IS NULL THEN false
        ELSE true
      END AS is_blocked,
      row_to_json(c.*) AS contact,
      row_to_json(u.*) AS user
    FROM
      channel_participants cp
      LEFT JOIN users u ON u.id = cp.user_id
      LEFT JOIN blocked_users bu ON bu.id = cp.user_id
      AND bu.created_by = $1
      AND bu.deleted_at IS NULL
      LEFT JOIN contacts c ON c.user_id = cp.id
      AND c.created_by = $1
      AND c.deleted_at IS NULL
    WHERE
      cp.channel_id = $2::uuid
  )
SELECT
  g.*,
  (
    SELECT
      array_agg(row_to_json(gm.*))
    FROM
      gms gm
  ) as group_members,
  user_part.has_left
FROM
  channels g
  CROSS JOIN LATERAL (
    SELECT 
      user_id,
      deleted_at IS NOT NULL as has_left
    FROM 
      gms
    WHERE 
      user_id = $1
    LIMIT 1
  ) user_part
WHERE
  g.id = $2
  AND g.type = '1'