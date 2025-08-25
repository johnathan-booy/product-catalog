import { Request, Response } from "express"
import ProductService from "../services/ProductService"

export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await ProductService.findAll()
    res.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ message: "Error fetching products" })
  }
}

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query

    if (!q || typeof q !== "string") {
      res.status(400).json({ message: "Query parameter 'q' is required" })
      return
    }

    if (q.length > 100) {
      res.status(400).json({ message: "Search query too long (max 100 characters)" })
      return
    }

    if (q.trim().length === 0) {
      res.status(400).json({ message: "Search query cannot be empty" })
      return
    }

    const products = await ProductService.search(q.trim())
    res.json(products)
  } catch (error) {
    console.error("Error searching products:", error)
    res.status(500).json({ message: "Error searching products" })
  }
}

export const generateProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const productCount = req.body && typeof req.body.count === "number" ? req.body.count : 1000

    await ProductService.generateProducts(productCount)
    res.json({ message: `Successfully generated ${productCount} products` })
  } catch (error) {
    console.error("Error generating products:", error)
    res.status(500).json({ message: "Error generating products" })
  }
}
