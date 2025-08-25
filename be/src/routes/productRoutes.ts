import { Router } from "express"
import { getAllProducts, searchProducts } from "../controllers/productController"

const router = Router()

router.get("/", getAllProducts)
router.get("/search", searchProducts)

export default router
