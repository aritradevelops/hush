/*
  Fetches the channel id of a direct message by id
  @param {uuid} $1 - the user's id
  @param {uuid} $2 - the channel id
*/
SELECT 
  ch.*,
	row_to_json(u) AS chat_user,
  CASE WHEN c.id IS NULL THEN NULL ELSE row_to_json(c) END AS contact,
  CASE WHEN bu.id IS NULL THEN false ELSE true END AS has_blocked
FROM channels ch
LEFT JOIN channel_participants cp ON cp.channel_id = ch.id AND cp.user_id != $1::uuid
LEFT JOIN users u ON u.id = cp.user_id
LEFT JOIN blocked_users bu ON bu.user_id = cp.user_id AND bu.created_by = $1::uuid
LEFT JOIN contacts c ON c.user_id = cp.user_id AND c.created_by = $1::uuid
WHERE ch.id = $2::uuid
AND ch.type = '0'::channels_type_enum
AND ch.deleted_at IS NULL