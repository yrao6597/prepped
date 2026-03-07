import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { getReflections, saveReflection, updateReflection, saveNote } from "../lib/storage"
import { generateActionPlan } from "../lib/claude"
import type { Reflection, InterviewOutcome, AsyncState } from "../types"

const TODAY = new Date().toISOString().split("T")[0]

const EMPTY_FORM = {
  company: "",
  role: "",
  date: TODAY,
  interviewType: "",
  questionsAsked: "",
  wentWell: "",
  didntGoWell: "",
  outcome: "pending" as InterviewOutcome,
  additionalNotes: "",
}

export default function Reflections() {
  const [reflections, setReflections] = useState<Reflection[]>(() => getReflections())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleFieldChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const entry: Reflection = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      aiActionPlan: "",
      ...form,
    }
    saveReflection(entry)
    setReflections(getReflections())
    setForm({ ...EMPTY_FORM })
    setIsFormOpen(false)
    setExpandedId(entry.id)
  }

  function handleCancel() {
    setForm({ ...EMPTY_FORM })
    setIsFormOpen(false)
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Interview Reflections</h1>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded
              hover:bg-gray-700 transition-colors"
          >
            + Add Entry
          </button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900 mb-2">New Interview Log</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleFieldChange("company", e.target.value)}
                required
                placeholder="e.g. Stripe"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => handleFieldChange("role", e.target.value)}
                required
                placeholder="e.g. Senior Software Engineer"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
              <select
                value={form.outcome}
                onChange={(e) => handleFieldChange("outcome", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              >
                <option value="pending">Pending / Don't know yet</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type of Interview</label>
            <input
              type="text"
              value={form.interviewType}
              onChange={(e) => handleFieldChange("interviewType", e.target.value)}
              placeholder="e.g. Recruiter screen, System design, Behavioural, Take-home..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Questions Asked</label>
            <textarea
              value={form.questionsAsked}
              onChange={(e) => handleFieldChange("questionsAsked", e.target.value)}
              placeholder="What questions did they ask? Dump them all here..."
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What went well</label>
              <textarea
                value={form.wentWell}
                onChange={(e) => handleFieldChange("wentWell", e.target.value)}
                placeholder="What felt strong? What landed well?"
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What didn't go well</label>
              <textarea
                value={form.didntGoWell}
                onChange={(e) => handleFieldChange("didntGoWell", e.target.value)}
                placeholder="What felt off? What would you do differently?"
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={form.additionalNotes}
              onChange={(e) => handleFieldChange("additionalNotes", e.target.value)}
              placeholder="Anything else — gut feelings, things to follow up on, context for next time..."
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border
                border-gray-300 rounded hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded
                hover:bg-gray-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {reflections.length === 0 && !isFormOpen && (
        <p className="text-sm text-gray-400">No reflections yet. Add your first entry after an interview.</p>
      )}

      <div className="space-y-3">
        {reflections.map((r) => (
          <ReflectionCard
            key={r.id}
            reflection={r}
            isExpanded={expandedId === r.id}
            onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
            onUpdate={(updated) => {
              updateReflection(updated)
              setReflections(getReflections())
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface ReflectionCardProps {
  reflection: Reflection
  isExpanded: boolean
  onToggle: () => void
  onUpdate: (updated: Reflection) => void
}

function ReflectionCard({ reflection: r, isExpanded, onToggle, onUpdate }: ReflectionCardProps) {
  const [planState, setPlanState] = useState<AsyncState<string>>(
    r.aiActionPlan ? { status: "success", data: r.aiActionPlan } : { status: "idle" }
  )

  async function handleGeneratePlan() {
    setPlanState({ status: "loading" })
    try {
      const plan = await generateActionPlan(r)
      const updated = { ...r, aiActionPlan: plan }
      onUpdate(updated)
      setPlanState({ status: "success", data: plan })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setPlanState({ status: "error", error: message })
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div>
            <span className="font-medium text-gray-900 text-sm">{r.company}</span>
            <span className="text-gray-400 text-sm mx-1.5">·</span>
            <span className="text-gray-600 text-sm">{r.role}</span>
            {r.interviewType && (
              <>
                <span className="text-gray-400 text-sm mx-1.5">·</span>
                <span className="text-gray-500 text-sm">{r.interviewType}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
          <OutcomeBadge outcome={r.outcome} />
          <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 text-sm">
          {r.questionsAsked && (
            <Section label="Questions Asked" content={r.questionsAsked} />
          )}
          <div className="grid grid-cols-2 gap-4">
            {r.wentWell && <Section label="What went well" content={r.wentWell} />}
            {r.didntGoWell && <Section label="What didn't go well" content={r.didntGoWell} />}
          </div>
          {r.additionalNotes && (
            <Section label="Additional Notes" content={r.additionalNotes} />
          )}

          <div className="border-t border-gray-100 pt-4">
            {planState.status === "idle" && (
              <button
                onClick={handleGeneratePlan}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700
                  border border-gray-300 rounded hover:border-gray-400 hover:text-gray-900 transition-colors"
              >
                ✨ Generate Action Plan
              </button>
            )}
            {planState.status === "loading" && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating action plan...
              </div>
            )}
            {planState.status === "error" && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {planState.error}
                <button onClick={handleGeneratePlan} className="ml-2 underline">Retry</button>
              </div>
            )}
            {planState.status === "success" && (
              <div>
                <p className="text-sm font-bold text-gray-900 mb-2">✨ AI Action Plan</p>
                <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3
                  prose prose-sm prose-gray max-w-none
                  prose-headings:font-semibold prose-headings:text-gray-900
                  prose-li:text-gray-700 prose-p:text-gray-700">
                  <ReactMarkdown>{planState.data}</ReactMarkdown>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={handleGeneratePlan}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => {
                      saveNote({
                        id: crypto.randomUUID(),
                        title: `${r.company} — ${r.role} Action Plan`,
                        content: planState.data,
                        source: "action-plan",
                        createdAt: new Date().toISOString(),
                      })
                    }}
                    className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300
                      hover:border-gray-400 rounded px-2 py-0.5 transition-colors"
                  >
                    Save to Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  )
}

function OutcomeBadge({ outcome }: { outcome: InterviewOutcome }) {
  const styles: Record<InterviewOutcome, string> = {
    passed: "bg-green-50 text-green-700 border-green-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-gray-50 text-gray-500 border-gray-200",
  }
  const labels: Record<InterviewOutcome, string> = {
    passed: "Passed",
    failed: "Failed",
    pending: "Pending",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${styles[outcome]}`}>
      {labels[outcome]}
    </span>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
