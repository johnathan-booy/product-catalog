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
