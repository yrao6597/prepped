type Tab = "recruiter-prep" | "reflections"

interface LandingPageProps {
  onNavigate: (tab: Tab) => void
}

const FEATURES: Array<{
  tab: Tab
  title: string
  description: string
  icon: string
}> = [
  {
    tab: "recruiter-prep",
    title: "Recruiter Prep",
    description:
      "Paste a job description and get a tailored prep guide — company snapshot, fit analysis, questions to ask, likely screener questions, and red flags.",
    icon: "📋",
  },
  {
    tab: "reflections",
    title: "Interview Reflections",
    description:
      "Log what happened after each interview round. Optionally get an AI-generated structured reflection on what went well and what to improve.",
    icon: "🪞",
  },
]

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="max-w-2xl mx-auto py-20 px-4">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Job Search Assistant</h1>
        <p className="text-gray-500 text-sm">Your personal AI-powered coach for every stage of the interview process.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {FEATURES.map((feature) => (
          <button
            key={feature.tab}
            onClick={() => onNavigate(feature.tab)}
            className="text-left border border-gray-200 rounded-lg p-6 bg-white
              hover:border-gray-400 hover:shadow-sm transition-all group"
          >
            <span className="text-2xl mb-4 block">{feature.icon}</span>
            <h2 className="font-semibold text-gray-900 mb-2 group-hover:text-black">
              {feature.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
