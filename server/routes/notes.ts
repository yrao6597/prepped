import { Router } from "express"
import * as notesController from "../controllers/notes.js"

export const notesRouter = Router()

notesRouter.get("/", (_req, res) => {
  const notes = notesController.getNotes()
  res.json(notes)
})

notesRouter.post("/", (req, res) => {
  const { id, title, content, source, createdAt } = req.body as Record<string, unknown>
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof content !== "string" ||
    typeof source !== "string" ||
    typeof createdAt !== "string"
  ) {
    res.status(400).json({ error: "id, title, content, source, and createdAt are required strings" })
    return
  }
  if (source !== "manual" && source !== "action-plan") {
    res.status(400).json({ error: "source must be 'manual' or 'action-plan'" })
    return
  }
  notesController.createNote({ id, title, content, source, createdAt })
  res.status(201).json({ ok: true })
})

notesRouter.put("/:id", (req, res) => {
  const { title, content } = req.body as Record<string, unknown>
  if (typeof title !== "string" || typeof content !== "string") {
    res.status(400).json({ error: "title and content are required strings" })
    return
  }
  notesController.updateNote(req.params.id, { title, content })
  res.json({ ok: true })
})

notesRouter.delete("/:id", (req, res) => {
  notesController.deleteNote(req.params.id)
  res.json({ ok: true })
})
