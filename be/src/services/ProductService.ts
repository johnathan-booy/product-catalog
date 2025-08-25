import { ProductModel } from "../models/ProductModel"
import { getDatabase } from "../config/database"

class ProductService {
  async findAll(): Promise<ProductModel[]> {
    const db = getDatabase()
    const products = await db.all(`
      SELECT id, name, description, category, brand, price, quantity, sku, 
             releaseDate, availabilityStatus, customerRating, createdAt, updatedAt 
      FROM products
    `)
    return products.map(this.mapRowToProduct)
  }

  async findById(id: number): Promise<ProductModel | undefined> {
    const db = getDatabase()
    const product = await db.get(
      `
      SELECT id, name, description, category, brand, price, quantity, sku, 
             releaseDate, availabilityStatus, customerRating, createdAt, updatedAt 
      FROM products 
      WHERE id = ?
    `,
      [id]
    )

    return product ? this.mapRowToProduct(product) : undefined
  }

  async create(productData: Omit<ProductModel, "id" | "createdAt" | "updatedAt">): Promise<ProductModel> {
    const db = getDatabase()
    const now = new Date().toISOString()

    const result = await db.run(
      `
      INSERT INTO products (name, description, category, brand, price, quantity, sku, releaseDate, availabilityStatus, customerRating, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        productData.name,
        productData.description,
        productData.category,
        productData.brand,
        productData.price,
        productData.quantity,
        productData.sku,
        productData.releaseDate.toISOString(),
        productData.availabilityStatus,
        productData.customerRating,
        now,
        now
      ]
    )

    const newProduct = await this.findById(result.lastID!)
    if (!newProduct) {
      throw new Error("Failed to create product")
    }

    return newProduct
  }

  async update(
    id: number,
    productData: Partial<Omit<ProductModel, "id" | "createdAt" | "updatedAt">>
  ): Promise<ProductModel | undefined> {
    const db = getDatabase()
    const updates: string[] = []
    const values: any[] = []

    if (productData.name !== undefined) {
      updates.push("name = ?")
      values.push(productData.name)
    }
    if (productData.description !== undefined) {
      updates.push("description = ?")
      values.push(productData.description)
    }
    if (productData.category !== undefined) {
      updates.push("category = ?")
      values.push(productData.category)
    }
    if (productData.brand !== undefined) {
      updates.push("brand = ?")
      values.push(productData.brand)
    }
    if (productData.price !== undefined) {
      updates.push("price = ?")
      values.push(productData.price)
    }
    if (productData.sku !== undefined) {
      updates.push("sku = ?")
      values.push(productData.sku)
    }
    if (productData.releaseDate !== undefined) {
      updates.push("releaseDate = ?")
      values.push(productData.releaseDate.toISOString())
    }
    if (productData.availabilityStatus !== undefined) {
      updates.push("availabilityStatus = ?")
      values.push(productData.availabilityStatus)
    }
    if (productData.customerRating !== undefined) {
      updates.push("customerRating = ?")
      values.push(productData.customerRating)
    }
    if (productData.quantity !== undefined) {
      updates.push("quantity = ?")
      values.push(productData.quantity)
    }

    if (updates.length === 0) {
      return this.findById(id)
    }

    updates.push("updatedAt = ?")
    values.push(new Date().toISOString())
    values.push(id)

    await db.run(
      `
      UPDATE products 
      SET ${updates.join(", ")} 
      WHERE id = ?
    `,
      values
    )

    return this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const db = getDatabase()
    const result = await db.run("DELETE FROM products WHERE id = ?", [id])
    return (result.changes ?? 0) > 0
  }

  async search(term: string): Promise<ProductModel[]> {
    const db = getDatabase()
    const products = await db.all(`
      SELECT p.id, p.name, p.description, p.category, p.brand, p.price, p.quantity, p.sku, 
             p.releaseDate, p.availabilityStatus, p.customerRating, p.createdAt, p.updatedAt 
      FROM products_fts 
      JOIN products p ON products_fts.rowid = p.id
      WHERE products_fts MATCH ?
      ORDER BY rank
    `, [`${term}*`])
    
    return products.map(this.mapRowToProduct)
  }

  private mapRowToProduct(row: any): ProductModel {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      brand: row.brand,
      price: row.price,
      quantity: row.quantity,
      sku: row.sku,
      releaseDate: new Date(row.releaseDate),
      availabilityStatus: row.availabilityStatus,
      customerRating: row.customerRating,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }
  }
}

export default new ProductService()
