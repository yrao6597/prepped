import { useState, useEffect } from "react"
import { getResume, saveResume } from "../lib/storage"

interface ResumeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [text, setText] = useState("")

  useEffect(() => {
    if (isOpen) {
      setText(getResume())
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleSave() {
    saveResume(text)
    onClose()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">My Resume / Background</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-500 mb-3">
            Paste your resume or a short background summary. This will be pre-filled in the Recruiter Prep form.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your resume or background here..."
            className="w-full h-72 border border-gray-300 rounded p-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none font-mono"
          />
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border
              border-gray-300 rounded hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded
              hover:bg-gray-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
