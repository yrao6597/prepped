export interface PrepGuide {
  id: string
  date: string
  company: string
  role: string
  output: string
}

export interface PrepGuideInput {
  companyName: string
  roleTitle: string
  jobDescription: string
  resume: string
  experience: string
}

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
  additionalNotes: string
  aiActionPlan: string
  createdAt: string
}

export type NoteSource = "manual" | "action-plan"

export interface Note {
  id: string
  title: string
  content: string
  source: NoteSource
  createdAt: string
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string }
