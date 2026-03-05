# Job Search Assistant — Claude Code Spec

## Overview
Build a single-page web app (React + TypeScript + Tailwind) that acts as a personal job search assistant. Use localStorage for persistence. No backend needed. Keep the UI clean and minimal but fully functional.

---

## Tech Stack
- React + TypeScript
- Tailwind CSS
- localStorage for all persistence
- Anthropic SDK via direct fetch to https://api.anthropic.com/v1/messages with env var VITE_ANTHROPIC_API_KEY
- Use claude-sonnet-4-20250514 model

---

## App Structure
Two main tabs in a top nav:
1. Recruiter Prep
2. Interview Reflections

---

## Feature 1: Recruiter Prep

### UI
- Text field: Company Name
- Text field: Role Title
- Large textarea: Job Description (paste full JD)
- Textarea: My Resume / Background (pre-fill from localStorage if saved)
- Button: Generate Prep Guide
- Output area: renders markdown response from Claude

### Behavior
On submit, call Claude API with this system prompt:

  You are a job search coach helping a software engineer prepare for a recruiter screening call.
  The user will give you: company name, job title, job description, and optionally their background/resume.
  Generate a structured prep guide with:
  1. Quick Company Snapshot (2-3 sentences: what they do, stage, known for)
  2. Why This Role Is a Fit (based on their background vs JD — be specific)
  3. Top 5 Questions to Ask the Recruiter (thoughtful, shows research)
  4. Likely Screener Questions (3-5 with suggested talking points)
  5. Red Flags / Things to Clarify (anything vague or worth probing in JD)
  6. 1-line "Why [Company]?" Answer (genuine, not corporate-sounding)
  Be direct and practical. No fluff.

User message format:
  Company: {companyName}
  Role: {roleTitle}
  JD: {jobDescription}
  My Background: {resume}

- Save last-used resume to localStorage under key jsa_resume
- Save each generated prep guide to localStorage under key jsa_preps as array of { id, date, company, role, output }
- Show a Saved Preps dropdown to reload past ones

---

## Feature 2: Interview Reflections

### UI
- Text field: Company
- Text field: Role
- Select: Type — options: Recruiter Call, Technical Screen, System Design, Behavioural, Take-Home, Final Round
- Date picker (default today)
- Large textarea: What happened / brain dump (freeform notes)
- Toggle: AI Reflection — if ON, after saving, call Claude to generate structured reflection
- Button: Save Reflection
- Below: scrollable list of past reflections, newest first, expandable

### Behavior
Save each reflection to localStorage under key jsa_reflections as array of { id, date, company, role, type, notes, aiReflection }.

If AI Reflection toggle is ON, call Claude with this system prompt:

  You are a career coach helping a software engineer reflect on a job interview or recruiter call.
  Given their raw notes, generate a structured reflection:
  1. What went well
  2. What could have been stronger
  3. Key things to remember / follow up on
  4. Patterns to watch (if you can infer any from the notes)
  5. One thing to do before the next round
  Be honest and constructive. No sugarcoating.

User message format:
  Company: {company}
  Round Type: {type}
  My Notes: {notes}

- Store AI reflection alongside the entry in localStorage
- Render reflections as expandable cards: show company + type + date in header, expand to see notes + AI reflection

---

## Shared / Global
- Top-right: My Resume button — modal with textarea to save/update resume (persisted to localStorage as jsa_resume)
- Simple nav with two tabs
- Loading spinners during API calls
- Error handling: show inline error message if API call fails
- Responsive but desktop-first is fine

---

## File Structure
src/
  App.tsx
  components/
    RecruiterPrep.tsx
    Reflections.tsx
    ResumeModal.tsx
    Navbar.tsx
  lib/
    storage.ts
    claude.ts
  types.ts

---

## How to Run
claude "Read SPEC.md and build the full app. Scaffold from scratch using Vite + React + TypeScript + Tailwind. Follow the spec exactly. Use VITE_ANTHROPIC_API_KEY env var for the Claude API key."