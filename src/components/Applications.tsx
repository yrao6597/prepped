import { useEffect, useState } from "react"
import { getApplications } from "../lib/api"
import type { Application } from "../lib/api"

export default function Applications() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadApplications() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getApplications()
        if (!isCancelled) setApplications(data)
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : "Failed to load applications"
          setError(message)
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadApplications()

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applications</h1>
          <p className="mt-2 text-sm text-gray-500">
            Save job postings, extract the important bits, and keep your search organized.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="shrink-0 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-gray-700"
          >
            + Add Application
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isFormOpen && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">New Application</h2>
              <p className="mt-1 text-sm text-gray-500">
                Paste a job link or description and we&apos;ll build this out next.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-sm text-gray-400 transition-colors hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Job Posting URL</label>
              <input
                type="text"
                placeholder="https://company.com/careers/role"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Job Description</label>
              <textarea
                placeholder="Optional for now. Paste the job description here if you want to save or extract from text later."
                rows={6}
                className="w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-all duration-150 hover:border-gray-400 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-gray-700"
              >
                Extract Info
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-400">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-400">
            No applications yet. Add your first one to start tracking roles.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              isExpanded={expandedId === application.id}
              onToggle={() => setExpandedId(expandedId === application.id ? null : application.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ApplicationCard({
  application,
  isExpanded,
  onToggle,
}: {
  application: Application
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="text-sm font-semibold text-gray-900">{application.company}</h2>
            <span className="text-sm text-gray-300">·</span>
            <p className="text-sm text-gray-600">{application.role}</p>
            {application.team && (
              <>
                <span className="text-sm text-gray-300">·</span>
                <p className="text-xs text-gray-500">{application.team}</p>
              </>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span>Applied {formatDate(application.applicationDate)}</span>
            {application.url && (
              <>
                <span>•</span>
                <a
                  href={application.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
                >
                  View posting
                </a>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-md border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-700"
          aria-label={isExpanded ? "Collapse application" : "Expand application"}
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (application.keyPoints.length > 0 || application.requirements.length > 0) && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Key Points</p>
            {application.keyPoints.length > 0 ? (
              <ul className="space-y-1 text-sm text-gray-600">
                {application.keyPoints.slice(0, 3).map((point) => (
                  <li key={point} className="rounded-md bg-gray-50 px-2.5 py-1.5 leading-snug">
                    {point}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No key points saved yet.</p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Requirements</p>
            {application.requirements.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {application.requirements.slice(0, 6).map((requirement) => (
                  <span
                    key={requirement}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                  >
                    {requirement}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No requirements saved yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
