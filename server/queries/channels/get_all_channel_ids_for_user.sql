SELECT
  dm.id
FROM direct_messages dm
WHERE dm.member_ids @> ARRAY[$1]::uuid[]
UNION
SELECT
  g.id
FROM groups g
WHERE g.member_ids @> ARRAY[$1]::uuid[]