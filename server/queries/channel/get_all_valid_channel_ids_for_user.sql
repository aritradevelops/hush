/*
 Fetches all valid channel ids for a user
 @param {uuid} $1 - the user's id
 */
SELECT id
FROM channels gc
WHERE EXISTS (
    SELECT 1
    FROM channel_participants cp
    WHERE cp.channel_id = gc.id
      AND cp.user_id = $1::uuid
      AND cp.deleted_at IS NULL
  )
  AND gc.type = '1'::channels_type_enum
UNION
SELECT id
FROM channels dm
WHERE EXISTS (
    SELECT 1
    FROM channel_participants cp
      LEFT JOIN blocked_users bu ON bu.user_id = cp.user_id
      AND bu.created_by = $1::uuid
    WHERE cp.channel_id = dm.id
      AND cp.user_id != $1::uuid
      AND cp.deleted_at IS NULL
      AND bu.id IS NULL
  )
  AND dm.type = '0'::channels_type_enum