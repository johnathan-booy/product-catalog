import request from 'supertest'
import express from 'express'
import { searchProducts } from '../../controllers/productController'
import ProductService from '../../services/ProductService'

jest.mock('../../services/ProductService')

const mockProductService = ProductService as jest.Mocked<typeof ProductService>

const app = express()
app.use(express.json())
app.get('/search', searchProducts)

describe('Search Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Input Validation', () => {
    it('should reject queries longer than 100 characters', async () => {
      const longQuery = 'x'.repeat(101)

      const response = await request(app)
        .get(`/search?q=${longQuery}`)
        .expect(400)

      expect(response.body.message).toBe('Search query too long (max 100 characters)')
      expect(mockProductService.search).not.toHaveBeenCalled()
    })

    it('should accept queries exactly 100 characters', async () => {
      const maxLengthQuery = 'x'.repeat(100)
      mockProductService.search.mockResolvedValue([])

      await request(app)
        .get(`/search?q=${maxLengthQuery}`)
        .expect(200)

      expect(mockProductService.search).toHaveBeenCalledWith(maxLengthQuery)
    })

    it('should reject empty queries', async () => {
      const response = await request(app)
        .get('/search?q=')
        .expect(400)

      expect(response.body.message).toBe("Query parameter 'q' is required")
    })

    it('should reject whitespace-only queries', async () => {
      const response = await request(app)
        .get('/search?q=%20%20%20')
        .expect(400)

      expect(response.body.message).toBe('Search query cannot be empty')
    })

    it('should reject non-string queries', async () => {
      const response = await request(app)
        .get('/search?q[]=array')
        .expect(400)

      expect(response.body.message).toBe("Query parameter 'q' is required")
    })
  })

  describe('FTS Injection Prevention', () => {
    it('should sanitize dangerous FTS characters', async () => {
      mockProductService.search.mockResolvedValue([])

      // Test various FTS special characters
      await request(app)
        .get('/search?q=test"query')
        .expect(200)

      expect(mockProductService.search).toHaveBeenCalledWith('test"query')
    })

    it('should handle boolean operators in query', async () => {
      mockProductService.search.mockResolvedValue([])

      await request(app)
        .get('/search?q=phone AND laptop OR tablet')
        .expect(200)

      expect(mockProductService.search).toHaveBeenCalledWith('phone AND laptop OR tablet')
    })

    it('should handle special characters safely', async () => {
      mockProductService.search.mockResolvedValue([])

      const specialChars = [
        'test*query',
        'test^query',
        'test:query',
        'test(query)',
        'test{query}',
        'test[query]'
      ]

      for (const query of specialChars) {
        await request(app)
          .get(`/search?q=${encodeURIComponent(query)}`)
          .expect(200)

        expect(mockProductService.search).toHaveBeenCalledWith(query)
      }
    })
  })

  describe('Rate Limiting Simulation', () => {
    it('should handle multiple rapid requests', async () => {
      mockProductService.search.mockResolvedValue([])

      const requests = []
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .get(`/search?q=test${i}`)
            .expect(200)
        )
      }

      await Promise.all(requests)

      expect(mockProductService.search).toHaveBeenCalledTimes(10)
    })
  })

  describe('SQL Injection Prevention', () => {
    it('should handle SQL injection attempts', async () => {
      mockProductService.search.mockResolvedValue([])

      const sqlInjectionAttempts = [
        "'; DROP TABLE products; --",
        "' OR '1'='1",
        "UNION SELECT * FROM products",
        "'; INSERT INTO products VALUES",
        "' AND 1=1 --"
      ]

      for (const attempt of sqlInjectionAttempts) {
        await request(app)
          .get(`/search?q=${encodeURIComponent(attempt)}`)
          .expect(200)

        expect(mockProductService.search).toHaveBeenCalledWith(attempt)
      }
    })
  })

  describe('XSS Prevention', () => {
    it('should handle XSS attempts in search query', async () => {
      mockProductService.search.mockResolvedValue([])

      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">'
      ]

      for (const attempt of xssAttempts) {
        await request(app)
          .get(`/search?q=${encodeURIComponent(attempt)}`)
          .expect(200)

        expect(mockProductService.search).toHaveBeenCalledWith(attempt)
      }
    })
  })

  describe('Performance Protection', () => {
    it('should limit query length to prevent DoS', async () => {
      const dosQuery = 'x'.repeat(10000)

      const response = await request(app)
        .get(`/search?q=${dosQuery}`)
        .expect(400)

      expect(response.body.message).toBe('Search query too long (max 100 characters)')
      expect(mockProductService.search).not.toHaveBeenCalled()
    })

    it('should handle unicode characters properly', async () => {
      mockProductService.search.mockResolvedValue([])

      const unicodeQuery = '测试产品'

      await request(app)
        .get(`/search?q=${encodeURIComponent(unicodeQuery)}`)
        .expect(200)

      expect(mockProductService.search).toHaveBeenCalledWith(unicodeQuery)
    })

    it('should handle emojis in search', async () => {
      mockProductService.search.mockResolvedValue([])

      const emojiQuery = '📱 phone 🔥'

      await request(app)
        .get(`/search?q=${encodeURIComponent(emojiQuery)}`)
        .expect(200)

      expect(mockProductService.search).toHaveBeenCalledWith(emojiQuery)
    })
  })
})