import { eq, inArray, sql } from 'drizzle-orm'
import { blob } from 'hub:blob'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const { id } = event.context.params || {}

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'id is required',
    })
  }

  // Get the photo record first
  const photo = await db.query.photo.findFirst({
    where: (photo, { eq }) => eq(photo.id, id),
  })

  if (!photo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Photo not found',
    })
  }

  // Delete files from hub
  const formats = ['jpeg', 'webp', 'avif', 'thumbnail'] as const
  const deletePromises = formats.map(async (format) => {
    const pathname = photo[format]
    if (pathname) {
      try {
        await blob.delete(pathname)
      }
      catch (error) {
        console.error(`Failed to delete ${format} file (${pathname}):`, error)
      }
    }
  })

  await Promise.allSettled(deletePromises)

  try {
    const currentPhotoTags = await db.query.photoTag.findMany({
      where: eq(schema.photoTag.photoId, id),
    })

    await db.delete(schema.photo).where(eq(schema.photo.id, id))

    if (currentPhotoTags.length > 0) {
      await db.delete(schema.photoTag)
        .where(eq(schema.photoTag.photoId, id))

      await db.update(schema.tag)
        .set({ photoCount: sql`${schema.tag.photoCount} - 1` })
        .where(inArray(schema.tag.id, currentPhotoTags.map(pt => pt.tagId)))

      await db.delete(schema.tag)
        .where(eq(schema.tag.photoCount, 0))
    }
  }
  catch (error) {
    console.error('Failed to delete photo from database:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete photo',
    })
  }

  return { success: true }
})
