import { useEffect, useState } from "react"
import { getApplications, saveApplication, updateApplicationInterestLevel, updateApplicationStatus, deleteApplication } from "../lib/api"
import type { Application, ApplicationInterestLevel, ApplicationStatus } from "../lib/api"

type SortOrder = "newest" | "oldest"
type ViewMode = "board" | "list"
type StatusColumn = {
  key: ApplicationStatus
  label: string
  description: string
}

const STATUS_COLUMNS: StatusColumn[] = [
  { key: "in-review", label: "In review", description: "Submitted and waiting for the next signal." },
  { key: "in-interview", label: "In interview", description: "Actively moving through recruiter or interview rounds." },
  { key: "not-proceeding", label: "Not proceeding", description: "Closed out or no longer moving forward." },
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  "in-review": "In review",
  "in-interview": "In interview",
  "not-proceeding": "Not proceeding",
}

const INTEREST_LEVEL_OPTIONS: Array<{ value: ApplicationInterestLevel; label: string }> = [
  { value: "top-choice", label: "Top choice" },
  { value: "interested", label: "Interested" },
  { value: "exploring", label: "Exploring" },
]

const EMPTY_FORM = {
  company: "",
  role: "",
  team: "",
  url: "",
  applicationDate: new Date().toISOString().slice(0, 10),
}

export default function Applications() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null)
  const [interestUpdateId, setInterestUpdateId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("board")

  function handleOpenForm() {
    setForm({ ...EMPTY_FORM, applicationDate: new Date().toISOString().slice(0, 10) })
    setError(null)
    setIsFormOpen(true)
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const now = new Date().toISOString()
      const entry: Application = {
        id: crypto.randomUUID(),
        url: form.url,
        company: form.company,
        role: form.role,
        team: form.team,
        status: "in-review",
        interestLevel: "interested",
        keyPoints: [],
        requirements: [],
        applicationDate: new Date(form.applicationDate).toISOString(),
        createdAt: now,
      }
      await saveApplication(entry)
      setApplications((prev) => [entry, ...prev])
      setIsFormOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save application")
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const sortedApplications = [...applications].sort((a, b) => {
    const aTime = new Date(a.applicationDate).getTime()
    const bTime = new Date(b.applicationDate).getTime()
    return sortOrder === "newest" ? bTime - aTime : aTime - bTime
  })

  const applicationsByStatus = STATUS_COLUMNS.map((column) => ({
    ...column,
    applications: sortedApplications.filter((application) => application.status === column.key),
  }))

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    setStatusUpdateId(id)
    setError(null)
    try {
      await updateApplicationStatus(id, status)
      setApplications((prev) =>
        prev.map((application) =>
          application.id === id ? { ...application, status } : application
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update application status"
      setError(message)
    } finally {
      setStatusUpdateId(null)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    try {
      await deleteApplication(id)
      setApplications((prev) => prev.filter((a) => a.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete application")
    }
  }

  async function handleInterestLevelChange(id: string, interestLevel: ApplicationInterestLevel) {
    setInterestUpdateId(id)
    setError(null)
    try {
      await updateApplicationInterestLevel(id, interestLevel)
      setApplications((prev) =>
        prev.map((application) =>
          application.id === id ? { ...application, interestLevel } : application
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update interest level"
      setError(message)
    } finally {
      setInterestUpdateId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applications</h1>
          <p className="mt-2 text-sm text-gray-500">
            Save job postings, extract the important bits, and keep your search organized.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={handleOpenForm}
            className="shrink-0 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-gray-700"
          >
            + Add Application
          </button>
        )}
      </div>

      {!isLoading && applications.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "board"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              List
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="application-sort" className="text-sm text-gray-500">
              Sort by
            </label>
            <select
              id="application-sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="newest">Application date: newest first</option>
              <option value="oldest">Application date: oldest first</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleFormSubmit} className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">New Application</h2>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Company <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g. Stripe"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Team <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={form.team}
                  onChange={(e) => setForm((prev) => ({ ...prev, team: e.target.value }))}
                  placeholder="e.g. Payments Infrastructure"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Application Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  required
                  value={form.applicationDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, applicationDate: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Job Posting URL <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://company.com/careers/role"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-all duration-150 hover:border-gray-400 hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Application"}
              </button>
            </div>
          </div>
        </form>
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
      ) : viewMode === "board" ? (
        <div className="grid gap-5 xl:grid-cols-3">
          {applicationsByStatus.map((column) => (
            <section
              key={column.key}
              className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50/70 p-5"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-gray-900">{column.label}</h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500">
                    {column.applications.length}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {column.description}
                </p>
              </div>

              {column.applications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-5 text-center">
                  <p className="text-xs text-gray-400">No applications in this stage yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {column.applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      isExpanded={expandedId === application.id}
                      isUpdatingStatus={statusUpdateId === application.id}
                      isUpdatingInterest={interestUpdateId === application.id}
                      onToggle={() => setExpandedId(expandedId === application.id ? null : application.id)}
                      onStatusChange={handleStatusChange}
                      onInterestLevelChange={handleInterestLevelChange}
                      onDelete={() => { if (confirm("Delete this application?")) void handleDelete(application.id) }}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              isExpanded={expandedId === application.id}
              isUpdatingStatus={statusUpdateId === application.id}
              isUpdatingInterest={interestUpdateId === application.id}
              onToggle={() => setExpandedId(expandedId === application.id ? null : application.id)}
              onStatusChange={handleStatusChange}
              onInterestLevelChange={handleInterestLevelChange}
              onDelete={() => { if (confirm("Delete this application?")) void handleDelete(application.id) }}
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
  isUpdatingStatus,
  isUpdatingInterest,
  onToggle,
  onStatusChange,
  onInterestLevelChange,
  onDelete,
}: {
  application: Application
  isExpanded: boolean
  isUpdatingStatus: boolean
  isUpdatingInterest: boolean
  onToggle: () => void
  onStatusChange: (id: string, status: ApplicationStatus) => void
  onInterestLevelChange: (id: string, interestLevel: ApplicationInterestLevel) => void
  onDelete: () => void
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
            <span>•</span>
            <span>{STATUS_LABELS[application.status]}</span>
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
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-gray-200 p-1.5 text-gray-300 transition-colors hover:border-red-200 hover:text-red-400"
            aria-label="Delete application"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-700"
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
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor={`status-${application.id}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Status
          </label>
          <select
            id={`status-${application.id}`}
            value={application.status}
            onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
            disabled={isUpdatingStatus}
            className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            {STATUS_COLUMNS.map((status) => (
              <option key={status.key} value={status.key}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor={`interest-${application.id}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Interest
          </label>
          <select
            id={`interest-${application.id}`}
            value={application.interestLevel}
            onChange={(e) => onInterestLevelChange(application.id, e.target.value as ApplicationInterestLevel)}
            disabled={isUpdatingInterest}
            className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            {INTEREST_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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
