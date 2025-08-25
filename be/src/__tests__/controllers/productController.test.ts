import request from 'supertest'
import express from 'express'
import { getAllProducts, searchProducts, generateProducts } from '../../controllers/productController'
import ProductService from '../../services/ProductService'

jest.mock('../../services/ProductService')

const mockProductService = ProductService as jest.Mocked<typeof ProductService>

const app = express()
app.use(express.json())

// Setup routes for testing
app.get('/products', getAllProducts)
app.get('/products/search', searchProducts)
app.post('/products/generate', generateProducts)

describe('ProductController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /products', () => {
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
          releaseDate: new Date('2023-01-01'),
          availabilityStatus: 'in_stock',
          customerRating: 4.5,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01')
        }
      ]

      mockProductService.findAll.mockResolvedValue(mockProducts)

      const response = await request(app)
        .get('/products')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe('Test Product')
      expect(mockProductService.findAll).toHaveBeenCalledTimes(1)
    })

    it('should handle service errors', async () => {
      mockProductService.findAll.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/products')
        .expect(500)

      expect(response.body.message).toBe('Error fetching products')
    })
  })

  describe('GET /products/search', () => {
    it('should search products with valid query', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'iPhone 15',
          description: 'Latest smartphone',
          category: 'Electronics',
          brand: 'Apple',
          price: 999.99,
          quantity: 10,
          sku: 'IPHONE-15',
          releaseDate: new Date('2023-09-22'),
          availabilityStatus: 'in_stock',
          customerRating: 4.8,
          createdAt: new Date('2023-09-22'),
          updatedAt: new Date('2023-09-22')
        }
      ]

      mockProductService.search.mockResolvedValue(mockProducts)

      const response = await request(app)
        .get('/products/search?q=iPhone')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe('iPhone 15')
      expect(mockProductService.search).toHaveBeenCalledWith('iPhone')
    })

    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app)
        .get('/products/search')
        .expect(400)

      expect(response.body.message).toBe("Query parameter 'q' is required")
      expect(mockProductService.search).not.toHaveBeenCalled()
    })

    it('should return 400 when query parameter is not a string', async () => {
      const response = await request(app)
        .get('/products/search?q[]=invalid')
        .expect(400)

      expect(response.body.message).toBe("Query parameter 'q' is required")
    })

    it('should return 400 when query is too long', async () => {
      const longQuery = 'a'.repeat(101)

      const response = await request(app)
        .get(`/products/search?q=${longQuery}`)
        .expect(400)

      expect(response.body.message).toBe('Search query too long (max 100 characters)')
      expect(mockProductService.search).not.toHaveBeenCalled()
    })

    it('should return 400 when query is empty after trimming', async () => {
      const response = await request(app)
        .get('/products/search?q=%20%20%20')
        .expect(400)

      expect(response.body.message).toBe('Search query cannot be empty')
      expect(mockProductService.search).not.toHaveBeenCalled()
    })

    it('should trim whitespace from query', async () => {
      mockProductService.search.mockResolvedValue([])

      await request(app)
        .get('/products/search?q=%20iPhone%20')
        .expect(200)

      expect(mockProductService.search).toHaveBeenCalledWith('iPhone')
    })

    it('should handle service errors', async () => {
      mockProductService.search.mockRejectedValue(new Error('Search error'))

      const response = await request(app)
        .get('/products/search?q=test')
        .expect(500)

      expect(response.body.message).toBe('Error searching products')
    })
  })

  describe('POST /products/generate', () => {
    it('should generate products with default count', async () => {
      mockProductService.generateProducts.mockResolvedValue()

      const response = await request(app)
        .post('/products/generate')
        .send({})
        .expect(200)

      expect(response.body.message).toBe('Successfully generated 1000 products')
      expect(mockProductService.generateProducts).toHaveBeenCalledWith(1000)
    })

    it('should generate products with specified count', async () => {
      mockProductService.generateProducts.mockResolvedValue()

      const response = await request(app)
        .post('/products/generate')
        .send({ count: 500 })
        .expect(200)

      expect(response.body.message).toBe('Successfully generated 500 products')
      expect(mockProductService.generateProducts).toHaveBeenCalledWith(500)
    })

    it('should use default when count is null', async () => {
      mockProductService.generateProducts.mockResolvedValue()

      const response = await request(app)
        .post('/products/generate')
        .send({ count: null })
        .expect(200)

      expect(response.body.message).toBe('Successfully generated 1000 products')
      expect(mockProductService.generateProducts).toHaveBeenCalledWith(1000)
    })

    it('should use default when count is undefined', async () => {
      mockProductService.generateProducts.mockResolvedValue()

      const response = await request(app)
        .post('/products/generate')
        .send({ count: undefined })
        .expect(200)

      expect(response.body.message).toBe('Successfully generated 1000 products')
      expect(mockProductService.generateProducts).toHaveBeenCalledWith(1000)
    })

    it('should handle service errors', async () => {
      mockProductService.generateProducts.mockRejectedValue(new Error('Generation error'))

      const response = await request(app)
        .post('/products/generate')
        .send({ count: 100 })
        .expect(500)

      expect(response.body.message).toBe('Error generating products')
    })
  })
})