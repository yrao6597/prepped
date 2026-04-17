import * as notesService from "../services/notes.js"
import type { Note } from "../services/notes.js"

export function getNotes(): Note[] {
  return notesService.getNotes()
}

export function createNote(note: Note): void {
  notesService.createNote(note)
}

export function updateNote(id: string, fields: Pick<Note, "title" | "content">): void {
  notesService.updateNote(id, fields)
}

export function deleteNote(id: string): void {
  notesService.deleteNote(id)
}
