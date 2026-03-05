import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { generatePrepGuide } from "../lib/claude"
import { getResume, saveResume, getExperience, saveExperience, getPreps, savePrep } from "../lib/storage"
import { printToPdf } from "../lib/pdf"
import type { AsyncState, PrepGuide } from "../types"

const EMPTY_FORM = {
  companyName: "",
  roleTitle: "",
  jobDescription: "",
  resume: "",
  experience: "",
}

export default function RecruiterPrep() {
  const [form, setForm] = useState({ ...EMPTY_FORM, resume: getResume(), experience: getExperience() })
  const [state, setState] = useState<AsyncState<string>>({ status: "idle" })
  const [savedPreps, setSavedPreps] = useState<PrepGuide[]>([])
  const [selectedPrepId, setSelectedPrepId] = useState("")
  const [useSavedResume, setUseSavedResume] = useState(() => getResume().length > 0)
  const [useSavedExperience, setUseSavedExperience] = useState(() => getExperience().length > 0)
  const outputRef = useRef<HTMLDivElement>(null)

  const savedResume = getResume()
  const hasSavedResume = savedResume.length > 0
  const resumeForSubmit = useSavedResume ? savedResume : form.resume

  const savedExperience = getExperience()
  const hasSavedExperience = savedExperience.length > 0
  const experienceForSubmit = useSavedExperience ? savedExperience : form.experience

  useEffect(() => {
    setSavedPreps(getPreps())
  }, [])

  function handleFieldChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyName || !form.roleTitle || !form.jobDescription) return

    setState({ status: "loading" })
    if (!useSavedResume) saveResume(form.resume)
    if (!useSavedExperience) saveExperience(form.experience)

    try {
      const output = await generatePrepGuide({ ...form, resume: resumeForSubmit, experience: experienceForSubmit })
      setState({ status: "success", data: output })

      const entry: PrepGuide = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        company: form.companyName,
        role: form.roleTitle,
        output,
      }
      savePrep(entry)
      setSavedPreps(getPreps())
      setSelectedPrepId(entry.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setState({ status: "error", error: message })
    }
  }

  function handleLoadPrep(prepId: string) {
    if (!prepId) return
    const prep = savedPreps.find((p) => p.id === prepId)
    if (!prep) return
    setSelectedPrepId(prepId)
    setForm((prev) => ({ ...prev, companyName: prep.company, roleTitle: prep.role }))
    setState({ status: "success", data: prep.output })
  }

  function handleDownloadPdf() {
    if (!outputRef.current) return
    const title = `${form.companyName} — ${form.roleTitle}`
    printToPdf(title, outputRef.current.innerHTML)
  }

  const isLoading = state.status === "loading"

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Recruiter Prep</h1>
        {savedPreps.length > 0 && (
          <select
            value={selectedPrepId}
            onChange={(e) => handleLoadPrep(e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-1.5
              focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-700"
          >
            <option value="">Saved Preps ({savedPreps.length})</option>
            {savedPreps.map((prep) => (
              <option key={prep.id} value={prep.id}>
                {prep.company} — {prep.role} ({formatDate(prep.date)})
              </option>
            ))}
          </select>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Title
            </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
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
            <label className="block text-sm font-medium text-gray-700">
              My Resume / Background
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              My Experience / Projects
            </label>
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded
            hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Generating...
            </span>
          ) : (
            "Generate Prep Guide"
          )}
        </button>
      </form>

      {state.status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {state.error}
        </div>
      )}

      {state.status === "success" && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Prep Guide
            </h2>
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
            <ReactMarkdown>{state.data}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
