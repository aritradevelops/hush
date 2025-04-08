/*
  Find new users that are not in the contacts list
  @param {uuid} $1 - Id of the user initiating the request
  @param {string} $2 - Search query
*/
SELECT 
  u.*,
  ts_rank(u.search, to_tsquery($2)) AS rank
FROM users u
WHERE u.id NOT IN (
  SELECT c.user_id FROM contacts c WHERE c.created_by = $1
) AND u.id != $1
AND u.deleted_at IS NULL
AND u.search @@ to_tsquery($2)
ORDER BY rank DESC;