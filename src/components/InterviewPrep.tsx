import type { PrepType } from "../types"

type InterviewPrepView = "recruiter-prep"

interface InterviewPrepProps {
  onNavigate: (view: InterviewPrepView, prepType: PrepType) => void
}

const PREP_TYPES: Array<{
  view: InterviewPrepView
  prepType: PrepType
  title: string
  description: string
}> = [
  {
    view: "recruiter-prep",
    prepType: "recruiter-call",
    title: "Recruiter / HR Call",
    description:
      "Prepare for a recruiter screen — get a company snapshot, fit analysis, questions to ask, and likely screener questions.",
  },
  {
    view: "recruiter-prep",
    prepType: "technical",
    title: "Technical Interview",
    description:
      "Prepare for a technical round — coding, system design, or domain-specific questions tailored to the role and your background.",
  },
  {
    view: "recruiter-prep",
    prepType: "behavioral",
    title: "Behavioral Interview",
    description:
      "Prepare for behavioral questions — craft strong STAR answers drawn from your specific experience and the job requirements.",
  },
]

export default function InterviewPrep({ onNavigate }: InterviewPrepProps) {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Interview Prep</h1>
        <p className="text-gray-400 text-sm">Choose the type of interview you're preparing for.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {PREP_TYPES.map((type) => (
          <button
            key={type.prepType}
            onClick={() => onNavigate(type.view, type.prepType)}
            className="text-left border border-gray-200 rounded-xl p-6 bg-white
              hover:border-gray-300 hover:shadow-md hover:-translate-y-px
              transition-all duration-200"
          >
            <h2 className="font-semibold text-gray-900 mb-2">{type.title}</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
