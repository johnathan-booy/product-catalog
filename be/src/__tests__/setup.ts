import { Database } from 'sqlite'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

let testDb: Database

beforeAll(async () => {
  testDb = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  })

  await testDb.exec(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      releaseDate TEXT NOT NULL,
      availabilityStatus TEXT NOT NULL,
      customerRating REAL NOT NULL DEFAULT 0.0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `)

  await testDb.exec(`
    CREATE VIRTUAL TABLE products_fts USING fts5(
      name, description, category, brand, sku,
      content='products', content_rowid='id'
    )
  `)

  global.testDb = testDb
})

afterAll(async () => {
  if (testDb) {
    await testDb.close()
  }
})

afterEach(async () => {
  if (testDb) {
    await testDb.exec('DELETE FROM products')
    await testDb.exec(`INSERT INTO products_fts(products_fts) VALUES('rebuild')`)
  }
})

export { testDb }