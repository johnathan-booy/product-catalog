import type { Product } from "@/types/Product"

const API_BASE_URL = "http://localhost:3000"

export const api = {
  async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`)
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`)
    }
    return response.json()
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.statusText}`)
    }
    return response.json()
  }
}
