# Job Search Assistant — Spec

## Overview
A single-page web app (React + TypeScript + Tailwind) that acts as a personal AI-powered job search coach. Node.js/Express backend with SQLite persistence. Clean, minimal UI.

---

## Tech Stack

### Frontend
- React + TypeScript (Vite scaffold)
- Tailwind CSS + `@tailwindcss/typography` (for prose markdown rendering)
- `react-markdown` for rendering Claude output
- All data fetched from the backend REST API — no localStorage

### Backend
- Node.js + Express
- SQLite via `better-sqlite3`
- Anthropic SDK (`@anthropic-ai/sdk`) — API key lives server-side only, never exposed to the client
- `cheerio` for HTML parsing of fetched job posting pages
- TypeScript via `tsx` (dev) and compiled output (prod)
- `cors`, `dotenv`

### API
- Model: `claude-sonnet-4-20250514`
- Max tokens: 4096
- All Claude calls made from the server — no `anthropic-dangerous-direct-browser-access` header

---

## Project Structure
```
/
  package.json           (frontend)
  vite.config.ts
  src/                   (frontend source)
  server/
    package.json
    tsconfig.json
    .env                 (ANTHROPIC_API_KEY here — never in frontend)
    index.ts             (Express entry point, listens on :3001)
    db.ts                (SQLite setup and schema)
    lib/
      anthropic.ts       (single Anthropic client instance, imported by services)
    services/
      extraction.ts      (fetch URL → parse HTML with cheerio → call Claude → returns structured JSON; no DB, no imports from other services)
      claude.ts          (generatePrepGuide, generateActionPlan, extractJobInsights — all Claude calls; no DB, no imports from other services)
      applications.ts    (DB CRUD for applications only; no imports from other services)
      preps.ts           (DB CRUD for prep guides; no imports from other services)
      reflections.ts     (DB CRUD for reflections; no imports from other services)
      notes.ts           (DB CRUD for notes; no imports from other services)
      profile.ts         (DB read/write for resume, experience, user profile; no imports from other services)
    controllers/
      applications.ts    (orchestrate extract flow: call extraction service + applications service; no HTTP, no DB)
      preps.ts           (orchestrate prep guide generation: call claude service + preps service; no HTTP, no DB)
      reflections.ts     (orchestrate action plan generation: call claude service + reflections service; no HTTP, no DB)
      notes.ts           (orchestrate note operations: call notes service; no HTTP, no DB)
      profile.ts         (orchestrate profile operations: call profile service; no HTTP, no DB)
    routes/
      applications.ts    (HTTP only: parse req, validate inputs, call applications controller, send res)
      preps.ts           (HTTP only: parse req, validate inputs, call preps controller, send res)
      reflections.ts     (HTTP only: parse req, validate inputs, call reflections controller, send res)
      notes.ts           (HTTP only: parse req, validate inputs, call notes controller, send res)
      profile.ts         (HTTP only: parse req, validate inputs, call profile controller, send res)
```

---

## App Structure

### Navigation (Navbar)
- Clickable app title ("Job Search Assistant") — navigates home
- Four tabs: **Applications**, **Recruiter Prep**, **Interview Reflections**, **Notes**
- Top-right buttons: **My Experience** (opens modal), **My Resume** (opens modal)

### Landing Page
- Shown when no tab is active (home view)
- 4-column grid of feature cards (Applications, Recruiter Prep, Interview Reflections, Notes)
- Each card is clickable and navigates to that feature

### My Resume Modal
- Textarea to paste/edit resume text
- Saved via `PUT /api/profile/resume`
- Accessible from any view via navbar button

### My Experience Modal
- Textarea to add additional context about projects and work history not captured in the resume
- Saved via `PUT /api/profile/experience`
- Used alongside resume in prep guide generation

---

## Backend API

### Profile
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/profile` | Get full profile (resume, experience, user info) |
| PUT | `/api/profile/resume` | Update resume text |
| PUT | `/api/profile/experience` | Update experience text |
| PUT | `/api/profile` | Update user profile fields (email, linkedin, etc.) |

### Preps
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/preps` | List all saved prep guides |
| POST | `/api/preps` | Save a new prep guide |
| DELETE | `/api/preps/:id` | Delete a prep guide |

### Reflections
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reflections` | List all reflections |
| POST | `/api/reflections` | Create a new reflection |
| PUT | `/api/reflections/:id` | Update a reflection (e.g. save action plan) |
| DELETE | `/api/reflections/:id` | Delete a reflection |

### Notes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notes` | List all notes |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

### Applications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/applications` | List all applications |
| POST | `/api/applications` | Save a new application |
| DELETE | `/api/applications/:id` | Delete an application |
| POST | `/api/applications/extract` | Fetch URL server-side, call Claude, return structured JSON |

