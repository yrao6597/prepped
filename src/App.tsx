import { useState } from "react"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import ResumeModal from "./components/ResumeModal"
import ExperienceModal from "./components/ExperienceModal"
import ProfileModal from "./components/ProfileModal"
import InterviewPrep from "./components/InterviewPrep"
import RecruiterPrep from "./components/RecruiterPrep"
import Reflections from "./components/Reflections"
import Notes from "./components/Notes"
import type { PrepType } from "./types"

type View = "home" | "interview-prep" | "recruiter-prep" | "reflections" | "notes"

export default function App() {
  const [view, setView] = useState<View>("home")
  const [prepType, setPrepType] = useState<PrepType>("recruiter-call")
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeView={view}
        onNavigate={setView}
        onOpenResume={() => setIsResumeModalOpen(true)}
        onOpenExperience={() => setIsExperienceModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <main className="ml-64 flex-1 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {view === "home" && (
            <Dashboard onNavigate={(v) => setView(v)} />
          )}
          {view === "interview-prep" && (
            <InterviewPrep onNavigate={(v, pt) => { setPrepType(pt); setView(v) }} />
          )}
          {view === "recruiter-prep" && <RecruiterPrep prepType={prepType} />}
          {view === "reflections" && <Reflections />}
          {view === "notes" && <Notes />}
        </div>
      </main>

      <ResumeModal isOpen={isResumeModalOpen} onClose={() => setIsResumeModalOpen(false)} />
      <ExperienceModal isOpen={isExperienceModalOpen} onClose={() => setIsExperienceModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  )
}
