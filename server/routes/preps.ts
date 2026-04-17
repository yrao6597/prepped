import { Router } from "express"
import * as prepsController from "../controllers/preps.js"

export const prepsRouter = Router()

prepsRouter.get("/", (_req, res) => {
  const preps = prepsController.getPreps()
  res.json(preps)
})

prepsRouter.post("/", (req, res) => {
  const { id, date, company, role, output, prepType = "recruiter-call", createdAt } = req.body as Record<string, unknown>
  if (
    typeof id !== "string" ||
    typeof date !== "string" ||
    typeof company !== "string" ||
    typeof role !== "string" ||
    typeof output !== "string" ||
    typeof createdAt !== "string"
  ) {
    res.status(400).json({ error: "id, date, company, role, output, and createdAt are required strings" })
    return
  }
  if (prepType !== "recruiter-call" && prepType !== "technical" && prepType !== "behavioral") {
    res.status(400).json({ error: "prepType must be 'recruiter-call', 'technical', or 'behavioral'" })
    return
  }
  prepsController.createPrep({ id, date, company, role, output, prepType, createdAt })
  res.status(201).json({ ok: true })
})

prepsRouter.delete("/:id", (req, res) => {
  prepsController.deletePrep(req.params.id)
  res.json({ ok: true })
})
