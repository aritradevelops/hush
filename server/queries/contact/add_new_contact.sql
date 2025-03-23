/*
  Add a new contact to the user's contact list and create channel for them
  @param {uuid} $1 - The user's id
  @param {uuid} $2 - The new contact's id
*/
WITH new_channel AS (
  INSERT INTO channels (type, created_by) 
  VALUES ('0', $1::UUID) 
  RETURNING id
)
INSERT INTO contacts (name, channel_id, user_id, status, created_by)
-- add the user as my contact
SELECT name, new_channel.id, $1::UUID, '2'::contacts_status_enum, $2::UUID 
FROM users, new_channel 
WHERE users.id = $1::UUID

UNION ALL

-- add me to the user's contact as pending
SELECT name, new_channel.id, $2::UUID, '1'::contacts_status_enum, $1::UUID 
FROM users, new_channel 
WHERE users.id = $2::UUID