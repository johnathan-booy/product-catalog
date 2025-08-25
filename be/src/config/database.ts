import sqlite3 from "sqlite3"
import { open, Database } from "sqlite"
import path from "path"

let db: Database | null = null

export const connectDatabase = async (): Promise<Database> => {
  if (db) {
    return db
  }

  const dbPath = path.join(process.cwd(), "database.sqlite")

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  console.log("Connected to SQLite database")
  return db
}

export const getDatabase = (): Database => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDatabase() first.")
  }
  return db
}

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close()
    db = null
    console.log("Database connection closed")
  }
}