/*
  details of a group by id
  @param {uuid} $1 - The group's id
  @param {uuid} $2 - The user's id
*/
SELECT
  g.*,
  row_to_json(me) as me,
  (
    SELECT
      array_agg(
        row_to_json(
          (SELECT r FROM (
            SELECT 
              u.id, u.email, u.name, u.avatar,
              (
                SELECT CASE 
                  WHEN c.id IS NULL THEN NULL 
                  ELSE row_to_json(c) 
                END
                FROM (
                  SELECT c.* 
                  FROM contacts c 
                  WHERE c.user_id = u.id 
                  AND c.created_by = $2::uuid
                  LIMIT 1
                ) c
              ) AS contact
          ) r)
        )
      )
    FROM
      users u
    WHERE
      u.id = ANY (g.member_ids)
  ) AS members
FROM
  groups g
LEFT JOIN LATERAL (SELECT u.id, u.email, u.name, u.avatar FROM users u WHERE u.id = $2::uuid) AS me ON TRUE
WHERE
  g.id = $1::uuid
  AND g.member_ids @> ARRAY[$2]::uuid[]
LIMIT
  1;
