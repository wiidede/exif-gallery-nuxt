import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import type * as schema from '../db/schema'

// Re-export Drizzle ORM functions and types
export { and, eq, or, sql } from 'drizzle-orm'

// Database types based on the driver
export type DBType = LibSQLDatabase<typeof schema>
export type DBTransaction = Parameters<Parameters<DBType['transaction']>[0]>[0]

// Photo type inference from schema
export type Photo = typeof schema.photo.$inferSelect
