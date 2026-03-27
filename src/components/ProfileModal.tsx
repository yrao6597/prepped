import { useState, useEffect } from "react"
import { getProfile, saveProfile } from "../lib/storage"
import type { UserProfile } from "../types"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const EMPTY_PROFILE: UserProfile = { email: "", linkedin: "", github: "", website: "" }

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [form, setForm] = useState<UserProfile>(EMPTY_PROFILE)

  useEffect(() => {
    if (isOpen) setForm(getProfile())
  }, [isOpen])

  if (!isOpen) return null

  function handleSave() {
    saveProfile(form)
    onClose()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleChange(field: keyof UserProfile, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">My Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">
            Saved here for quick reference — handy when filling out applications or prepping for calls.
          </p>
          <Field label="Email" value={form.email} placeholder="you@example.com" onChange={(v) => handleChange("email", v)} />
          <Field label="LinkedIn" value={form.linkedin} placeholder="https://linkedin.com/in/yourname" onChange={(v) => handleChange("linkedin", v)} />
          <Field label="GitHub" value={form.github} placeholder="https://github.com/yourhandle" onChange={(v) => handleChange("github", v)} />
          <Field label="Personal Website" value={form.website} placeholder="https://yoursite.com" onChange={(v) => handleChange("website", v)} />
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
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function Field({ label, value, placeholder, onChange }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
    </div>
  )
}
