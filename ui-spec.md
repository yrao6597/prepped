# Prepped — Main Dashboard UI Specification

Use this prompt to transform the main dashboard page of "Prepped" (a personal job search assistant app). I already have all the buttons and functionality wired up — I just need the UI restyled to match this design system exactly.

---

## Brand & Name
- App name: **Prepped**
- Tagline: "your job search ally" (lowercase, tracking-wide, very small)

---

## Design System — Color Palette (HSL, CSS custom properties)

### Light Mode
```css
--background: 40 25% 97%;        /* warm off-white, NOT pure white */
--foreground: 200 15% 20%;        /* dark blue-gray, NOT pure black */
--card: 40 20% 99%;               /* slightly lighter warm white */
--primary: 160 30% 46%;           /* muted sage-green (the main accent) */
--primary-foreground: 40 25% 97%; /* warm off-white text on primary */
--secondary: 160 18% 92%;         /* very light sage tint */
--muted: 40 15% 94%;              /* warm gray for muted backgrounds */
--muted-foreground: 200 8% 50%;   /* medium gray for secondary text */
--border: 40 15% 90%;             /* warm subtle border */
--radius: 1rem;                   /* generous rounding */
```

### Sidebar (dark, contrasting)
```css
--sidebar-background: 200 15% 15%;           /* dark charcoal blue */
--sidebar-foreground: 40 15% 90%;            /* warm light text */
--sidebar-primary: 160 30% 50%;              /* sage green highlight */
--sidebar-accent: 200 12% 22%;              /* slightly lighter charcoal for hover/active */
```

### Decorative palette (for cards, tags, notes)
```css
--sage: 160 20% 88%;       /* light green-gray */
--lavender: 260 30% 90%;   /* soft purple */
--peach: 20 60% 92%;       /* warm apricot */
--rose-soft: 350 40% 93%;  /* blush pink */
```

### Semantic colors
```css
--success: 152 55% 42%;   /* green for positive states */
--warning: 38 80% 55%;    /* amber */
--info: 210 60% 55%;      /* blue */
```

---

## Typography

### Fonts
- **Body/UI**: `DM Sans` (Google Fonts) — clean, geometric, friendly sans-serif
- **Display/Headings**: `Fraunces` (Google Fonts) — warm, soft serif with optical size axis. Use for page titles, hero text, and anywhere you want personality.
- Import: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');`

### Usage
- Page titles: `Fraunces`, ~30px, `font-semibold`, `text-foreground`
- Subtitles/descriptions: `DM Sans`, ~14px, `text-muted-foreground`
- Sidebar labels: `DM Sans`, 14px, `font-medium`
- Tiny labels/dates: `DM Sans`, 10-11px, uppercase, `tracking-widest`, muted

---

## Layout — Overall Structure

```
┌──────────────────────────────────────────────────────┐
│ [SIDEBAR 256px fixed]  │  [MAIN CONTENT area]        │
│                        │                              │
│  Logo + "Prepped"      │  max-width: ~1024px          │
│  tagline beneath       │  centered with px-8 py-8     │
│                        │                              │
│  ── nav items ──       │  ┌─ Page content ──────────┐ │
│  Dashboard       (•)   │  │                          │ │
│  Interview Prep        │  │  (see page specs below)  │ │
│  Reflections           │  │                          │ │
│  Notes                 │  └──────────────────────────┘ │
│  My Resume             │                              │
│  Job Tracker           │                              │
│                        │                              │
│  ┌─ Tip card ────────┐ │                              │
│  │ 💡 Tip of the day │ │                              │
│  │ small helpful text │ │                              │
│  └───────────────────┘ │                              │
└──────────────────────────────────────────────────────┘
```

### Sidebar Details
- Fixed left, full height, `w-64` (256px)
- Background: `sidebar-background` (dark charcoal)
- **Top**: Logo icon (9×9 rounded-lg square with a warm gradient, Sparkles icon inside) + "Prepped" in bold + tagline below in 10px muted text
- **Nav items**: vertical list, each is a link with icon (18px lucide icon) + label. Spaced `py-2.5`, `px-3`, `rounded-lg`
  - **Active state**: animated background pill (`sidebar-accent` color) that slides between items using `framer-motion layoutId`. Active text is `sidebar-primary` (sage green). The animated pill uses `type: "spring", bounce: 0.15, duration: 0.5`
  - **Inactive state**: text is `sidebar-foreground/60`, hover → `sidebar-foreground` + `bg-sidebar-accent`
- **Bottom**: A tip card with `bg-sidebar-accent`, rounded-lg, small motivational/practical tip text

### Main Content Area
- `ml-64` to clear the sidebar
- Inner container: `max-w-5xl mx-auto px-8 py-8`
- Uses `<Outlet />` for page routing

---

## Dashboard Page (Main Page) — Detailed Layout

