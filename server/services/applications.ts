import { db } from "../db.js"

export interface Application {
  id: string
  url: string
  company: string
  role: string
  team: string
  status: "in-review" | "in-interview" | "not-proceeding"
  interestLevel: "top-choice" | "interested" | "exploring"
  keyPoints: string[]
  requirements: string[]
  applicationDate: string
  createdAt: string
}

type ApplicationRow = {
  id: string
  url: string
  company: string
  role: string
  team: string
  status: string
  interest_level: string
  key_points: string
  requirements: string
  application_date: string
  created_at: string
}

function parseStringArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : []
  } catch {
    return []
  }
}

function rowToApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    url: row.url,
    company: row.company,
    role: row.role,
    team: row.team,
    status: row.status as Application["status"],
    interestLevel: row.interest_level as Application["interestLevel"],
    keyPoints: parseStringArray(row.key_points),
    requirements: parseStringArray(row.requirements),
    applicationDate: row.application_date,
    createdAt: row.created_at,
  }
}

export function getApplications(): Application[] {
  const rows = db.prepare("SELECT * FROM applications ORDER BY created_at DESC").all() as ApplicationRow[]
  return rows.map(rowToApplication)
}

export function createApplication(application: Application): void {
  db.prepare(
    `INSERT INTO applications (
      id, url, company, role, team, status, interest_level, key_points, requirements, application_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    application.id,
    application.url,
    application.company,
    application.role,
    application.team,
    application.status,
    application.interestLevel,
    JSON.stringify(application.keyPoints),
    JSON.stringify(application.requirements),
    application.applicationDate,
    application.createdAt
  )
}

export function updateApplicationStatus(id: string, status: Application["status"]): void {
  db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, id)
}

export function updateApplicationInterestLevel(
  id: string,
  interestLevel: Application["interestLevel"]
): void {
  db.prepare("UPDATE applications SET interest_level = ? WHERE id = ?").run(interestLevel, id)
}

export function deleteApplication(id: string): void {
  db.prepare("DELETE FROM applications WHERE id = ?").run(id)
}
