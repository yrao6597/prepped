import { Router } from "express"
import * as applicationsController from "../controllers/applications.js"

export const applicationsRouter = Router()

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function isApplicationStatus(value: unknown): value is "in-review" | "in-interview" | "not-proceeding" {
  return value === "in-review" || value === "in-interview" || value === "not-proceeding"
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
    !isStringArray(keyPoints) ||
    !isStringArray(requirements) ||
    typeof applicationDate !== "string" ||
    typeof createdAt !== "string"
  ) {
    res.status(400).json({
      error:
        "id, url, company, role, team, applicationDate, and createdAt are required strings; status must be valid; keyPoints and requirements must be string arrays",
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

applicationsRouter.delete("/:id", (req, res) => {
  applicationsController.deleteApplication(req.params.id)
  res.json({ ok: true })
})
