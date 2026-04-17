import { db } from "../db.js"

export interface Profile {
  resume: string
  experience: string
  email: string
  linkedin: string
  github: string
  website: string
}

export function getProfile(): Profile {
  return db.prepare("SELECT resume, experience, email, linkedin, github, website FROM profile WHERE id = 1").get() as unknown as Profile
}

export function updateResume(resume: string): void {
  db.prepare("UPDATE profile SET resume = ? WHERE id = 1").run(resume)
}

export function updateExperience(experience: string): void {
  db.prepare("UPDATE profile SET experience = ? WHERE id = 1").run(experience)
}

export function updateProfile(fields: Pick<Profile, "email" | "linkedin" | "github" | "website">): void {
  db.prepare("UPDATE profile SET email = ?, linkedin = ?, github = ?, website = ? WHERE id = 1")
    .run(fields.email, fields.linkedin, fields.github, fields.website)
}
