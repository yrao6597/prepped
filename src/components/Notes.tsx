import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { getNotes, saveNote, updateNote, deleteNote } from "../lib/api"
import type { Note, NoteSource } from "../types"

const SOURCE_LABELS: Record<NoteSource, string> = {
  "manual": "Manual",
  "action-plan": "Action Plan",
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadNotes() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getNotes()
        if (!isCancelled) setNotes(data)
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : "Failed to load notes"
          setError(message)
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadNotes()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const entry: Note = {
      id: crypto.randomUUID(),
      title: form.title,
      content: form.content,
      source: "manual",
      createdAt: new Date().toISOString(),
    }
    setIsSaving(true)
    setError(null)
    try {
      await saveNote(entry)
      setNotes((prev) => [entry, ...prev])
      setForm({ title: "", content: "" })
      setIsFormOpen(false)
      setExpandedId(entry.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save note"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdate(updated: Note) {
    setError(null)
    try {
      await updateNote(updated)
      setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update note"
      setError(message)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    try {
      await deleteNote(id)
      setNotes((prev) => prev.filter((note) => note.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete note"
      setError(message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notes</h1>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md
              hover:bg-gray-700 transition-all duration-150"
          >
            + New Note
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900">New Note</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              placeholder="e.g. Things to brush up on"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setForm({ title: "", content: "" }); setIsFormOpen(false) }}
              disabled={isSaving}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border
                border-gray-200 rounded-md hover:border-gray-400 transition-all duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-all duration-150 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}

      {isLoading && !isFormOpen && (
        <p className="text-sm text-gray-400">Loading notes...</p>
      )}

      {!isLoading && notes.length === 0 && !isFormOpen && (
        <p className="text-sm text-gray-400">No notes yet. Add one manually or save an AI action plan from an interview reflection.</p>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isExpanded={expandedId === note.id}
            onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
            onUpdate={handleUpdate}
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
  onUpdate: (updated: Note) => void
  onDelete: () => void
}

function NoteCard({ note, isExpanded, onToggle, onUpdate, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: note.title, content: note.content })

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirm("Delete this note?")) onDelete()
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation()
    setEditForm({ title: note.title, content: note.content })
    setIsEditing(true)
  }

  function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    onUpdate({ ...note, title: editForm.title, content: editForm.content })
    setIsEditing(false)
  }

  function handleEditCancel() {
    setIsEditing(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-sm">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
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
            onClick={handleEditClick}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-1"
            aria-label="Edit note"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
            aria-label="Delete note"
          >
            ✕
          </button>
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isEditing && (
        <div className="border-t border-gray-100 px-5 py-4">
          <form onSubmit={handleEditSave} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
                required
                rows={8}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleEditCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border
                  border-gray-200 rounded-md hover:border-gray-400 transition-all duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-all duration-150"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {isExpanded && !isEditing && (
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
