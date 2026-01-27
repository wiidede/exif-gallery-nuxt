-- 1. 先备份现有数据（可选）
CREATE TABLE IF NOT EXISTS photo_tags_backup AS SELECT * FROM photo_tags;
CREATE TABLE IF NOT EXISTS tags_backup AS SELECT * FROM tags;

-- 2. 重置标签计数
UPDATE tags SET photo_count = 0;

-- 3. 重建photo_tags关系
-- 先清空现有关系
DELETE FROM photo_tags;

-- 4. 重新插入关系（从photos表的tags字段解析）
WITH RECURSIVE
split(photo_id, tag, rest) AS (
  SELECT
    id as photo_id,
    substr(tags, 1, case when instr(tags, ',') = 0 then length(tags) else instr(tags, ',') - 1 end) as tag,
    substr(tags, case when instr(tags, ',') = 0 then length(tags) + 1 else instr(tags, ',') + 1 end) as rest
  FROM photos
  WHERE tags IS NOT NULL AND tags != ''
  UNION ALL
  SELECT
    photo_id,
    substr(rest, 1, case when instr(rest, ',') = 0 then length(rest) else instr(rest, ',') - 1 end),
    substr(rest, case when instr(rest, ',') = 0 then length(rest) + 1 else instr(rest, ',') + 1 end)
  FROM split
  WHERE rest != ''
)
INSERT INTO photo_tags (photo_id, tag_id)
SELECT DISTINCT s.photo_id, t.id as tag_id
FROM split s
JOIN tags t ON trim(s.tag) = t.name
WHERE s.tag != '';

-- 5. 更新标签计数
UPDATE tags
SET photo_count = (
  SELECT COUNT(DISTINCT pt.photo_id)
  FROM photo_tags pt
  WHERE pt.tag_id = tags.id
);

-- 6. 验证结果
SELECT
  t.name,
  t.photo_count as expected_count,
  (SELECT COUNT(*) FROM photo_tags pt WHERE pt.tag_id = t.id) as actual_count
FROM tags t
WHERE t.photo_count != (SELECT COUNT(*) FROM photo_tags pt WHERE pt.tag_id = t.id);