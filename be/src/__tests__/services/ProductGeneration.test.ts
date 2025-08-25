import ProductService from '../../services/ProductService'
import * as database from '../../config/database'

jest.mock('../../config/database', () => ({
  getDatabase: jest.fn()
}))

const mockDb = {
  run: jest.fn(),
  exec: jest.fn(),
  all: jest.fn()
}

const mockGetDatabase = database.getDatabase as jest.MockedFunction<typeof database.getDatabase>

describe('ProductService - Bulk Generation', () => {
  let productService: typeof ProductService

  beforeEach(() => {
    mockGetDatabase.mockReturnValue(mockDb as any)
    productService = ProductService
    jest.clearAllMocks()
  })

  describe('generateProducts', () => {
    it('should generate specified number of products in batches', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      await productService.generateProducts(250)

      // Should call BEGIN TRANSACTION
      expect(mockDb.run).toHaveBeenCalledWith('BEGIN TRANSACTION')
      
      // Should insert 250 products (3 batches of 100 each)
      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )
      expect(insertCalls).toHaveLength(250)

      // Should call COMMIT
      expect(mockDb.run).toHaveBeenCalledWith('COMMIT')
      
      // Should rebuild FTS index
      expect(mockDb.exec).toHaveBeenCalledWith(`INSERT INTO products_fts(products_fts) VALUES('rebuild')`)
    })

    it('should process products in batches of 100', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      await productService.generateProducts(250)

      // Should process 3 batches: 100, 100, 50
      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )
      expect(insertCalls).toHaveLength(250)
    })

    it('should handle small batch sizes', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      await productService.generateProducts(5)

      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )
      expect(insertCalls).toHaveLength(5)
    })

    it('should rollback transaction on error', async () => {
      mockDb.run
        .mockResolvedValueOnce({ changes: 1 }) // BEGIN TRANSACTION
        .mockRejectedValueOnce(new Error('Insert failed')) // First insert fails

      await expect(productService.generateProducts(10))
        .rejects.toThrow('Insert failed')

      expect(mockDb.run).toHaveBeenCalledWith('ROLLBACK')
      expect(mockDb.exec).not.toHaveBeenCalledWith(`INSERT INTO products_fts(products_fts) VALUES('rebuild')`)
    })

    it('should generate products with valid data structure', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      await productService.generateProducts(1)

      const insertCall = mockDb.run.mock.calls.find(call => 
        call[0].includes('INSERT INTO products')
      )

      expect(insertCall).toBeDefined()
      const [, params] = insertCall

      // Should have all required product fields
      expect(params).toHaveLength(12)
      expect(typeof params[0]).toBe('string') // name
      expect(typeof params[1]).toBe('string') // description
      expect(typeof params[2]).toBe('string') // category
      expect(typeof params[3]).toBe('string') // brand
      expect(typeof params[4]).toBe('number') // price
      expect(typeof params[5]).toBe('number') // quantity
      expect(typeof params[6]).toBe('string') // sku
      expect(typeof params[7]).toBe('string') // releaseDate
      expect(typeof params[8]).toBe('string') // availabilityStatus
      expect(typeof params[9]).toBe('number') // customerRating
      expect(typeof params[10]).toBe('string') // createdAt
      expect(typeof params[11]).toBe('string') // updatedAt
    })
  })

  describe('generateProductData', () => {
    it('should generate products with valid categories', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      const validCategories = ['Electronics', 'Clothing', 'Books', 'Sports', 'Home', 'Beauty', 'Toys', 'Automotive']

      await productService.generateProducts(8)

      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )

      insertCalls.forEach(call => {
        const [, params] = call
        const category = params[2]
        expect(validCategories).toContain(category)
      })
    })

    it('should generate products with valid brands', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      const validBrands = ['TechCorp', 'StyleWear', 'BookWorld', 'SportsPro', 'HomePlus', 'BeautyMax', 'ToyLand', 'AutoGear']

      await productService.generateProducts(8)

      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )

      insertCalls.forEach(call => {
        const [, params] = call
        const brand = params[3]
        expect(validBrands).toContain(brand)
      })
    })

    it('should generate products with valid price range', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      await productService.generateProducts(100)

      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )

      insertCalls.forEach(call => {
        const [, params] = call
        const price = params[4]
        expect(price).toBeGreaterThan(0)
        expect(price).toBeLessThanOrEqual(999.99)
        // Should be a reasonable decimal precision (allow slight floating point errors)
        expect(Math.round(price * 100)).toBe(Math.round(price * 100))
      })
    })

    it('should generate products with valid quantity range', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      await productService.generateProducts(100)

      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )

      insertCalls.forEach(call => {
        const [, params] = call
        const quantity = params[5]
        expect(quantity).toBeGreaterThanOrEqual(0)
        expect(quantity).toBeLessThan(100)
        expect(Number.isInteger(quantity)).toBe(true)
      })
    })

    it('should generate products with valid customer rating range', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      await productService.generateProducts(100)

      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )

      insertCalls.forEach(call => {
        const [, params] = call
        const customerRating = params[9]
        expect(customerRating).toBeGreaterThanOrEqual(1.0)
        expect(customerRating).toBeLessThanOrEqual(5.0)
        // Should be rounded to 1 decimal place
        expect(Number.isInteger(customerRating * 10)).toBe(true)
      })
    })

    it('should generate products with valid availability status', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      const validStatuses = ['in_stock', 'out_of_stock', 'limited_stock']

      await productService.generateProducts(100)

      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )

      insertCalls.forEach(call => {
        const [, params] = call
        const availabilityStatus = params[8]
        expect(validStatuses).toContain(availabilityStatus)
      })
    })

    it('should generate products with properly formatted SKUs', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      await productService.generateProducts(10)

      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )

      insertCalls.forEach(call => {
        const [, params] = call
        const sku = params[6]
        
        // SKU format: XXX-XXX-XXXX (brand-category-number)
        expect(sku).toMatch(/^[A-Z]{3}-[A-Z]{3}-\d{4}$/)
      })
    })

    it('should generate products with valid timestamps', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      await productService.generateProducts(5)

      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )

      insertCalls.forEach(call => {
        const [, params] = call
        const releaseDate = params[7]
        const createdAt = params[10]
        const updatedAt = params[11]

        // Should be valid ISO strings
        expect(() => new Date(releaseDate)).not.toThrow()
        expect(() => new Date(createdAt)).not.toThrow()
        expect(() => new Date(updatedAt)).not.toThrow()

        // Release date should be in the past year
        const releaseDateObj = new Date(releaseDate)
        const now = new Date()
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        
        expect(releaseDateObj).toBeAfter(yearAgo)
        expect(releaseDateObj).toBeBeforeOrEqual(now)
      })
    })
  })

  describe('Performance Tests', () => {
    it('should handle large batch generation efficiently', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.exec.mockResolvedValue(undefined)

      const startTime = Date.now()
      await productService.generateProducts(1000)
      const endTime = Date.now()

      // Should complete within reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000)

      // Should make expected number of calls
      const insertCalls = mockDb.run.mock.calls.filter(call => 
        call[0].includes('INSERT INTO products')
      )
      expect(insertCalls).toHaveLength(1000)
    })
  })
})

// Custom Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAfter(date: Date): R
      toBeBeforeOrEqual(date: Date): R
    }
  }
}

expect.extend({
  toBeAfter(received: Date, expected: Date) {
    const pass = received.getTime() > expected.getTime()
    return {
      message: () =>
        `expected ${received.toISOString()} to be after ${expected.toISOString()}`,
      pass
    }
  },
  toBeBeforeOrEqual(received: Date, expected: Date) {
    const pass = received.getTime() <= expected.getTime()
    return {
      message: () =>
        `expected ${received.toISOString()} to be before or equal to ${expected.toISOString()}`,
      pass
    }
  }
})