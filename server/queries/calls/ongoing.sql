/*
  Fetches the ongoing calls for an user
  @param {uuid} $1 - the user's id
*/

SELECT c.* 
FROM calls c
WHERE c.ended_at IS NULL 
AND EXISTS (
  SELECT 1 
  FROM channel_participants cp
  WHERE c.channel_id = cp.channel_id
  AND cp.user_id = $1::uuid
  AND cp.deleted_at IS NULL
)