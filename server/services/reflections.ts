import { db } from "../db.js"

export type InterviewOutcome = "passed" | "failed" | "pending"

export interface Reflection {
  id: string
  company: string
  role: string
  date: string
  interviewType: string
  questionsAsked: string
  wentWell: string
  didntGoWell: string
  outcome: InterviewOutcome
  rating?: number
  additionalNotes: string
  aiActionPlan: string
  createdAt: string
}

type ReflectionRow = {
  id: string
  company: string
  role: string
  date: string
  interview_type: string
  questions_asked: string
  went_well: string
  didnt_go_well: string
  outcome: string
  rating: number | null
  additional_notes: string
  ai_action_plan: string
  created_at: string
}

function rowToReflection(row: ReflectionRow): Reflection {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    date: row.date,
    interviewType: row.interview_type,
    questionsAsked: row.questions_asked,
    wentWell: row.went_well,
    didntGoWell: row.didnt_go_well,
    outcome: row.outcome as InterviewOutcome,
    rating: row.rating ?? undefined,
    additionalNotes: row.additional_notes,
    aiActionPlan: row.ai_action_plan,
    createdAt: row.created_at,
  }
}

export function getReflections(): Reflection[] {
  const rows = db.prepare("SELECT * FROM reflections ORDER BY created_at DESC").all() as ReflectionRow[]
  return rows.map(rowToReflection)
}

export function createReflection(reflection: Reflection): void {
  db.prepare(
    `INSERT INTO reflections (
      id, company, role, date, interview_type, questions_asked, went_well, didnt_go_well,
      outcome, rating, additional_notes, ai_action_plan, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    reflection.id,
    reflection.company,
    reflection.role,
    reflection.date,
    reflection.interviewType,
    reflection.questionsAsked,
    reflection.wentWell,
    reflection.didntGoWell,
    reflection.outcome,
    reflection.rating ?? null,
    reflection.additionalNotes,
    reflection.aiActionPlan,
    reflection.createdAt
  )
}

export function updateReflection(id: string, reflection: Omit<Reflection, "id" | "createdAt">): void {
  db.prepare(
    `UPDATE reflections
     SET company = ?, role = ?, date = ?, interview_type = ?, questions_asked = ?, went_well = ?,
         didnt_go_well = ?, outcome = ?, rating = ?, additional_notes = ?, ai_action_plan = ?
     WHERE id = ?`
  ).run(
    reflection.company,
    reflection.role,
    reflection.date,
    reflection.interviewType,
    reflection.questionsAsked,
    reflection.wentWell,
    reflection.didntGoWell,
    reflection.outcome,
    reflection.rating ?? null,
    reflection.additionalNotes,
    reflection.aiActionPlan,
    id
  )
}

export function deleteReflection(id: string): void {
  db.prepare("DELETE FROM reflections WHERE id = ?").run(id)
}
