import { useState } from "react"
import Navbar from "./components/Navbar"
import ResumeModal from "./components/ResumeModal"
import ExperienceModal from "./components/ExperienceModal"
import RecruiterPrep from "./components/RecruiterPrep"

type Tab = "recruiter-prep" | "reflections"

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("recruiter-prep")
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenResume={() => setIsResumeModalOpen(true)}
        onOpenExperience={() => setIsExperienceModalOpen(true)}
      />
      <main>
        {activeTab === "recruiter-prep" && <RecruiterPrep />}
        {activeTab === "reflections" && (
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
