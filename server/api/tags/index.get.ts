import { desc, sql } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const { limit, offset } = query

  const tags = await db
    .select({
      id: schema.tag.id,
      name: schema.tag.name,
      createdAt: schema.tag.createdAt,
      photoCount: schema.tag.photoCount,
    })
    .from(schema.tag)
    .orderBy(desc(schema.tag.photoCount))
    .limit(limit ? Number(limit) : 9999999)
    .offset(offset ? Number(offset) : 0)

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.tag)
    .get()

  return {
    data: tags,
    total: total?.count || 0,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  }
})