```
┌─────────────────────────────────────────────┐
│  "Good morning 👋"          (Fraunces, 30px) │
│  "Every step you take..."   (DM Sans, muted) │
│                                              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ 📊  │ │ 📊  │ │ 📊  │ │ 📊  │           │
│  │Apps │ │Prep │ │Refl │ │Intv │           │
│  │  0  │ │  0  │ │  0  │ │  0  │           │
│  └─────┘ └─────┘ └─────┘ └─────┘           │
│                                              │
│  "Quick Actions"            (semibold, 18px) │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ icon     │ │ icon     │ │ icon     │     │
│  │ Generate │ │ Log a    │ │ Track    │     │
│  │ Prep     │ │ Reflect. │ │ Applic.  │     │
│  │ Guide    │ │          │ │          │     │
│  │ →        │ │ →        │ │ →        │     │
│  └──────────┘ └──────────┘ └──────────┘     │
│                                              │
│  ┌─ Motivation card (gradient) ────────────┐ │
│  │ ✨ You're doing great!                  │ │
│  │ Job searching is a journey...           │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Section 1: Greeting
- Time-aware: "Good morning" / "Good afternoon" / "Good evening" + 👋 emoji
- `Fraunces` font, `text-3xl`, `font-bold`
- Subtitle below in `text-muted-foreground`, encouraging tone
- Animates in with `framer-motion`: fade + slide up (`opacity: 0→1, y: 20→0`, 0.5s)

### Section 2: Stat Cards (4-column grid)
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Each card: `bg-card`, `border border-border`, `rounded-xl`, `p-5`
- Icon in a `w-10 h-10 rounded-lg bg-secondary` container, colored `text-primary`
- Label in `text-xs text-muted-foreground uppercase tracking-wide`
- Value in `text-2xl font-bold text-foreground`
- Each card staggers in with framer-motion (delay: 0.1, 0.15, 0.2, 0.25)
- Stats: Applications, Prep Guides, Reflections, Interviews

### Section 3: Quick Actions (3-column grid)
- Header: "Quick Actions", `text-lg font-semibold`
- `grid grid-cols-1 sm:grid-cols-3 gap-4`
- Each card: `bg-card`, `border border-border`, `rounded-xl`, `p-5`
- Icon container: `w-10 h-10 rounded-lg bg-secondary` → on hover → `bg-primary/10`
- Title: `font-semibold text-sm`
- Description: `text-xs text-muted-foreground`
- Bottom: "Get started →" link that appears on hover (`opacity-0 → opacity-100 transition`)
- Hover: `shadow-elevated`, `border-primary/20`
- Animates in with delay 0.3

### Section 4: Motivation Card
- Full-width, uses `gradient-warm` background (define as `linear-gradient(135deg, hsl(var(--primary)), hsl(160 35% 38%))`)
- `rounded-xl p-6`
- Text is `text-primary-foreground` (warm white)
- Sparkles icon + "You're doing great!" heading + encouraging paragraph
- Animates in with delay 0.4

---

## Animation Patterns (framer-motion)

Every section uses `framer-motion` for entrance:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: N }}
>
```
- Stagger delays: 0 → 0.1 → 0.15 → 0.2 → 0.25 → 0.3 → 0.4
- Sidebar active indicator: `layoutId="sidebar-active"` with spring animation

---

## Component Styling Conventions

### Buttons
- Primary/CTA: `gradient-warm text-primary-foreground rounded-full` with `shadow-warm` (warm glow shadow). NOT square — use `rounded-full` for pill shape.
- Secondary: `bg-secondary text-secondary-foreground rounded-full`
- Ghost: transparent, `hover:bg-accent`
- All buttons use `DM Sans`, `text-sm`, `font-medium`

### Cards
- `bg-card border border-border rounded-xl` — always 1rem radius
- Hover state: `hover:shadow-elevated hover:border-primary/20 transition-all duration-300`
- No harsh shadows. Shadows are warm and diffuse:
  - `shadow-soft`: `0 2px 16px -2px hsl(200 15% 20% / 0.06)`
  - `shadow-lifted`: `0 8px 30px -8px hsl(200 15% 20% / 0.08)`

### Inputs
- `rounded-xl` (matching card radius), `border-border`, `bg-background`
- On focus: ring in `primary` color

### Gradient
- `gradient-warm`: `linear-gradient(135deg, hsl(var(--primary)), hsl(160 35% 38%))` — a sage-green-to-deeper-green sweep
- `shadow-warm`: `0 4px 20px -4px hsl(160 30% 46% / 0.3)` — green glow

---

## Vibe / Feel Summary

- **NOT corporate**. No sharp edges, no navy blue, no stock-photo energy.
- **Warm & personal** like a cozy productivity app (think Bear, Notion in earth tones, Day One journal)
- **Optimistic but grounded** — encouraging copy without being cheesy. Think "you've got this" not "CRUSH YOUR GOALS 💪"
- **Generous whitespace**, no visual clutter
- **Muted earth-tone palette** with sage green as the only real "color" — everything else is warm grays, off-whites, and the occasional soft pastel (lavender, peach, rose) for decoration
- **Rounded everything** — 1rem border radius on cards, pill-shaped buttons, rounded icon containers
- **Subtle motion** — gentle fade-ups on load, spring-animated sidebar indicator. Nothing flashy.
- **Dark sidebar / light content** contrast creates visual hierarchy without being harsh
