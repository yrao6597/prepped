import { useState, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { generatePrepGuide } from "../lib/claude"
import { getResume, saveResume, getExperience, saveExperience, getPreps, savePrep, deletePrep } from "../lib/storage"
import { printToPdf } from "../lib/pdf"
import type { AsyncState, PrepGuide, PrepType } from "../types"

const PREP_TYPE_LABELS: Record<PrepType, string> = {
  "recruiter-call": "Recruiter Call",
  "technical": "Technical Interview",
  "behavioral": "Behavioral Interview",
}

const EMPTY_STATE_MESSAGES: Record<PrepType, string> = {
  "recruiter-call": "No prep guides yet. Generate one for your next recruiter call.",
  "technical": "No prep guides yet. Generate one for your next technical interview.",
  "behavioral": "No prep guides yet. Generate one for your next behavioral interview.",
}

const EMPTY_FORM = {
  companyName: "",
  roleTitle: "",
  jobDescription: "",
  resume: "",
  experience: "",
  additionalInfo: "",
}

interface RecruiterPrepProps {
  prepType: PrepType
}

export default function RecruiterPrep({ prepType }: RecruiterPrepProps) {
  const [preps, setPreps] = useState<PrepGuide[]>(() =>
    getPreps().filter((p) => (p.prepType ?? "recruiter-call") === prepType)
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [generateState, setGenerateState] = useState<AsyncState<string>>({ status: "idle" })
  const [useSavedResume, setUseSavedResume] = useState(() => getResume().length > 0)
  const [useSavedExperience, setUseSavedExperience] = useState(() => getExperience().length > 0)

  const savedResume = getResume()
  const hasSavedResume = savedResume.length > 0
  const savedExperience = getExperience()
  const hasSavedExperience = savedExperience.length > 0

  function handleFieldChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleOpenForm() {
    setForm({ ...EMPTY_FORM })
    setGenerateState({ status: "idle" })
    setIsFormOpen(true)
  }

  function handleCancel() {
    setIsFormOpen(false)
    setGenerateState({ status: "idle" })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGenerateState({ status: "loading" })

    const resumeForSubmit = useSavedResume ? savedResume : form.resume
    const experienceForSubmit = useSavedExperience ? savedExperience : form.experience

    if (!useSavedResume) saveResume(form.resume)
    if (!useSavedExperience) saveExperience(form.experience)

    try {
      const output = await generatePrepGuide({ ...form, resume: resumeForSubmit, experience: experienceForSubmit })
      const entry: PrepGuide = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        company: form.companyName,
        role: form.roleTitle,
        output,
        prepType,
      }
      savePrep(entry)
      setPreps(getPreps().filter((p) => (p.prepType ?? "recruiter-call") === prepType))
      setGenerateState({ status: "idle" })
      setIsFormOpen(false)
      setExpandedId(entry.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setGenerateState({ status: "error", error: message })
    }
  }

  function handleDelete(id: string) {
    deletePrep(id)
    setPreps(getPreps().filter((p) => (p.prepType ?? "recruiter-call") === prepType))
    if (expandedId === id) setExpandedId(null)
  }

  const isLoading = generateState.status === "loading"

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{PREP_TYPE_LABELS[prepType]}</h1>
        {!isFormOpen && (
          <button
            onClick={handleOpenForm}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded
              hover:bg-gray-700 transition-colors"
          >
            + New Prep
          </button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">New Prep Guide</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => handleFieldChange("companyName", e.target.value)}
                placeholder="e.g. Stripe"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
              <input
                type="text"
                value={form.roleTitle}
                onChange={(e) => handleFieldChange("roleTitle", e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <textarea
              value={form.jobDescription}
              onChange={(e) => handleFieldChange("jobDescription", e.target.value)}
              placeholder="Paste the full job description here..."
              required
              rows={8}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">My Resume / Background</label>
              {hasSavedResume && (
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useSavedResume}
                    onChange={(e) => setUseSavedResume(e.target.checked)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                  />
                  <span className="text-sm text-gray-500">Use saved resume</span>
                </label>
              )}
            </div>
            {useSavedResume && hasSavedResume ? (
              <div className="border border-gray-200 rounded px-3 py-2 bg-gray-50 text-sm text-gray-500 italic">
                Using saved resume — edit it via "My Resume" in the top nav.
              </div>
            ) : (
              <textarea
                value={form.resume}
                onChange={(e) => handleFieldChange("resume", e.target.value)}
                placeholder="Paste your resume or a brief background summary..."
                rows={5}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y font-mono"
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">My Experience / Projects</label>
              {hasSavedExperience && (
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useSavedExperience}
                    onChange={(e) => setUseSavedExperience(e.target.checked)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                  />
                  <span className="text-sm text-gray-500">Use saved experience</span>
                </label>
              )}
            </div>
            {useSavedExperience && hasSavedExperience ? (
              <div className="border border-gray-200 rounded px-3 py-2 bg-gray-50 text-sm text-gray-500 italic">
                Using saved experience — edit it via "My Experience" in the top nav.
              </div>
            ) : (
              <textarea
                value={form.experience}
                onChange={(e) => handleFieldChange("experience", e.target.value)}
                placeholder="Add project details, impact, stack, and anything beyond your resume..."
                rows={5}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y font-mono"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info About This Round</label>
            <p className="text-xs text-gray-400 mb-1.5">Optional — e.g. tips your recruiter shared, topics to expect, interview format details.</p>
            <textarea
              value={form.additionalInfo}
              onChange={(e) => handleFieldChange("additionalInfo", e.target.value)}
              placeholder="e.g. Recruiter mentioned they'll focus on system design and past leadership experience. 45-minute call with hiring manager."
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
            />
          </div>

          {generateState.status === "error" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {generateState.error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border
                border-gray-300 rounded hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded
                hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Generating...
                </span>
              ) : (
                "Generate Prep Guide"
              )}
            </button>
          </div>
        </form>
      )}

      {preps.length === 0 && !isFormOpen && (
        <p className="text-sm text-gray-400">{EMPTY_STATE_MESSAGES[prepType]}</p>
      )}

      <div className="space-y-3">
        {preps.map((prep) => (
          <PrepGuideCard
            key={prep.id}
            prep={prep}
            isExpanded={expandedId === prep.id}
            onToggle={() => setExpandedId(expandedId === prep.id ? null : prep.id)}
            onDelete={() => {
              if (confirm("Delete this prep guide?")) handleDelete(prep.id)
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface PrepGuideCardProps {
  prep: PrepGuide
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
}

function PrepGuideCard({ prep, isExpanded, onToggle, onDelete }: PrepGuideCardProps) {
  const outputRef = useRef<HTMLDivElement>(null)

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete()
  }

  function handleDownloadPdf(e: React.MouseEvent) {
    e.stopPropagation()
    if (!outputRef.current) return
    printToPdf(`${prep.company} — ${prep.role}`, outputRef.current.innerHTML)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div>
          <span className="font-medium text-gray-900 text-sm">{prep.company}</span>
          <span className="text-gray-400 text-sm mx-1.5">·</span>
          <span className="text-gray-600 text-sm">{prep.role}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {PREP_TYPE_LABELS[prep.prepType ?? "recruiter-call"]}
          </span>
          <span className="text-xs text-gray-400">{formatDate(prep.date)}</span>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
            aria-label="Delete prep guide"
          >
            ✕
          </button>
          <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900
                border border-gray-300 hover:border-gray-400 rounded px-3 py-1.5 transition-colors"
            >
              <DownloadIcon />
              Download PDF
            </button>
          </div>
          <div
            ref={outputRef}
            className="prose prose-sm prose-gray max-w-none
              prose-headings:font-semibold prose-headings:text-gray-900
              prose-li:text-gray-700 prose-p:text-gray-700"
          >
            <ReactMarkdown>{prep.output}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
