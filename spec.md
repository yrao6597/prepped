# Job Search Assistant — Spec

## Overview
A single-page web app (React + TypeScript + Tailwind) that acts as a personal AI-powered job search coach. Uses localStorage for all persistence. No backend. Clean, minimal UI.

---

## Tech Stack
- React + TypeScript (Vite scaffold)
- Tailwind CSS + `@tailwindcss/typography` (for prose markdown rendering)
- `react-markdown` for rendering Claude output
- localStorage for all persistence
- Anthropic API via direct fetch to `https://api.anthropic.com/v1/messages`
  - Header: `anthropic-dangerous-direct-browser-access: true`
  - Model: `claude-sonnet-4-20250514`
  - Max tokens: 4096
  - API key via `VITE_ANTHROPIC_API_KEY` env var

---

## App Structure

### Navigation (Navbar)
- Clickable app title ("Job Search Assistant") — navigates home
- Three tabs: **Recruiter Prep**, **Interview Reflections**, **Notes**
- Top-right buttons: **My Experience** (opens modal), **My Resume** (opens modal)

### Landing Page
- Shown when no tab is active (home view)
- 3-column grid of feature cards (Recruiter Prep, Interview Reflections, Notes)
- Each card is clickable and navigates to that feature

### My Resume Modal
- Textarea to paste/edit resume text
- Saved to localStorage under `jsa_resume`
- Accessible from any view via navbar button

### My Experience Modal
- Textarea to add additional context about projects and work history not captured in the resume
- Saved to localStorage under `jsa_experience`
- Used alongside resume in prep guide generation

---

## Feature 1: Recruiter Prep

### UI
- Form fields: Company Name, Role Title, Job Description (large textarea)
- Resume field with "Use saved resume" checkbox — if checked, uses `jsa_resume` from localStorage; otherwise shows textarea
- Experience field with "Use saved experience" checkbox — if checked, uses `jsa_experience` from localStorage; otherwise shows textarea
- **Generate Prep Guide** button
- Output area: renders Claude's markdown response
- **Download PDF** button (appears after output is generated) — opens browser print dialog styled as a clean PDF
- **Saved Preps** dropdown — reload any previously generated guide

### Behavior
- On submit, calls Claude with a structured system prompt generating:
  1. Quick Company Snapshot
  2. Why This Role Is a Fit (based on resume + experience vs JD)
  3. Top 5 Questions to Ask the Recruiter
  4. Likely Screener Questions — each with: why the recruiter asks it, a 3–5 sentence suggested answer, and a specific example from the candidate's background
  5. Red Flags / Things to Clarify
  6. One-line "Why [Company]?" Answer
- Saves each generated guide to localStorage under `jsa_preps` as `{ id, date, company, role, output }`
- PDF uses `window.open` + `window.print()` via an embedded script tag in the opened window

---

## Feature 2: Interview Reflections

### UI
- **+ Add Entry** button opens a form with:
  - Company, Role (text fields, grid)
  - Interview Date (date picker, defaults to today), Outcome (select: Pending / Passed / Failed, grid)
  - Type of Interview (text field — freeform, e.g. "Recruiter screen", "System design")
  - Questions Asked (textarea)
  - What Went Well / What Didn't Go Well (two-column textarea grid)
  - Additional Notes (textarea)
- Past reflections shown as expandable cards, newest first
- Card header: company · role · interview type | date | outcome badge | expand toggle
- Expanded card shows each section with a bold label and a grey rounded content box

### AI Action Plan
- Each reflection card has a **✨ Generate Action Plan** button (shown when no plan exists)
- Calls Claude with the reflection details to generate a structured improvement plan
- Plan is rendered as markdown in a styled box
- Persisted to the reflection entry in localStorage via `updateReflection`
- **Regenerate** link to re-run, **Save to Notes** button to save the plan directly to the Notes feature
- Loading spinner and inline error state handled

### Storage
- Key: `jsa_reflections`
- Schema: `{ id, company, role, date, interviewType, questionsAsked, wentWell, didntGoWell, outcome, additionalNotes, aiActionPlan, createdAt }`

---

## Feature 3: Notes

### UI
- **+ New Note** button opens an inline form (title + content textarea)
- Notes listed as expandable cards, newest first
- Card header: title | source badge (Manual / Action Plan) | date | Edit button | delete (✕) | expand toggle
- Expanded card renders content as markdown

### Edit
- Clicking **Edit** opens an inline edit form within the card (title + content textarea)
- Saves updated note to localStorage; hides the content view while editing

### Save to Notes from Action Plan
- In Interview Reflections, after an action plan is generated, a **Save to Notes** button saves it as a note with source `"action-plan"` and title `"{Company} — {Role} Action Plan"`

### Storage
- Key: `jsa_notes`
- Schema: `{ id, title, content, source: "manual" | "action-plan", createdAt }`

---

## Shared
- All API calls go through `src/lib/claude.ts` — no direct fetch in components
- All localStorage access goes through `src/lib/storage.ts` — typed helpers with try/catch and type guards
- `AsyncState<T>` discriminated union: `idle | loading | success | error` used for all async UI states
- Loading spinners during API calls; inline error messages on failure
- Desktop-first layout, max-width containers

---

## File Structure
```
src/
  App.tsx
  types.ts
  vite-env.d.ts
  components/
    Navbar.tsx
    LandingPage.tsx
    RecruiterPrep.tsx
    ResumeModal.tsx
    ExperienceModal.tsx
    Reflections.tsx
    Notes.tsx
  lib/
    storage.ts
    claude.ts
    pdf.ts
```

---

## How to Run
```
npm install
# add VITE_ANTHROPIC_API_KEY=sk-ant-... to .env
npm run dev
```
