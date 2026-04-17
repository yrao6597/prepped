import { db } from "../db.js"

export interface Note {
  id: string
  title: string
  content: string
  source: "manual" | "action-plan"
  createdAt: string
}

type NoteRow = {
  id: string
  title: string
  content: string
  source: string
  created_at: string
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    source: row.source as Note["source"],
    createdAt: row.created_at,
  }
}

export function getNotes(): Note[] {
  const rows = db.prepare("SELECT * FROM notes ORDER BY created_at DESC").all() as NoteRow[]
  return rows.map(rowToNote)
}

export function createNote(note: Note): void {
  db.prepare(
    "INSERT INTO notes (id, title, content, source, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(note.id, note.title, note.content, note.source, note.createdAt)
}

export function updateNote(id: string, fields: Pick<Note, "title" | "content">): void {
  db.prepare("UPDATE notes SET title = ?, content = ? WHERE id = ?")
    .run(fields.title, fields.content, id)
}

export function deleteNote(id: string): void {
  db.prepare("DELETE FROM notes WHERE id = ?").run(id)
}
