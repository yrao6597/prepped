import { Router } from "express"
import * as claudeController from "../controllers/claude.js"

export const claudeRouter = Router()

function isOutcome(value: unknown): value is "passed" | "failed" | "pending" {
  return value === "passed" || value === "failed" || value === "pending"
}

claudeRouter.post("/prep-guide", async (req, res) => {
  const { companyName, roleTitle, jobDescription, resume, experience, additionalInfo } =
    req.body as Record<string, unknown>

  if (
    typeof companyName !== "string" ||
    typeof roleTitle !== "string" ||
    typeof jobDescription !== "string" ||
    typeof resume !== "string" ||
    typeof experience !== "string" ||
    typeof additionalInfo !== "string"
  ) {
    res.status(400).json({
      error: "companyName, roleTitle, jobDescription, resume, experience, and additionalInfo are required strings",
    })
    return
  }

  try {
    const output = await claudeController.generatePrepGuide({
      companyName,
      roleTitle,
      jobDescription,
      resume,
      experience,
      additionalInfo,
    })
    res.json(output)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate prep guide"
    res.status(500).json({ error: message })
  }
})

claudeRouter.post("/action-plan", async (req, res) => {
  const {
    id,
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
    createdAt,
  } = req.body as Record<string, unknown>

  if (
    typeof id !== "string" ||
    typeof company !== "string" ||
    typeof role !== "string" ||
    typeof date !== "string" ||
    typeof interviewType !== "string" ||
    typeof questionsAsked !== "string" ||
    typeof wentWell !== "string" ||
    typeof didntGoWell !== "string" ||
    !isOutcome(outcome) ||
    typeof additionalNotes !== "string" ||
    typeof aiActionPlan !== "string" ||
    typeof createdAt !== "string" ||
    (rating !== undefined && typeof rating !== "number")
  ) {
    res.status(400).json({
      error:
        "reflection payload is invalid; expected the same reflection fields used by the frontend",
    })
    return
  }

  try {
    const plan = await claudeController.generateActionPlan({
      id,
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
      createdAt,
    })
    res.json(plan)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate action plan"
    res.status(500).json({ error: message })
  }
})
