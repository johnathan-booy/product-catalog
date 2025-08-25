import { Router } from "express"
import { getAllProducts, searchProducts, generateProducts } from "../controllers/productController"

const router = Router()

router.get("/", getAllProducts)
router.get("/search", searchProducts)
router.post("/generate", generateProducts)

export default router
