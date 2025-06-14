/*
  Find new users that are not in the contacts list and has a valid public key to 
  start a conversation with a shared secret.
  @param {uuid} $1 - Id of the user initiating the request
  @param {string} $2 - Search query
*/
SELECT 
  u.*,
  ts_rank(u.search, to_tsquery($2)) AS rank
FROM users u
LEFT JOIN public_keys pk ON u.id = pk.user_id
WHERE u.id NOT IN (
  SELECT c.user_id FROM contacts c WHERE c.created_by = $1
) AND u.id != $1
AND u.deleted_at IS NULL
AND u.search @@ to_tsquery($2)
AND pk.key IS NOT NULL
ORDER BY rank DESC;