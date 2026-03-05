import { useState, useEffect } from "react"
import { getExperience, saveExperience } from "../lib/storage"

interface ExperienceModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExperienceModal({ isOpen, onClose }: ExperienceModalProps) {
  const [text, setText] = useState("")

  useEffect(() => {
    if (isOpen) {
      setText(getExperience())
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleSave() {
    saveExperience(text)
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
          <h2 className="font-semibold text-gray-900">My Experience / Projects</h2>
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
            Add detailed notes on your projects, contributions, and work history. Go beyond your
            resume — include impact, stack, scale, what you personally built, and anything you'd
            want to bring up in an interview. This gets used alongside your resume to generate
            more specific prep guides.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`e.g.\n\nProject: Payments Infra Overhaul (Acme Corp, 2023)\n- Led migration from Stripe v1 to v2 for 3M+ users\n- Reduced failed payment rate from 4.2% to 0.8%\n- Built retry logic and idempotency layer in Go\n\nProject: Internal ML Feature Store\n- Designed schema and API used by 6 ML teams\n- Cut feature serving latency by 60ms p99\n...`}
            className="w-full h-80 border border-gray-300 rounded p-3 text-sm
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
