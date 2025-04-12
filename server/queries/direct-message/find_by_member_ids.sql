/*
  Find or create a direct message between two users
  @param {uuid} $1 - Id of the user initiating the request
  @param {uuid} $2 - Id of the person he wants to add
*/
SELECT * FROM direct_messages 
WHERE member_ids @> ARRAY[$1, $2]::uuid[]
LIMIT 1;