### Claude Proxy
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/claude/prep-guide` | Generate a recruiter/interview prep guide |
| POST | `/api/claude/action-plan` | Generate an action plan from a reflection |

---

## Feature 1: Application Tracker

### UI
- **+ Add Application** button opens an inline form with:
  - Job Posting URL (text field)
  - Job Description (large textarea) — optional if URL is provided; required otherwise
  - Application Date (date picker, defaults to today)
- **Extract Info** button — posts to `/api/applications/extract` with the URL and/or pasted JD text
- After extraction, displays a review card showing the extracted data before saving:
  - Company Name
  - Role Name
  - Team (if mentioned in JD, otherwise blank)
  - Key Points (3–5 bullet highlights from the JD)
  - Requirements (skills, tools, languages, and domain knowledge listed in the JD)
  - Application Date
- User can edit any extracted field before confirming
- **Save Application** button posts to `POST /api/applications`
- Applications listed as cards, newest first
- Card header: company · role | team (if present) | application date | delete (✕) | expand toggle
- Expanded card shows Key Points and Requirements sections

### Backend Behavior (`POST /api/applications/extract`)
- **Route** (`server/routes/applications.ts`): validates inputs, calls applications controller, sends response
- **Controller** (`server/controllers/applications.ts`) orchestrates the extract flow:
  1. Calls **extraction service** (`server/services/extraction.ts`) → fetch URL if provided, parse HTML, call Claude → returns `{ company, role, team, keyPoints, requirements }`
  2. Returns extracted data to the route (not saved yet — client reviews first)
- On `POST /api/applications` (save), controller calls **applications service** (`server/services/applications.ts`) to persist the confirmed entry
- Services have no knowledge of each other: extraction handles fetch→parse→Claude, applications handles DB ops only
- **Claude service** (`server/services/claude.ts` → `extractJobInsights`) returns structured JSON:
  1. Company name and role name
  2. Team name (if explicitly mentioned)
  3. 3–5 key points describing the role
  4. Deduplicated list of requirements (skills, tools, languages, domain knowledge, notable soft skills)
- Returns structured JSON: `{ company, role, team, keyPoints: string[], requirements: string[] }`
- Application Date is not extracted — defaults to today, set by the user

### Storage
- Table: `applications`
- Schema: `{ id, url, company, role, team, keyPoints (JSON), requirements (JSON), applicationDate, createdAt }`

---

## Feature 2: Recruiter Prep

### UI
- Form fields: Company Name, Role Title, Job Description (large textarea)
- Resume field with "Use saved resume" checkbox — if checked, fetches from backend; otherwise shows textarea
- Experience field with "Use saved experience" checkbox — if checked, fetches from backend; otherwise shows textarea
- **Generate Prep Guide** button
- Output area: renders Claude's markdown response
- **Download PDF** button (appears after output is generated) — opens browser print dialog styled as a clean PDF
- **Saved Preps** dropdown — reload any previously generated guide

### Behavior
- On submit, posts to `POST /api/claude/prep-guide` with form data
- Backend calls Claude with a structured system prompt generating:
  1. Quick Company Snapshot
  2. Why This Role Is a Fit (based on resume + experience vs JD)
  3. Top 5 Questions to Ask the Recruiter
  4. Likely Screener Questions — each with: why the recruiter asks it, a 3–5 sentence suggested answer, and a specific example from the candidate's background
  5. Red Flags / Things to Clarify
  6. One-line "Why [Company]?" Answer
- Frontend auto-saves the returned guide via `POST /api/preps`
- PDF uses `window.open` + `window.print()` via an embedded script tag in the opened window

### Storage
- Table: `preps`
- Schema: `{ id, date, company, role, output, prepType, createdAt }`

---

## Feature 3: Interview Reflections

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
- Posts to `POST /api/claude/action-plan` with reflection details
- Plan is rendered as markdown in a styled box
- Saved back via `PUT /api/reflections/:id`
- **Regenerate** link to re-run, **Save to Notes** button to save the plan directly to the Notes feature
- Loading spinner and inline error state handled

### Storage
- Table: `reflections`
- Schema: `{ id, company, role, date, interviewType, questionsAsked, wentWell, didntGoWell, outcome, additionalNotes, aiActionPlan, createdAt }`

---

## Feature 4: Notes

### UI
- **+ New Note** button opens an inline form (title + content textarea)
- Notes listed as expandable cards, newest first
- Card header: title | source badge (Manual / Action Plan) | date | Edit button | delete (✕) | expand toggle
- Expanded card renders content as markdown

### Edit
- Clicking **Edit** opens an inline edit form within the card (title + content textarea)
- Saves updated note via `PUT /api/notes/:id`; hides the content view while editing

### Save to Notes from Action Plan
- In Interview Reflections, after an action plan is generated, a **Save to Notes** button posts to `POST /api/notes` with source `"action-plan"` and title `"{Company} — {Role} Action Plan"`

### Storage
- Table: `notes`
- Schema: `{ id, title, content, source ("manual" | "action-plan"), createdAt }`

---

## Shared Frontend

- `src/lib/api.ts` replaces `storage.ts` and `claude.ts` — all network calls to `http://localhost:3001/api`
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
    Applications.tsx
    RecruiterPrep.tsx
    ResumeModal.tsx
    ExperienceModal.tsx
    Reflections.tsx
    Notes.tsx
  lib/
    api.ts       (replaces storage.ts + claude.ts)
    pdf.ts

server/
  package.json
  tsconfig.json
  .env
  index.ts
  db.ts
  lib/
    anthropic.ts
  services/
    extraction.ts
    claude.ts
    applications.ts
    preps.ts
    reflections.ts
    notes.ts
    profile.ts
  controllers/
    applications.ts
    preps.ts
    reflections.ts
    notes.ts
    profile.ts
  routes/
    applications.ts
    preps.ts
    reflections.ts
    notes.ts
    profile.ts
```

---

## How to Run
```bash
# Install frontend deps
npm install

# Install backend deps
cd server && npm install

# Add ANTHROPIC_API_KEY=sk-ant-... to server/.env

# Run backend (from server/)
npm run dev

# Run frontend (from root)
npm run dev
```
