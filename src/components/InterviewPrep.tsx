type InterviewPrepView = "recruiter-prep"

interface InterviewPrepProps {
  onNavigate: (view: InterviewPrepView) => void
}

const PREP_TYPES: Array<{
  view: InterviewPrepView
  title: string
  description: string
  icon: string
}> = [
  {
    view: "recruiter-prep",
    title: "Recruiter Call",
    description:
      "Prepare for a recruiter screen — get a company snapshot, fit analysis, questions to ask, and likely screener questions.",
    icon: "📋",
  },
]

export default function InterviewPrep({ onNavigate }: InterviewPrepProps) {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Interview Prep</h1>
        <p className="text-gray-500 text-sm">Choose the type of interview you're preparing for.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {PREP_TYPES.map((type) => (
          <button
            key={type.view}
            onClick={() => onNavigate(type.view)}
            className="text-left border border-gray-200 rounded-lg p-6 bg-white
              hover:border-gray-400 hover:shadow-sm transition-all group"
          >
            <span className="text-2xl mb-4 block">{type.icon}</span>
            <h2 className="font-semibold text-gray-900 mb-2 group-hover:text-black">
              {type.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
