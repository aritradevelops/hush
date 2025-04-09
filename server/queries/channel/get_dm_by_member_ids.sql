/*
  Fetches the channel id of a direct message between two users
  @param {uuid} $1 - the first user's id
  @param {uuid} $2 - the second user's id
*/
SELECT
  ch.*,
  array_agg(cp.user_id) as channel_participants
FROM channels ch
JOIN channel_participants cp ON cp.channel_id = ch.id AND cp.deleted_at IS NULL
WHERE ch.type = '0'::channels_type_enum
GROUP BY ch.id
HAVING array_agg(cp.user_id) @> ARRAY[$1::uuid, $2::uuid]
LIMIT 1