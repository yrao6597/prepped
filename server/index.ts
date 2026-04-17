import "dotenv/config"
import express from "express"
import cors from "cors"
import "./db.js" // initialise DB and run migrations on startup
import { applicationsRouter } from "./routes/applications.js"
import { profileRouter } from "./routes/profile.js"
import { prepsRouter } from "./routes/preps.js"
import { reflectionsRouter } from "./routes/reflections.js"
import { notesRouter } from "./routes/notes.js"

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.use("/api/applications", applicationsRouter)
app.use("/api/profile", profileRouter)
app.use("/api/preps", prepsRouter)
app.use("/api/reflections", reflectionsRouter)
app.use("/api/notes", notesRouter)

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
