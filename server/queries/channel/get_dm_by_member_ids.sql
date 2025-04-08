/*
  Fetches the channel id of a direct message between two users
  @param {uuid} $1 - the first user's id
  @param {uuid} $2 - the second user's id
*/
SELECT 
  ch.*,
  array_agg(SELECT cp.user_id FROM channel_participants cp WHERE cp.channel_id = ch.id AND cp.deleted_at IS NULL) as channel_participants
FROM channels ch
WHERE ch.type = '0'::channels_type_enum
AND channel_participants @> [$1::uuid, $2::uuid]
LIMIT 1