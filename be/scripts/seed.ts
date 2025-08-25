import { connectDatabase, closeDatabase } from "../src/config/database"

const seedDatabase = async () => {
  try {
    console.log("Connecting to database...")
    const db = await connectDatabase()

    console.log("Dropping existing products table if exists...")
    await db.exec(`DROP TABLE IF EXISTS products`)
    
    console.log("Creating products table with new schema...")
    await db.exec(`
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

    console.log("Creating FTS5 virtual table for search...")
    await db.exec(`
      CREATE VIRTUAL TABLE products_fts USING fts5(
        name, description, category, brand, sku,
        content='products', content_rowid='id'
      )
    `)

    console.log("Checking if products table needs seeding...")
    const existingProducts = await db.get("SELECT COUNT(*) as count FROM products")
    
    if (existingProducts.count === 0) {
      console.log("Seeding products table with sample data...")
      const sampleProducts = [
        {
          name: "iPhone 15 Pro",
          description: "Latest flagship smartphone from Apple with advanced camera system",
          category: "Electronics",
          brand: "Apple",
          price: 999.99,
          quantity: 1,
          sku: "APL-IP15P-128GB",
          releaseDate: "2023-09-22",
          availabilityStatus: "In Stock",
          customerRating: 4.8
        },
        {
          name: "Samsung Galaxy S24",
          description: "Premium Android smartphone with AI-powered features",
          category: "Electronics",
          brand: "Samsung",
          price: 899.99,
          quantity: 1,
          sku: "SAM-GS24-256GB",
          releaseDate: "2024-01-17",
          availabilityStatus: "In Stock",
          customerRating: 4.6
        },
        {
          name: "Nike Air Max 270",
          description: "Comfortable running shoes with air cushioning",
          category: "Footwear",
          brand: "Nike",
          price: 150.00,
          quantity: 2,
          sku: "NIK-AM270-10",
          releaseDate: "2023-03-15",
          availabilityStatus: "In Stock",
          customerRating: 4.4
        },
        {
          name: "MacBook Pro 14-inch",
          description: "Professional laptop with M3 chip for developers and creators",
          category: "Computers",
          brand: "Apple",
          price: 1999.99,
          quantity: 1,
          sku: "APL-MBP14-M3-512GB",
          releaseDate: "2023-10-30",
          availabilityStatus: "Limited Stock",
          customerRating: 4.9
        },
        {
          name: "Sony WH-1000XM5",
          description: "Wireless noise-canceling headphones with premium sound",
          category: "Audio",
          brand: "Sony",
          price: 399.99,
          quantity: 1,
          sku: "SNY-WH1000XM5-BLK",
          releaseDate: "2022-05-12",
          availabilityStatus: "In Stock",
          customerRating: 4.7
        }
      ]

      for (const product of sampleProducts) {
        const now = new Date().toISOString()
        await db.run(`
          INSERT INTO products (name, description, category, brand, price, quantity, sku, releaseDate, availabilityStatus, customerRating, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          product.name,
          product.description,
          product.category,
          product.brand,
          product.price,
          product.quantity,
          product.sku,
          product.releaseDate,
          product.availabilityStatus,
          product.customerRating,
          now,
          now
        ])
      }
      
      console.log(`Inserted ${sampleProducts.length} sample products`)
      
      console.log("Populating FTS5 virtual table...")
      await db.exec(`INSERT INTO products_fts(products_fts) VALUES('rebuild')`)
    } else {
      console.log(`Products table already has ${existingProducts.count} products`)
    }

    console.log("Database seeding completed successfully!")
    
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  } finally {
    await closeDatabase()
  }
}

seedDatabase()