import express, { Request, Response } from "express"
import cors from "cors"
import { errorHandler } from "./middleware/errorHandler"

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API is running" })
})

app.use(errorHandler)

export default app
