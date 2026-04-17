import { db } from "../db.js"

export interface Application {
  id: string
  url: string
  company: string
  role: string
  team: string
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
      id, url, company, role, team, key_points, requirements, application_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    application.id,
    application.url,
    application.company,
    application.role,
    application.team,
    JSON.stringify(application.keyPoints),
    JSON.stringify(application.requirements),
    application.applicationDate,
    application.createdAt
  )
}

export function deleteApplication(id: string): void {
  db.prepare("DELETE FROM applications WHERE id = ?").run(id)
}
