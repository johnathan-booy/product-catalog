import ProductService from '../../services/ProductService'
import { ProductModel } from '../../models/ProductModel'
import * as database from '../../config/database'

jest.mock('../../config/database', () => ({
  getDatabase: jest.fn()
}))

const mockDb = {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn(),
  exec: jest.fn()
}

const mockGetDatabase = database.getDatabase as jest.MockedFunction<typeof database.getDatabase>

describe('ProductService', () => {
  let productService: typeof ProductService

  beforeEach(() => {
    mockGetDatabase.mockReturnValue(mockDb as any)
    productService = ProductService
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          category: 'Electronics',
          brand: 'TestBrand',
          price: 99.99,
          quantity: 10,
          sku: 'TEST-001',
          releaseDate: '2023-01-01',
          availabilityStatus: 'in_stock',
          customerRating: 4.5,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ]

      mockDb.all.mockResolvedValue(mockProducts)

      const result = await productService.findAll()

      expect(mockDb.all).toHaveBeenCalledWith(expect.stringContaining('SELECT'))
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Test Product')
      expect(result[0].releaseDate).toBeInstanceOf(Date)
    })

    it('should handle empty results', async () => {
      mockDb.all.mockResolvedValue([])

      const result = await productService.findAll()

      expect(result).toHaveLength(0)
    })
  })

  describe('findById', () => {
    it('should return product when found', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        category: 'Electronics',
        brand: 'TestBrand',
        price: 99.99,
        quantity: 10,
        sku: 'TEST-001',
        releaseDate: '2023-01-01',
        availabilityStatus: 'in_stock',
        customerRating: 4.5,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      mockDb.get.mockResolvedValue(mockProduct)

      const result = await productService.findById(1)

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        [1]
      )
      expect(result?.name).toBe('Test Product')
      expect(result?.id).toBe(1)
    })

    it('should return undefined when product not found', async () => {
      mockDb.get.mockResolvedValue(undefined)

      const result = await productService.findById(999)

      expect(result).toBeUndefined()
    })
  })

  describe('create', () => {
    it('should create a new product', async () => {
      const productData: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'New Product',
        description: 'New Description',
        category: 'Electronics',
        brand: 'NewBrand',
        price: 199.99,
        quantity: 5,
        sku: 'NEW-001',
        releaseDate: new Date('2023-01-01'),
        availabilityStatus: 'in_stock',
        customerRating: 4.0
      }

      const mockCreatedProduct = {
        ...productData,
        id: 1,
        releaseDate: '2023-01-01',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      mockDb.run.mockResolvedValue({ lastID: 1 })
      mockDb.get.mockResolvedValue(mockCreatedProduct)

      const result = await productService.create(productData)

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.arrayContaining([
          productData.name,
          productData.description,
          productData.category,
          productData.brand,
          productData.price,
          productData.quantity,
          productData.sku,
          expect.any(String), // releaseDate ISO string
          productData.availabilityStatus,
          productData.customerRating,
          expect.any(String), // createdAt
          expect.any(String)  // updatedAt
        ])
      )
      expect(result.name).toBe('New Product')
      expect(result.id).toBe(1)
    })

    it('should throw error when creation fails', async () => {
      const productData: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'New Product',
        description: 'New Description',
        category: 'Electronics',
        brand: 'NewBrand',
        price: 199.99,
        quantity: 5,
        sku: 'NEW-001',
        releaseDate: new Date('2023-01-01'),
        availabilityStatus: 'in_stock',
        customerRating: 4.0
      }

      mockDb.run.mockResolvedValue({ lastID: 1 })
      mockDb.get.mockResolvedValue(undefined)

      await expect(productService.create(productData)).rejects.toThrow('Failed to create product')
    })
  })

  describe('update', () => {
    it('should update existing product', async () => {
      const updateData = { name: 'Updated Product', price: 299.99 }
      const mockUpdatedProduct = {
        id: 1,
        name: 'Updated Product',
        description: 'Test Description',
        category: 'Electronics',
        brand: 'TestBrand',
        price: 299.99,
        quantity: 10,
        sku: 'TEST-001',
        releaseDate: '2023-01-01',
        availabilityStatus: 'in_stock',
        customerRating: 4.5,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      mockDb.run.mockResolvedValue({ changes: 1 })
      mockDb.get.mockResolvedValue(mockUpdatedProduct)

      const result = await productService.update(1, updateData)

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products'),
        expect.arrayContaining([
          'Updated Product',
          299.99,
          expect.any(String), // updatedAt
          1
        ])
      )
      expect(result?.name).toBe('Updated Product')
      expect(result?.price).toBe(299.99)
    })

    it('should return original product when no updates provided', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        category: 'Electronics',
        brand: 'TestBrand',
        price: 99.99,
        quantity: 10,
        sku: 'TEST-001',
        releaseDate: '2023-01-01',
        availabilityStatus: 'in_stock',
        customerRating: 4.5,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      mockDb.get.mockResolvedValue(mockProduct)

      const result = await productService.update(1, {})

      expect(mockDb.run).not.toHaveBeenCalled()
      expect(result?.name).toBe('Test Product')
    })
  })

  describe('delete', () => {
    it('should delete product successfully', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 })

      const result = await productService.delete(1)

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM products WHERE id = ?', [1])
      expect(result).toBe(true)
    })

    it('should return false when product not found', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 })

      const result = await productService.delete(999)

      expect(result).toBe(false)
    })
  })

  describe('search', () => {
    it('should search products successfully', async () => {
      const mockSearchResults = [
        {
          id: 1,
          name: 'iPhone 15',
          description: 'Latest smartphone',
          category: 'Electronics',
          brand: 'Apple',
          price: 999.99,
          quantity: 10,
          sku: 'IPHONE-15',
          releaseDate: '2023-09-22',
          availabilityStatus: 'in_stock',
          customerRating: 4.8,
          createdAt: '2023-09-22T00:00:00Z',
          updatedAt: '2023-09-22T00:00:00Z'
        }
      ]

      mockDb.all.mockResolvedValue(mockSearchResults)

      const result = await productService.search('iPhone')

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('FROM products_fts'),
        ['iPhone*']
      )
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('iPhone 15')
    })

    it('should sanitize search terms', async () => {
      mockDb.all.mockResolvedValue([])

      await productService.search('test"AND"malicious')

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.anything(),
        ['test AND malicious*']
      )
    })

    it('should handle empty search results', async () => {
      mockDb.all.mockResolvedValue([])

      const result = await productService.search('nonexistent')

      expect(result).toHaveLength(0)
    })
  })

  describe('sanitizeFTSQuery integration', () => {
    it('should sanitize search terms through search method', async () => {
      mockDb.all.mockResolvedValue([])

      await productService.search('test"query')
      
      // Verify the search was called with sanitized term
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([expect.stringContaining('test')])
      )
    })

    it('should handle complex search terms', async () => {
      mockDb.all.mockResolvedValue([])

      await productService.search('query*with^special(chars)')
      
      expect(mockDb.all).toHaveBeenCalled()
    })
  })
})