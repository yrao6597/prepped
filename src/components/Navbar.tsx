type Tab = "recruiter-prep" | "reflections" | "notes"

interface NavbarProps {
  activeTab: Tab | null
  onTabChange: (tab: Tab) => void
  onHome: () => void
  onOpenResume: () => void
  onOpenExperience: () => void
}

export default function Navbar({ activeTab, onTabChange, onHome, onOpenResume, onOpenExperience }: NavbarProps) {
  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button
          onClick={onHome}
          className="font-semibold text-gray-900 text-sm tracking-tight hover:text-gray-600 transition-colors"
        >
          Prepped
        </button>
        <div className="flex gap-1">
          <TabButton
            label="Recruiter Prep"
            isActive={activeTab === "recruiter-prep"}
            onClick={() => onTabChange("recruiter-prep")}
          />
          <TabButton
            label="Interview Reflections"
            isActive={activeTab === "reflections"}
            onClick={() => onTabChange("reflections")}
          />
          <TabButton
            label="Notes"
            isActive={activeTab === "notes"}
            onClick={() => onTabChange("notes")}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenExperience}
          className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300
            hover:border-gray-400 rounded px-3 py-1.5 transition-colors"
        >
          My Experience
        </button>
        <button
          onClick={onOpenResume}
          className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300
            hover:border-gray-400 rounded px-3 py-1.5 transition-colors"
        >
          My Resume
        </button>
      </div>
    </nav>
  )
}

interface TabButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  )
}
