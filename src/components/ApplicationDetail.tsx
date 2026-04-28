import { useEffect, useState } from "react"
import { getApplications, updateApplicationStatus, updateApplicationInterestLevel } from "../lib/api"
import type { Application, ApplicationStatus, ApplicationInterestLevel } from "../lib/api"

const STATUS_OPTIONS: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "in-review", label: "In review" },
  { value: "in-interview", label: "In interview" },
  { value: "not-proceeding", label: "Not proceeding" },
]

const INTEREST_OPTIONS: Array<{ value: ApplicationInterestLevel; label: string }> = [
  { value: "top-choice", label: "Top choice" },
  { value: "interested", label: "Interested" },
  { value: "exploring", label: "Exploring" },
]

interface ApplicationDetailProps {
  applicationId: string
  onBack: () => void
}

export default function ApplicationDetail({ applicationId, onBack }: ApplicationDetailProps) {
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    async function load() {
      try {
        const all = await getApplications()
        if (!isCancelled) {
          const found = all.find((a) => a.id === applicationId) ?? null
          setApplication(found)
        }
      } catch (err) {
        if (!isCancelled) setError(err instanceof Error ? err.message : "Failed to load application")
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }
    void load()
    return () => { isCancelled = true }
  }, [applicationId])

  async function handleStatusChange(status: ApplicationStatus) {
    if (!application) return
    try {
      await updateApplicationStatus(application.id, status)
      setApplication((prev) => prev ? { ...prev, status } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    }
  }

  async function handleInterestLevelChange(interestLevel: ApplicationInterestLevel) {
    if (!application) return
    try {
      await updateApplicationInterestLevel(application.id, interestLevel)
      setApplication((prev) => prev ? { ...prev, interestLevel } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update interest level")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <p className="text-sm text-gray-400">Application not found.</p>
        <button onClick={onBack} className="mt-4 text-sm text-gray-500 hover:text-gray-900">← Back to Applications</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Applications
      </button>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{application.company}</h1>
        <p className="mt-1 text-gray-500">{application.role}{application.team ? ` · ${application.team}` : ""}</p>
        <p className="mt-1 text-sm text-gray-400">Applied {formatDate(application.applicationDate)}</p>
      </div>

      {/* Status & Interest */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Stage</label>
            <select
              value={application.status}
              onChange={(e) => void handleStatusChange(e.target.value as ApplicationStatus)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Interest Level</label>
            <select
              value={application.interestLevel}
              onChange={(e) => void handleInterestLevelChange(e.target.value as ApplicationInterestLevel)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {INTEREST_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Job Posting URL */}
      {application.url && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Job Posting</h2>
          <a
            href={application.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-gray-800 break-all"
          >
            {application.url}
          </a>
        </div>
      )}

      {/* Key Points */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Key Points</h2>
        {application.keyPoints.length > 0 ? (
          <ul className="space-y-2">
            {application.keyPoints.map((point) => (
              <li key={point} className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600 leading-snug">
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No key points yet — extract from the job description to populate this.</p>
        )}
      </div>

      {/* Requirements */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Requirements</h2>
        {application.requirements.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {application.requirements.map((req) => (
              <span key={req} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                {req}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No requirements yet — extract from the job description to populate this.</p>
        )}
      </div>

      {/* JD extraction placeholder */}
      <div className="bg-white border border-dashed border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Job Description</h2>
        <p className="text-sm text-gray-400 mb-3">Paste the job description to extract key points, requirements, and company info automatically.</p>
        <button
          disabled
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white opacity-40 cursor-not-allowed"
        >
          Extract Info — coming soon
        </button>
      </div>
    </div>
  )
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
