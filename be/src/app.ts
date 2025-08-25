import express, { Request, Response } from "express"
import cors from "cors"
import { errorHandler } from "./middleware/errorHandler"
import { connectDatabase } from "./config/database"
import routes from "./routes/index"

const app = express()

// Initialize database connection
connectDatabase().catch(console.error)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API is running" })
})

app.use(routes)

app.use(errorHandler)

export default app
