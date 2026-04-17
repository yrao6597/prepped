import { Router } from "express"
import * as reflectionsController from "../controllers/reflections.js"

export const reflectionsRouter = Router()

function isOutcome(value: unknown): value is "passed" | "failed" | "pending" {
  return value === "passed" || value === "failed" || value === "pending"
}

function parseReflectionBody(body: Record<string, unknown>) {
  const {
    company,
    role,
    date,
    interviewType,
    questionsAsked,
    wentWell,
    didntGoWell,
    outcome,
    rating,
    additionalNotes,
    aiActionPlan,
  } = body

  if (
    typeof company !== "string" ||
    typeof role !== "string" ||
    typeof date !== "string" ||
    typeof interviewType !== "string" ||
    typeof questionsAsked !== "string" ||
    typeof wentWell !== "string" ||
    typeof didntGoWell !== "string" ||
    !isOutcome(outcome) ||
    typeof additionalNotes !== "string" ||
    typeof aiActionPlan !== "string"
  ) {
    return null
  }

  if (rating !== undefined && typeof rating !== "number") {
    return null
  }

  return {
    company,
    role,
    date,
    interviewType,
    questionsAsked,
    wentWell,
    didntGoWell,
    outcome,
    rating,
    additionalNotes,
    aiActionPlan,
  }
}

reflectionsRouter.get("/", (_req, res) => {
  const reflections = reflectionsController.getReflections()
  res.json(reflections)
})

reflectionsRouter.post("/", (req, res) => {
  const { id, createdAt, ...rest } = req.body as Record<string, unknown>
  if (typeof id !== "string" || typeof createdAt !== "string") {
    res.status(400).json({ error: "id and createdAt are required strings" })
    return
  }
  const reflection = parseReflectionBody(rest)
  if (!reflection) {
    res.status(400).json({
      error:
        "company, role, date, interviewType, questionsAsked, wentWell, didntGoWell, outcome, additionalNotes, and aiActionPlan are required; rating must be a number when provided",
    })
    return
  }
  reflectionsController.createReflection({ id, createdAt, ...reflection })
  res.status(201).json({ ok: true })
})

reflectionsRouter.put("/:id", (req, res) => {
  const reflection = parseReflectionBody(req.body as Record<string, unknown>)
  if (!reflection) {
    res.status(400).json({
      error:
        "company, role, date, interviewType, questionsAsked, wentWell, didntGoWell, outcome, additionalNotes, and aiActionPlan are required; rating must be a number when provided",
    })
    return
  }
  reflectionsController.updateReflection(req.params.id, reflection)
  res.json({ ok: true })
})

reflectionsRouter.delete("/:id", (req, res) => {
  reflectionsController.deleteReflection(req.params.id)
  res.json({ ok: true })
})
