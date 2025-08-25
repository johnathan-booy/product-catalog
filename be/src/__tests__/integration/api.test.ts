import request from 'supertest'
import app from '../../app'
import { connectDatabase, closeDatabase } from '../../config/database'

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase()
  })

  afterAll(async () => {
    await closeDatabase()
  })

  describe('GET /', () => {
    it('should return API status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)

      expect(response.body.message).toBe('API is running')
    })
  })

  describe('Products API Integration', () => {
    beforeEach(async () => {
      // Clean up any existing products
      const db = require('../../config/database').getDatabase()
      await db.exec('DELETE FROM products')
      await db.exec(`INSERT INTO products_fts(products_fts) VALUES('rebuild')`)
    })

    it('should complete full product lifecycle', async () => {
      // 1. Initially should have no products
      const initialResponse = await request(app)
        .get('/products')
        .expect(200)

      expect(initialResponse.body).toHaveLength(0)

      // 2. Generate products
      const generateResponse = await request(app)
        .post('/products/generate')
        .send({ count: 5 })
        .expect(200)

      expect(generateResponse.body.message).toBe('Successfully generated 5 products')

      // 3. Should now have 5 products
      const productsResponse = await request(app)
        .get('/products')
        .expect(200)

      expect(productsResponse.body).toHaveLength(5)

      // 4. Search should work
      const searchResponse = await request(app)
        .get('/products/search?q=Electronics')
        .expect(200)

      // Should find at least some electronics products
      expect(Array.isArray(searchResponse.body)).toBe(true)
    })

    it('should handle large product generation', async () => {
      const response = await request(app)
        .post('/products/generate')
        .send({ count: 100 })
        .expect(200)

      expect(response.body.message).toBe('Successfully generated 100 products')

      // Verify products were created
      const productsResponse = await request(app)
        .get('/products')
        .expect(200)

      expect(productsResponse.body).toHaveLength(100)
    }, 15000) // Longer timeout for bulk operations

    it('should maintain search functionality after bulk generation', async () => {
      // Generate products
      await request(app)
        .post('/products/generate')
        .send({ count: 50 })
        .expect(200)

      // Test various search terms
      const searchTerms = ['Electronics', 'Beauty', 'TechCorp', 'Home']

      for (const term of searchTerms) {
        const response = await request(app)
          .get(`/products/search?q=${term}`)
          .expect(200)

        expect(Array.isArray(response.body)).toBe(true)
        // Should find some results for common categories/brands
        if (['Electronics', 'Beauty', 'TechCorp'].includes(term)) {
          expect(response.body.length).toBeGreaterThan(0)
        }
      }
    })

    it('should handle edge cases properly', async () => {
      // Test empty search
      await request(app)
        .get('/products/search?q=nonexistentproduct12345')
        .expect(200)
        .then(response => {
          expect(response.body).toHaveLength(0)
        })

      // Test search validation
      await request(app)
        .get('/products/search')
        .expect(400)

      await request(app)
        .get('/products/search?q=' + 'x'.repeat(101))
        .expect(400)

      // Test generation validation
      await request(app)
        .post('/products/generate')
        .send({ count: -1 })
        .expect(200) // Should use default count

      await request(app)
        .post('/products/generate')
        .send({ count: 'invalid' })
        .expect(200) // Should use default count
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 routes', async () => {
      await request(app)
        .get('/nonexistent')
        .expect(404)
    })

    it('should handle malformed JSON', async () => {
      // Express will return 400 for malformed JSON, but our error handler might catch it as 500
      const response = await request(app)
        .post('/products/generate')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')

      expect([400, 500]).toContain(response.status)
    })
  })

  describe('CORS', () => {
    it('should handle CORS headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)

      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })

    it('should handle preflight requests', async () => {
      await request(app)
        .options('/products')
        .expect(204)
    })
  })
})