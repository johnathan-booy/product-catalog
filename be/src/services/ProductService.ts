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
    const sanitizedTerm = this.sanitizeFTSQuery(term)
    
    const products = await db.all(`
      SELECT p.id, p.name, p.description, p.category, p.brand, p.price, p.quantity, p.sku, 
             p.releaseDate, p.availabilityStatus, p.customerRating, p.createdAt, p.updatedAt 
      FROM products_fts 
      JOIN products p ON products_fts.rowid = p.id
      WHERE products_fts MATCH ?
      ORDER BY rank
    `, [`${sanitizedTerm}*`])
    
    return products.map(this.mapRowToProduct)
  }

  async generateProducts(count: number): Promise<void> {
    const db = getDatabase()
    const batchSize = 100
    const batches = Math.ceil(count / batchSize)

    await db.run('BEGIN TRANSACTION')
    
    try {
      for (let batch = 0; batch < batches; batch++) {
        const currentBatchSize = Math.min(batchSize, count - (batch * batchSize))
        const products = this.generateProductData(currentBatchSize)
        
        for (const product of products) {
          await db.run(
            `
            INSERT INTO products (name, description, category, brand, price, quantity, sku, releaseDate, availabilityStatus, customerRating, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
            [
              product.name,
              product.description,
              product.category,
              product.brand,
              product.price,
              product.quantity,
              product.sku,
              product.releaseDate.toISOString(),
              product.availabilityStatus,
              product.customerRating,
              product.createdAt.toISOString(),
              product.updatedAt.toISOString()
            ]
          )
        }
      }
      
      await db.run('COMMIT')
    } catch (error) {
      await db.run('ROLLBACK')
      throw error
    }
  }

  private generateProductData(count: number): Omit<ProductModel, 'id'>[] {
    const categories = ['Electronics', 'Clothing', 'Books', 'Sports', 'Home', 'Beauty', 'Toys', 'Automotive']
    const brands = ['TechCorp', 'StyleWear', 'BookWorld', 'SportsPro', 'HomePlus', 'BeautyMax', 'ToyLand', 'AutoGear']
    const statuses = ['in_stock', 'out_of_stock', 'limited_stock']
    
    const products: Omit<ProductModel, 'id'>[] = []
    
    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const brand = brands[Math.floor(Math.random() * brands.length)]
      const now = new Date()
      
      products.push({
        name: this.generateProductName(category),
        description: this.generateProductDescription(category),
        category,
        brand,
        price: Math.round((Math.random() * 999 + 1) * 100) / 100,
        quantity: Math.floor(Math.random() * 100),
        sku: this.generateSKU(brand, category),
        releaseDate: new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        availabilityStatus: statuses[Math.floor(Math.random() * statuses.length)],
        customerRating: Math.round((Math.random() * 4 + 1) * 10) / 10,
        createdAt: now,
        updatedAt: now
      })
    }
    
    return products
  }

  private generateProductName(category: string): string {
    const prefixes = {
      'Electronics': ['Smart', 'Pro', 'Ultra', 'Premium', 'Advanced'],
      'Clothing': ['Classic', 'Modern', 'Trendy', 'Casual', 'Formal'],
      'Books': ['Complete', 'Essential', 'Ultimate', 'Comprehensive', 'Definitive'],
      'Sports': ['Professional', 'Athletic', 'Performance', 'Training', 'Competition'],
      'Home': ['Luxury', 'Comfort', 'Modern', 'Classic', 'Elegant'],
      'Beauty': ['Natural', 'Organic', 'Premium', 'Professional', 'Luxury'],
      'Toys': ['Fun', 'Educational', 'Interactive', 'Creative', 'Adventure'],
      'Automotive': ['Heavy-Duty', 'Professional', 'Premium', 'Performance', 'Reliable']
    }
    
    const items = {
      'Electronics': ['Phone', 'Laptop', 'Headphones', 'Camera', 'Tablet'],
      'Clothing': ['Shirt', 'Jacket', 'Pants', 'Dress', 'Shoes'],
      'Books': ['Guide', 'Manual', 'Handbook', 'Reference', 'Collection'],
      'Sports': ['Ball', 'Equipment', 'Gear', 'Accessory', 'Tool'],
      'Home': ['Chair', 'Table', 'Lamp', 'Cushion', 'Decor'],
      'Beauty': ['Cream', 'Serum', 'Mask', 'Oil', 'Treatment'],
      'Toys': ['Game', 'Puzzle', 'Set', 'Kit', 'Plaything'],
      'Automotive': ['Tool', 'Part', 'Accessory', 'Component', 'Kit']
    }
    
    const prefix = prefixes[category][Math.floor(Math.random() * prefixes[category].length)]
    const item = items[category][Math.floor(Math.random() * items[category].length)]
    const suffix = Math.floor(Math.random() * 1000)
    
    return `${prefix} ${item} ${suffix}`
  }

  private generateProductDescription(category: string): string {
    const descriptions = {
      'Electronics': ['cutting-edge technology', 'user-friendly interface', 'high-performance capabilities', 'innovative design'],
      'Clothing': ['comfortable fit', 'premium materials', 'stylish design', 'versatile wear'],
      'Books': ['comprehensive coverage', 'expert insights', 'practical guidance', 'detailed information'],
      'Sports': ['professional quality', 'durable construction', 'enhanced performance', 'reliable equipment'],
      'Home': ['elegant design', 'comfortable living', 'modern aesthetics', 'functional beauty'],
      'Beauty': ['natural ingredients', 'proven results', 'gentle formula', 'professional quality'],
      'Toys': ['educational value', 'creative play', 'safe materials', 'engaging activities'],
      'Automotive': ['reliable performance', 'durable materials', 'precision engineering', 'professional grade']
    }
    
    const desc = descriptions[category][Math.floor(Math.random() * descriptions[category].length)]
    return `High-quality ${category.toLowerCase()} product featuring ${desc} and exceptional value.`
  }

  private generateSKU(brand: string, category: string): string {
    const brandCode = brand.substring(0, 3).toUpperCase()
    const categoryCode = category.substring(0, 3).toUpperCase()
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${brandCode}-${categoryCode}-${randomNum}`
  }

  private sanitizeFTSQuery(term: string): string {
    return term
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
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
