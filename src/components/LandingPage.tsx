type Tab = "interview-prep" | "recruiter-prep" | "reflections" | "notes"

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
    tab: "interview-prep",
    title: "Interview Prep",
    description:
      "Prepare for any interview type — recruiter screens, technical rounds, and more. Get tailored prep guides based on the job and your background.",
    icon: "📋",
  },
  {
    tab: "reflections",
    title: "Interview Reflections",
    description:
      "Log what happened after each interview round. Optionally get an AI-generated structured reflection on what went well and what to improve.",
    icon: "🪞",
  },
  {
    tab: "notes",
    title: "Notes",
    description:
      "A scratchpad for anything — saved AI action plans, things to study, patterns you've noticed across interviews.",
    icon: "📝",
  },
]

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="max-w-3xl mx-auto py-20 px-4">
      <div className="mb-14">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Prepped</h1>
        <p className="text-gray-400 text-sm">Your personal AI-powered coach for every stage of the interview process.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {FEATURES.map((feature) => (
          <button
            key={feature.tab}
            onClick={() => onNavigate(feature.tab)}
            className="text-left border border-gray-200 rounded-xl p-6 bg-white
              hover:border-gray-300 hover:shadow-md hover:-translate-y-px
              transition-all duration-200 group"
          >
            <span className="text-2xl mb-4 block">{feature.icon}</span>
            <h2 className="font-semibold text-gray-900 mb-2">
              {feature.title}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
