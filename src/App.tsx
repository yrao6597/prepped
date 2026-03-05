import { useState } from "react"
import Navbar from "./components/Navbar"
import LandingPage from "./components/LandingPage"
import ResumeModal from "./components/ResumeModal"
import ExperienceModal from "./components/ExperienceModal"
import RecruiterPrep from "./components/RecruiterPrep"

type Tab = "recruiter-prep" | "reflections"
type View = "home" | Tab

export default function App() {
  const [view, setView] = useState<View>("home")
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false)

  function handleTabChange(tab: Tab) {
    setView(tab)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeTab={view === "home" ? null : view}
        onTabChange={handleTabChange}
        onHome={() => setView("home")}
        onOpenResume={() => setIsResumeModalOpen(true)}
        onOpenExperience={() => setIsExperienceModalOpen(true)}
      />
      <main>
        {view === "home" && <LandingPage onNavigate={handleTabChange} />}
        {view === "recruiter-prep" && <RecruiterPrep />}
        {view === "reflections" && (
          <div className="max-w-3xl mx-auto py-8 px-4 text-gray-400 text-sm">
            Interview Reflections — coming soon
          </div>
        )}
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
