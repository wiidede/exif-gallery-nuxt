import { and, eq, sql } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const {
    hidden,
    limit = 20, // 设置默认值，避免无限查询
    offset = 0,
    orderBy = 'takenAt',
    order = 'desc',
    tag,
  } = query

  // 转换为数字
  const limitNum = Number(limit)
  const offsetNum = Number(offset)
  const conditions = []

  if (hidden !== undefined)
    conditions.push(eq(schema.photo.hidden, hidden === 'true'))

  // 使用子查询而不是多次查询
  let photoIdsSubquery = null
  if (tag) {
    // 使用原生 SQL 子查询来提高性能
    photoIdsSubquery = sql`
      SELECT pt.photo_id
      FROM photo_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE t.name = ${String(tag)}
    `
  }

  // 计算总数和获取数据可以合并为一个查询
  let total = 0

  // 如果有标签过滤但没有匹配的标签，直接返回空结果
  if (tag) {
    const tagExists = await db.query.tag.findFirst({
      where: eq(schema.tag.name, String(tag)),
    })

    if (!tagExists) {
      return {
        data: [],
        total: 0,
        limit: limitNum,
        offset: offsetNum,
      }
    }
  }

  // 使用更高效的查询方式
  let photos
  if (photoIdsSubquery) {
    // 使用 SQL 子查询来过滤照片
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.photo)
      .where(
        and(
          conditions.length > 0 ? and(...conditions) : undefined,
          sql`id IN (${photoIdsSubquery})`,
        ),
      )
      .get()

    total = countResult?.count || 0

    if (total === 0) {
      return {
        data: [],
        total: 0,
        limit: limitNum,
        offset: offsetNum,
      }
    }

    photos = await db.query.photo.findMany({
      where: and(
        conditions.length > 0 ? and(...conditions) : undefined,
        sql`id IN (${photoIdsSubquery})`,
      ),
      limit: limitNum,
      offset: offsetNum,
      orderBy: (col => order === 'desc' ? sql`${col} DESC` : sql`${col} ASC`)(schema.photo[orderBy as keyof typeof schema.photo]),
    })
  }
  else {
    // 没有标签过滤时的查询
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.photo)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .get()

    total = countResult?.count || 0

    photos = await db.query.photo.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: limitNum,
      offset: offsetNum,
      orderBy: (col => order === 'desc' ? sql`${col} DESC` : sql`${col} ASC`)(schema.photo[orderBy as keyof typeof schema.photo]),
    })
  }

  return {
    data: photos,
    total,
    limit: limitNum,
    offset: offsetNum,
  }
})
