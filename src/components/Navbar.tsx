import { useState, useRef, useEffect } from "react"
import type { PrepType } from "../types"

type Tab = "interview-prep" | "recruiter-prep" | "reflections" | "notes"

interface NavbarProps {
  activeTab: Tab | null
  onTabChange: (tab: Tab) => void
  onSelectPrepType: (prepType: PrepType) => void
  onHome: () => void
  onOpenResume: () => void
  onOpenExperience: () => void
  onOpenProfile: () => void
}

const PREP_TYPE_OPTIONS: Array<{ prepType: PrepType; label: string }> = [
  { prepType: "recruiter-call", label: "Recruiter Call" },
  { prepType: "technical", label: "Technical Interview" },
  { prepType: "behavioral", label: "Behavioral Interview" },
]

export default function Navbar({ activeTab, onTabChange, onSelectPrepType, onHome, onOpenResume, onOpenExperience, onOpenProfile }: NavbarProps) {
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
          <InterviewPrepDropdown
            isActive={activeTab === "interview-prep"}
            onViewAll={() => onTabChange("interview-prep")}
            onSelectPrepType={onSelectPrepType}
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
        <button
          onClick={onOpenProfile}
          aria-label="My Profile"
          className="text-gray-500 hover:text-gray-900 border border-gray-300
            hover:border-gray-400 rounded p-1.5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </nav>
  )
}

interface InterviewPrepDropdownProps {
  isActive: boolean
  onViewAll: () => void
  onSelectPrepType: (prepType: PrepType) => void
}

function InterviewPrepDropdown({ isActive, onViewAll, onSelectPrepType }: InterviewPrepDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          isActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
      >
        Interview Prep
        <svg className="w-3 h-3 opacity-50" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 8L1 3h10L6 8z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-50 py-1">
          <button
            onClick={() => { onViewAll(); setIsOpen(false) }}
            className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 transition-colors"
          >
            All prep types
          </button>
          <div className="border-t border-gray-100 my-1" />
          {PREP_TYPE_OPTIONS.map(({ prepType, label }) => (
            <button
              key={prepType}
              onClick={() => { onSelectPrepType(prepType); setIsOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
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
