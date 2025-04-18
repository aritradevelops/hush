/*
  List groups with the last chat for a user
  @param {uuid} $1 - The user's id
*/
SELECT 
    g.*,
    CASE 
        WHEN last_chat.id IS NOT NULL 
        THEN row_to_json(last_chat) 
        ELSE NULL 
    END AS last_chat
FROM groups g
LEFT JOIN LATERAL (
    SELECT chat.*
    FROM chats chat
    WHERE chat.channel_id = g.id
    ORDER BY chat.created_at DESC
    LIMIT 1
) AS last_chat ON TRUE
WHERE g.member_ids @> ARRAY[$1]::uuid[]
ORDER BY last_chat.created_at DESC;
