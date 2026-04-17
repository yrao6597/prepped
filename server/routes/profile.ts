import { Router } from "express"
import * as profileController from "../controllers/profile.js"

export const profileRouter = Router()

profileRouter.get("/", (_req, res) => {
  const profile = profileController.getProfile()
  res.json(profile)
})

profileRouter.put("/resume", (req, res) => {
  const { resume } = req.body as { resume?: string }
  if (typeof resume !== "string") {
    res.status(400).json({ error: "resume must be a string" })
    return
  }
  profileController.updateResume(resume)
  res.json({ ok: true })
})

profileRouter.put("/experience", (req, res) => {
  const { experience } = req.body as { experience?: string }
  if (typeof experience !== "string") {
    res.status(400).json({ error: "experience must be a string" })
    return
  }
  profileController.updateExperience(experience)
  res.json({ ok: true })
})

profileRouter.put("/", (req, res) => {
  const { email, linkedin, github, website } = req.body as Record<string, unknown>
  if (
    typeof email !== "string" ||
    typeof linkedin !== "string" ||
    typeof github !== "string" ||
    typeof website !== "string"
  ) {
    res.status(400).json({ error: "email, linkedin, github, and website are required strings" })
    return
  }
  profileController.updateProfile({ email, linkedin, github, website })
  res.json({ ok: true })
})
