import { useState } from "react"
import Navbar from "./components/Navbar"
import LandingPage from "./components/LandingPage"
import ResumeModal from "./components/ResumeModal"
import ExperienceModal from "./components/ExperienceModal"
import InterviewPrep from "./components/InterviewPrep"
import RecruiterPrep from "./components/RecruiterPrep"
import Reflections from "./components/Reflections"
import Notes from "./components/Notes"
import type { PrepType } from "./types"

type Tab = "interview-prep" | "recruiter-prep" | "reflections" | "notes"
type View = "home" | Tab

export default function App() {
  const [view, setView] = useState<View>("home")
  const [prepType, setPrepType] = useState<PrepType>("recruiter-call")
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false)

  function handleTabChange(tab: Tab) {
    setView(tab)
  }

  const activeTab: Tab | null =
    view === "home" ? null
    : view === "recruiter-prep" ? "interview-prep"
    : view

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onHome={() => setView("home")}
        onOpenResume={() => setIsResumeModalOpen(true)}
        onOpenExperience={() => setIsExperienceModalOpen(true)}
      />
      <main>
        {view === "home" && <LandingPage onNavigate={handleTabChange} />}
        {view === "interview-prep" && (
          <InterviewPrep onNavigate={(v, pt) => { setPrepType(pt); setView(v) }} />
        )}
        {view === "recruiter-prep" && <RecruiterPrep prepType={prepType} />}
        {view === "reflections" && <Reflections />}
        {view === "notes" && <Notes />}
      </main>
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />
      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
      />
    </div>
  )
}
