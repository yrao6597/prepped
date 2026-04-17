import { Router } from "express"
import * as applicationsController from "../controllers/applications.js"

export const applicationsRouter = Router()

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
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
    !isStringArray(keyPoints) ||
    !isStringArray(requirements) ||
    typeof applicationDate !== "string" ||
    typeof createdAt !== "string"
  ) {
    res.status(400).json({
      error:
        "id, url, company, role, team, applicationDate, and createdAt are required strings; keyPoints and requirements must be string arrays",
    })
    return
  }

  applicationsController.createApplication({
    id,
    url,
    company,
    role,
    team,
    keyPoints,
    requirements,
    applicationDate,
    createdAt,
  })
  res.status(201).json({ ok: true })
})

applicationsRouter.delete("/:id", (req, res) => {
  applicationsController.deleteApplication(req.params.id)
  res.json({ ok: true })
})
