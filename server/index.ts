import "dotenv/config"
import express from "express"
import cors from "cors"
import "./db.js" // initialise DB and run migrations on startup
import { profileRouter } from "./routes/profile.js"

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.use("/api/profile", profileRouter)

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
