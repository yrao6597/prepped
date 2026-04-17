import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PrepType } from "../types"

type View = "home" | "applications" | "interview-prep" | "recruiter-prep" | "reflections" | "notes"

interface SidebarProps {
  activeView: View
  onNavigate: (view: View) => void
  onSelectPrepType: (prepType: PrepType) => void
  onOpenResume: () => void
  onOpenExperience: () => void
  onOpenProfile: () => void
}

const PREP_TYPE_OPTIONS: Array<{ prepType: PrepType; label: string }> = [
  { prepType: "recruiter-call", label: "Recruiter / HR Call" },
  { prepType: "technical", label: "Technical Interview" },
  { prepType: "behavioral", label: "Behavioral Interview" },
]

const TIP = "Treat every interview as practice — even the ones you don't want the job for."

export default function Sidebar({ activeView, onNavigate, onSelectPrepType, onOpenResume, onOpenExperience, onOpenProfile }: SidebarProps) {
  const activeNavView = activeView === "recruiter-prep" ? "interview-prep" : activeView
  const [prepMenuOpen, setPrepMenuOpen] = useState(
    activeView === "interview-prep" || activeView === "recruiter-prep"
  )

  const isInterviewPrepActive = activeNavView === "interview-prep"

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-sidebar-bg flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(160 35% 38%))" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
          <span className="text-sidebar-fg font-bold text-lg tracking-tight">Prepped</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest pl-12" style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}>
          your job search ally
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {/* Dashboard */}
        <NavItem
          isActive={activeNavView === "home"}
          onClick={() => onNavigate("home")}
          icon={<HomeIcon />}
          label="Dashboard"
        />

        <NavItem
          isActive={activeNavView === "applications"}
          onClick={() => onNavigate("applications")}
          icon={<ApplicationsIcon />}
          label="Applications"
        />

        {/* Interview Prep — expandable */}
        <div>
          <div className="relative">
            {isInterviewPrepActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-lg bg-sidebar-accent"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <button
              onClick={() => {
                onNavigate("interview-prep")
                setPrepMenuOpen((prev) => !prev)
              }}
              className="relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ color: isInterviewPrepActive ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground) / 0.6)" }}
              onMouseEnter={(e) => { if (!isInterviewPrepActive) e.currentTarget.style.color = "hsl(var(--sidebar-foreground))" }}
              onMouseLeave={(e) => { if (!isInterviewPrepActive) e.currentTarget.style.color = "hsl(var(--sidebar-foreground) / 0.6)" }}
            >
              <span className="flex items-center gap-3">
                <PrepIcon />
                Interview Prep
              </span>
              <svg
                className={`w-3 h-3 opacity-50 transition-transform duration-200 ${prepMenuOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {prepMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pl-4 pt-0.5 space-y-0.5">
                  {PREP_TYPE_OPTIONS.map(({ prepType, label }) => (
                    <button
                      key={prepType}
                      onClick={() => onSelectPrepType(prepType)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 hover:bg-sidebar-accent"
                      style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(var(--sidebar-foreground))" }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(var(--sidebar-foreground) / 0.55)" }}
                    >
                      <span className="w-1 h-1 rounded-full bg-current opacity-60 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reflections */}
        <NavItem
          isActive={activeNavView === "reflections"}
          onClick={() => onNavigate("reflections")}
          icon={<ReflectIcon />}
          label="Reflections"
        />

        {/* Notes */}
        <NavItem
          isActive={activeNavView === "notes"}
          onClick={() => onNavigate("notes")}
          icon={<NoteIcon />}
          label="Notes"
        />

        <div className="pt-3 pb-1">
          <p className="px-3 text-[10px] uppercase tracking-widest" style={{ color: "hsl(var(--sidebar-foreground) / 0.3)" }}>
            Profile
          </p>
        </div>

        {[
          { label: "My Resume", onClick: onOpenResume },
          { label: "My Experience", onClick: onOpenExperience },
          { label: "My Profile", onClick: onOpenProfile },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-sidebar-accent"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.6)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(var(--sidebar-foreground))" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(var(--sidebar-foreground) / 0.6)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {label}
          </button>
        ))}
      </nav>

      {/* Tip card */}
      <div className="px-3 pb-5">
        <div className="bg-sidebar-accent rounded-xl p-4">
          <p className="text-[11px] font-medium mb-1" style={{ color: "hsl(var(--sidebar-primary))" }}>Tip</p>
          <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--sidebar-foreground) / 0.7)" }}>
            {TIP}
          </p>
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  isActive: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function NavItem({ isActive, onClick, icon, label }: NavItemProps) {
  return (
    <div className="relative">
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-sidebar-accent"
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
      <button
        onClick={onClick}
        className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
        style={{ color: isActive ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground) / 0.6)" }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "hsl(var(--sidebar-foreground))" }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "hsl(var(--sidebar-foreground) / 0.6)" }}
      >
        {icon}
        {label}
      </button>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function PrepIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ApplicationsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13a1 1 0 01-1 1H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h6" />
    </svg>
  )
}

function ReflectIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}
