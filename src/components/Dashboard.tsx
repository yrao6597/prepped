import { motion } from "framer-motion"
import { getPreps, getReflections, getNotes } from "../lib/storage"

type View = "interview-prep" | "reflections" | "notes"

interface DashboardProps {
  onNavigate: (view: View) => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning 👋"
  if (hour < 17) return "Good afternoon 👋"
  return "Good evening 👋"
}

const SUBTITLES = [
  "Every application is a step forward. Keep going.",
  "Showing up is half the battle — you're already here.",
  "Progress over perfection. You've got this.",
]

const subtitle = SUBTITLES[new Date().getDay() % SUBTITLES.length]

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
})

export default function Dashboard({ onNavigate }: DashboardProps) {
  const prepCount = getPreps().length
  const reflectionCount = getReflections().length
  const noteCount = getNotes().length

  const stats = [
    { label: "Prep Guides", value: prepCount, icon: PrepIcon },
    { label: "Reflections", value: reflectionCount, icon: ReflectIcon },
    { label: "Notes", value: noteCount, icon: NoteIcon },
    { label: "Applications", value: 0, icon: AppIcon },
  ]

  const quickActions = [
    {
      title: "Generate Prep Guide",
      description: "Tailor a guide to any job — company snapshot, fit analysis, likely questions.",
      view: "interview-prep" as View,
      icon: PrepIcon,
    },
    {
      title: "Log a Reflection",
      description: "Capture what happened after an interview while it's still fresh.",
      view: "reflections" as View,
      icon: ReflectIcon,
    },
    {
      title: "Take a Note",
      description: "Jot down anything — things to study, patterns you've noticed, ideas.",
      view: "notes" as View,
      icon: NoteIcon,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
          {getGreeting()}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            {...fadeUp(0.1 + i * 0.05)}
            className="bg-card border border-border rounded-xl p-5 shadow-soft"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4 text-primary">
              <Icon />
            </div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div {...fadeUp(0.3)}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(({ title, description, view, icon: Icon }) => (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className="group text-left bg-card border border-border rounded-xl p-5
                hover:shadow-lifted hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4
                text-primary group-hover:bg-primary/10 transition-colors duration-200">
                <Icon />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>
              <p className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Get started →
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Motivation card */}
      <motion.div
        {...fadeUp(0.4)}
        className="rounded-xl p-6"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(160 35% 38%))" }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">✨</span>
          <div>
            <p className="font-semibold text-primary-foreground mb-1">You're doing great.</p>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--primary-foreground) / 0.85)" }}>
              Job searching is genuinely hard. Every prep guide you generate, every reflection you log —
              it all compounds. Keep showing up.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function PrepIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

function AppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}
