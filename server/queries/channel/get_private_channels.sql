/*
Get all the private channels for a user
@param {uuid} $1 - user's id
@param {string} $2 - Search for contacts' names
*/
SELECT 
    private_channel.id,
    my_contact.name,
    u.avatar as picture,
    my_contact.user_id,
    my_contact.is_pinned,
    my_contact.is_muted,
    my_contact.search,
    (CASE WHEN my_contact.status = '1' THEN true else false END ) as is_pending,
    my_contact.is_blocked AS have_blocked,
    COALESCE(unread_chats.unread_count, 0) AS unread_count,
    COALESCE(their_contact.is_blocked, false) AS been_blocked,
    COALESCE(last_chat.created_by, private_channel.created_by) as last_event_time,
    CASE 
		-- If there is not last chat then populate it as null else as a nested object  
        WHEN last_chat.id IS NOT NULL THEN 
            json_build_object(
                'id', last_chat.id,
                'message', last_chat.message,
                'iv', last_chat.iv,
                'created_at', last_chat.created_at,
                'sender', 
                CASE 
                    WHEN last_chat.created_by = my_contact.user_id THEN my_contact.name
                    ELSE 'You'
                END
            )
        ELSE NULL
    END AS last_chat
FROM channels private_channel
-- select channels that are part of my contact
LEFT JOIN contacts my_contact 
    ON my_contact.created_by = $1 
    AND private_channel.id = my_contact.channel_id
-- populate the cotact user to see their dp
LEFT JOIN users u ON u.id = my_contact.user_id
-- populate their contact to see whether i'm blocked
LEFT JOIN contacts their_contact 
    ON their_contact.user_id = $1 
    AND their_contact.created_by = my_contact.user_id
-- query the last chat
LEFT JOIN LATERAL (
    SELECT 
        chat.id,  
        chat.message,
        chat.iv,
        chat.created_by,
        chat.created_at
    FROM chats chat
    WHERE chat.channel_id = private_channel.id
    ORDER BY chat.created_at DESC
    LIMIT 1
) last_chat ON true
-- query all the unread chats
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS unread_count
    FROM chats chat
    WHERE chat.channel_id = private_channel.id 
    AND chat.unread = true 
    AND chat.created_by != $1
) unread_chats ON true
-- select only the private channels
WHERE private_channel.type = '0'
-- if search is provided then search on name else leave
AND $2 = '' OR my_contact.search @@ to_tsquery($2)
-- order by the last chat or the channel created at
ORDER BY COALESCE(last_chat.created_by, private_channel.created_by) DESC;









