import { db } from "../db.js"

export type PrepType = "recruiter-call" | "technical" | "behavioral"

export interface PrepGuide {
  id: string
  date: string
  company: string
  role: string
  output: string
  prepType: PrepType
  createdAt: string
}

type PrepRow = {
  id: string
  date: string
  company: string
  role: string
  output: string
  prep_type: string
  created_at: string
}

function rowToPrep(row: PrepRow): PrepGuide {
  return {
    id: row.id,
    date: row.date,
    company: row.company,
    role: row.role,
    output: row.output,
    prepType: row.prep_type as PrepType,
    createdAt: row.created_at,
  }
}

export function getPreps(): PrepGuide[] {
  const rows = db.prepare("SELECT * FROM preps ORDER BY created_at DESC").all() as PrepRow[]
  return rows.map(rowToPrep)
}

export function createPrep(prep: PrepGuide): void {
  db.prepare(
    "INSERT INTO preps (id, date, company, role, output, prep_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(prep.id, prep.date, prep.company, prep.role, prep.output, prep.prepType, prep.createdAt)
}

export function deletePrep(id: string): void {
  db.prepare("DELETE FROM preps WHERE id = ?").run(id)
}
