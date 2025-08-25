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
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({ message: "Query parameter 'q' is required" })
      return
    }

    const products = await ProductService.search(q)
    res.json(products)
  } catch (error) {
    console.error("Error searching products:", error)
    res.status(500).json({ message: "Error searching products" })
  }
}
