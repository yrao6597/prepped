import type {
  Note,
  PrepGuide,
  PrepGuideInput,
  Reflection,
  UserProfile,
} from "../types"

const API_BASE_URL = "http://localhost:3001/api"

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

export interface JobExtractionResult {
  company: string
  role: string
  team: string
  keyPoints: string[]
  requirements: string[]
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json")
      ? JSON.stringify(await response.json())
      : await response.text()
    throw new ApiError(response.status, body || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function post(path: string, body: unknown): Promise<{ ok: true }> {
  return request<{ ok: true }>(path, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

function put(path: string, body: unknown): Promise<{ ok: true }> {
  return request<{ ok: true }>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

function del(path: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(path, {
    method: "DELETE",
  })
}

type ProfileResponse = UserProfile & {
  resume: string
  experience: string
}

export function getProfile(): Promise<ProfileResponse> {
  return request<ProfileResponse>("/profile")
}

export function updateProfile(profile: UserProfile): Promise<{ ok: true }> {
  return put("/profile", profile)
}

export function updateResume(resume: string): Promise<{ ok: true }> {
  return put("/profile/resume", { resume })
}

export function updateExperience(experience: string): Promise<{ ok: true }> {
  return put("/profile/experience", { experience })
}

export async function getResume(): Promise<string> {
  const profile = await getProfile()
  return profile.resume
}

export async function getExperience(): Promise<string> {
  const profile = await getProfile()
  return profile.experience
}

export function saveResume(text: string): Promise<{ ok: true }> {
  return updateResume(text)
}

export function saveExperience(text: string): Promise<{ ok: true }> {
  return updateExperience(text)
}

export function getNotes(): Promise<Note[]> {
  return request<Note[]>("/notes")
}

export function saveNote(note: Note): Promise<{ ok: true }> {
  return post("/notes", note)
}

export function updateNote(note: Note): Promise<{ ok: true }> {
  return put(`/notes/${note.id}`, {
    title: note.title,
    content: note.content,
  })
}

export function deleteNote(id: string): Promise<{ ok: true }> {
  return del(`/notes/${id}`)
}

export function getReflections(): Promise<Reflection[]> {
  return request<Reflection[]>("/reflections")
}

export function saveReflection(reflection: Reflection): Promise<{ ok: true }> {
  return post("/reflections", reflection)
}

export function updateReflection(reflection: Reflection): Promise<{ ok: true }> {
  const { id, createdAt: _createdAt, ...body } = reflection
  return put(`/reflections/${id}`, body)
}

export function deleteReflection(id: string): Promise<{ ok: true }> {
  return del(`/reflections/${id}`)
}

export function getPreps(): Promise<PrepGuide[]> {
  return request<PrepGuide[]>("/preps")
}

export function savePrep(prep: PrepGuide): Promise<{ ok: true }> {
  return post("/preps", {
    ...prep,
    createdAt: "createdAt" in prep && typeof prep.createdAt === "string"
      ? prep.createdAt
      : prep.date,
    prepType: prep.prepType ?? "recruiter-call",
  })
}

export function deletePrep(id: string): Promise<{ ok: true }> {
  return del(`/preps/${id}`)
}

export function getApplications(): Promise<Application[]> {
  return request<Application[]>("/applications")
}

export function saveApplication(application: Application): Promise<{ ok: true }> {
  return post("/applications", application)
}

export function deleteApplication(id: string): Promise<{ ok: true }> {
  return del(`/applications/${id}`)
}

export function generatePrepGuide(input: PrepGuideInput): Promise<string> {
  return request<string>("/claude/prep-guide", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function generateActionPlan(reflection: Reflection): Promise<string> {
  return request<string>("/claude/action-plan", {
    method: "POST",
    body: JSON.stringify(reflection),
  })
}

export function extractApplication(input: { url?: string; jobDescription?: string }): Promise<JobExtractionResult> {
  return request<JobExtractionResult>("/applications/extract", {
    method: "POST",
    body: JSON.stringify(input),
  })
}
