import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { getNotes, saveNote, deleteNote } from "../lib/storage"
import type { Note, NoteSource } from "../types"

const SOURCE_LABELS: Record<NoteSource, string> = {
  "manual": "Manual",
  "action-plan": "Action Plan",
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => getNotes())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const entry: Note = {
      id: crypto.randomUUID(),
      title: form.title,
      content: form.content,
      source: "manual",
      createdAt: new Date().toISOString(),
    }
    saveNote(entry)
    setNotes(getNotes())
    setForm({ title: "", content: "" })
    setIsFormOpen(false)
    setExpandedId(entry.id)
  }

  function handleDelete(id: string) {
    deleteNote(id)
    setNotes(getNotes())
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Notes</h1>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded
              hover:bg-gray-700 transition-colors"
          >
            + New Note
          </button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">New Note</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              placeholder="e.g. Things to brush up on"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              required
              placeholder="Write anything..."
              rows={6}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setForm({ title: "", content: "" }); setIsFormOpen(false) }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border
                border-gray-300 rounded hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 && !isFormOpen && (
        <p className="text-sm text-gray-400">No notes yet. Add one manually or save an AI action plan from an interview reflection.</p>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isExpanded={expandedId === note.id}
            onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface NoteCardProps {
  note: Note
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
}

function NoteCard({ note, isExpanded, onToggle, onDelete }: NoteCardProps) {
  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirm("Delete this note?")) onDelete()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div>
          <span className="font-medium text-gray-900 text-sm">{note.title}</span>
          <span className="ml-2 text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
            {SOURCE_LABELS[note.source]}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
            aria-label="Delete note"
          >
            ✕
          </button>
          <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="prose prose-sm prose-gray max-w-none
            prose-headings:font-semibold prose-headings:text-gray-900
            prose-li:text-gray-700 prose-p:text-gray-700">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
