import { useState, useEffect } from "react"
import { getProfile, updateProfile } from "../lib/api"
import type { UserProfile } from "../types"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const EMPTY_PROFILE: UserProfile = { email: "", linkedin: "", github: "", website: "" }

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [form, setForm] = useState<UserProfile>(EMPTY_PROFILE)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    let isCancelled = false

    async function loadProfile() {
      setIsLoading(true)
      setError(null)
      try {
        const profile = await getProfile()
        if (!isCancelled) {
          setForm({
            email: profile.email,
            linkedin: profile.linkedin,
            github: profile.github,
            website: profile.website,
          })
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : "Failed to load profile"
          setError(message)
          setForm(EMPTY_PROFILE)
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadProfile()

    return () => {
      isCancelled = true
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    try {
      await updateProfile(form)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save profile"
      setError(message)
    } finally {
      setIsSaving(false)
    }
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
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading profile...</p>
          ) : (
            <>
              <Field label="Email" value={form.email} placeholder="you@example.com" onChange={(v) => handleChange("email", v)} />
              <Field label="LinkedIn" value={form.linkedin} placeholder="https://linkedin.com/in/yourname" onChange={(v) => handleChange("linkedin", v)} />
              <Field label="GitHub" value={form.github} placeholder="https://github.com/yourhandle" onChange={(v) => handleChange("github", v)} />
              <Field label="Personal Website" value={form.website} placeholder="https://yoursite.com" onChange={(v) => handleChange("website", v)} />
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border
              border-gray-300 rounded hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
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
