import type { DBType } from './drizzle'
import { eq, inArray, sql } from 'drizzle-orm'

export async function processPhotoTags(db: DBType, photoId: string, tags: string | null | undefined) {
  if (tags === undefined || tags === null)
    return

  const tagNames = tags.split(',').map(t => t.trim()).filter(Boolean)

  if (tagNames.length === 0)
    return

  // Get current photo tags for decrementing counts
  const currentPhotoTags = await db.query.photoTag.findMany({
    where: eq(schema.photoTag.photoId, photoId),
  })

  // Get the tag IDs that need to be decremented
  const tagIdsToDecrement = currentPhotoTags.map(pt => pt.tagId)

  // First, find all existing tags in one query
  const existingTags = await db.query.tag.findMany({
    where: inArray(schema.tag.name, tagNames),
  })

  // Create a map of tag names to their IDs for quick lookup
  const tagMap = new Map(existingTags.map(tag => [tag.name, tag.id]))

  // Prepare operations for new tags - set photoCount to 0 (will be incremented later)
  const newTagOperations = tagNames
    .filter(name => !tagMap.has(name))
    .map(name => ({
      name,
      photoCount: 0, // Start with 0, will be incremented later
    }))

  // Insert new tags if any
  if (newTagOperations.length > 0) {
    const newTags = await db.insert(schema.tag)
      .values(newTagOperations)
      .returning()

    // Add new tags to the map
    newTags.forEach(tag => tagMap.set(tag.name, tag.id))
  }

  // Get all tag IDs that will be used
  const allTagIds = tagNames.map(name => tagMap.get(name)!).filter(Boolean)

  // Find which tags are being added and which are being kept
  const addedTagIds = allTagIds.filter(id => !tagIdsToDecrement.includes(id))
  const removedTagIds = tagIdsToDecrement.filter(id => !allTagIds.includes(id))

  // Execute operations sequentially for better reliability
  // 1. Delete existing photo-tag relationships
  if (currentPhotoTags.length > 0) {
    await db.delete(schema.photoTag)
      .where(eq(schema.photoTag.photoId, photoId))
  }

  // 2. Decrement counts for removed tags
  if (removedTagIds.length > 0) {
    await db.update(schema.tag)
      .set({ photoCount: sql`${schema.tag.photoCount} - 1` })
      .where(inArray(schema.tag.id, removedTagIds))
  }

  // 3. Create new photo-tag relationships one by one to avoid conflicts
  for (const tagId of allTagIds) {
    await db.insert(schema.photoTag)
      .values({ photoId, tagId })
      .onConflictDoNothing()
  }

  // 4. Increment counts for added tags
  if (addedTagIds.length > 0) {
    await db.update(schema.tag)
      .set({ photoCount: sql`${schema.tag.photoCount} + 1` })
      .where(inArray(schema.tag.id, addedTagIds))
  }
}
