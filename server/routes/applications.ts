import { Router } from "express"
import * as applicationsController from "../controllers/applications.js"

export const applicationsRouter = Router()

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function isApplicationStatus(value: unknown): value is "in-review" | "in-interview" | "not-proceeding" {
  return value === "in-review" || value === "in-interview" || value === "not-proceeding"
}

function isApplicationInterestLevel(value: unknown): value is "top-choice" | "interested" | "exploring" {
  return value === "top-choice" || value === "interested" || value === "exploring"
}

applicationsRouter.get("/", (_req, res) => {
  const applications = applicationsController.getApplications()
  res.json(applications)
})

applicationsRouter.post("/", (req, res) => {
  const {
    id,
    url = "",
    company,
    role,
    team = "",
    status = "in-review",
    interestLevel = "interested",
    keyPoints,
    requirements,
    applicationDate,
    createdAt,
  } = req.body as Record<string, unknown>

  if (
    typeof id !== "string" ||
    typeof url !== "string" ||
    typeof company !== "string" ||
    typeof role !== "string" ||
    typeof team !== "string" ||
    !isApplicationStatus(status) ||
    !isApplicationInterestLevel(interestLevel) ||
    !isStringArray(keyPoints) ||
    !isStringArray(requirements) ||
    typeof applicationDate !== "string" ||
    typeof createdAt !== "string"
  ) {
    res.status(400).json({
      error:
        "id, url, company, role, team, applicationDate, and createdAt are required strings; status and interestLevel must be valid; keyPoints and requirements must be string arrays",
    })
    return
  }

  applicationsController.createApplication({
    id,
    url,
    company,
    role,
    team,
    status,
    interestLevel,
    keyPoints,
    requirements,
    applicationDate,
    createdAt,
  })
  res.status(201).json({ ok: true })
})

applicationsRouter.put("/:id/status", (req, res) => {
  const { status } = req.body as Record<string, unknown>

  if (!isApplicationStatus(status)) {
    res.status(400).json({ error: "status must be 'in-review', 'in-interview', or 'not-proceeding'" })
    return
  }

  applicationsController.updateApplicationStatus(req.params.id, status)
  res.json({ ok: true })
})

applicationsRouter.put("/:id/interest-level", (req, res) => {
  const { interestLevel } = req.body as Record<string, unknown>

  if (!isApplicationInterestLevel(interestLevel)) {
    res.status(400).json({ error: "interestLevel must be 'top-choice', 'interested', or 'exploring'" })
    return
  }

  applicationsController.updateApplicationInterestLevel(req.params.id, interestLevel)
  res.json({ ok: true })
})

applicationsRouter.delete("/:id", (req, res) => {
  applicationsController.deleteApplication(req.params.id)
  res.json({ ok: true })
})
