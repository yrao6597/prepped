import type { PrepGuide, Reflection, Note } from "../types"

const STORAGE_VERSION = "1"
const KEY_VERSION = "jsa_version"
const KEY_RESUME = "jsa_resume"
const KEY_EXPERIENCE = "jsa_experience"
const KEY_PREPS = "jsa_preps"
const KEY_REFLECTIONS = "jsa_reflections"
const KEY_NOTES = "jsa_notes"

function initStorage(): void {
  try {
    const version = localStorage.getItem(KEY_VERSION)
    if (version !== STORAGE_VERSION) {
      localStorage.setItem(KEY_VERSION, STORAGE_VERSION)
    }
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
}

initStorage()

export function getResume(): string {
  try {
    return localStorage.getItem(KEY_RESUME) ?? ""
  } catch {
    return ""
  }
}

export function saveResume(text: string): void {
  try {
    localStorage.setItem(KEY_RESUME, text)
  } catch {
    console.error("Failed to save resume to localStorage")
  }
}

export function getExperience(): string {
  try {
    return localStorage.getItem(KEY_EXPERIENCE) ?? ""
  } catch {
    return ""
  }
}

export function saveExperience(text: string): void {
  try {
    localStorage.setItem(KEY_EXPERIENCE, text)
  } catch {
    console.error("Failed to save experience to localStorage")
  }
}

export function getPreps(): PrepGuide[] {
  try {
    const raw = localStorage.getItem(KEY_PREPS)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPrepGuide)
  } catch {
    return []
  }
}

export function savePrep(entry: PrepGuide): void {
  try {
    const existing = getPreps()
    localStorage.setItem(KEY_PREPS, JSON.stringify([entry, ...existing]))
  } catch {
    console.error("Failed to save prep guide to localStorage")
  }
}

export function getReflections(): Reflection[] {
  try {
    const raw = localStorage.getItem(KEY_REFLECTIONS)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isReflection)
  } catch {
    return []
  }
}

export function saveReflection(entry: Reflection): void {
  try {
    const existing = getReflections()
    localStorage.setItem(KEY_REFLECTIONS, JSON.stringify([entry, ...existing]))
  } catch {
    console.error("Failed to save reflection to localStorage")
  }
}

export function updateReflection(updated: Reflection): void {
  try {
    const existing = getReflections()
    const next = existing.map((r) => (r.id === updated.id ? updated : r))
    localStorage.setItem(KEY_REFLECTIONS, JSON.stringify(next))
  } catch {
    console.error("Failed to update reflection in localStorage")
  }
}

export function getNotes(): Note[] {
  try {
    const raw = localStorage.getItem(KEY_NOTES)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isNote)
  } catch {
    return []
  }
}

export function saveNote(entry: Note): void {
  try {
    const existing = getNotes()
    localStorage.setItem(KEY_NOTES, JSON.stringify([entry, ...existing]))
  } catch {
    console.error("Failed to save note to localStorage")
  }
}

export function deleteNote(id: string): void {
  try {
    const existing = getNotes()
    localStorage.setItem(KEY_NOTES, JSON.stringify(existing.filter((n) => n.id !== id)))
  } catch {
    console.error("Failed to delete note from localStorage")
  }
}

function isNote(value: unknown): value is Note {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v["id"] === "string" &&
    typeof v["title"] === "string" &&
    typeof v["content"] === "string" &&
    typeof v["createdAt"] === "string"
  )
}

function isReflection(value: unknown): value is Reflection {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v["id"] === "string" &&
    typeof v["company"] === "string" &&
    typeof v["role"] === "string" &&
    typeof v["date"] === "string" &&
    typeof v["createdAt"] === "string"
  )
}

function isPrepGuide(value: unknown): value is PrepGuide {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v["id"] === "string" &&
    typeof v["date"] === "string" &&
    typeof v["company"] === "string" &&
    typeof v["role"] === "string" &&
    typeof v["output"] === "string"
  )
}
