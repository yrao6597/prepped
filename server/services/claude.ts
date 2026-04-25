import { anthropic } from "../lib/anthropic.js"
import type { Reflection } from "./reflections.js"

const MODEL = "claude-sonnet-4-20250514"
const MAX_TOKENS = 4096
const THINKING_BUDGET = 8000

const PREP_GUIDE_SYSTEM_PROMPT = `You are a job search coach helping a software engineer prepare for a recruiter screening call.
You will receive a Company Research Brief followed by the job details and candidate background. Use the research brief to make the company snapshot, recruiter questions, and "Why [Company]?" answer specific and grounded — not generic.
The user may provide a resume AND a separate "My Experience" section with richer detail on specific projects and work. If both are provided, use the experience notes as the primary source of specific talking points and examples — treat the resume as supporting context.
The user may also provide "Additional Info About This Round" — e.g. tips from the recruiter, what topics to expect, format details. Incorporate this directly into the relevant sections (likely screener questions, red flags, things to prepare).
Generate a structured prep guide with:
1. Quick Company Snapshot (2-3 sentences: what they do, stage, known for)
2. Why This Role Is a Fit (based on their background vs JD — be specific, reference their actual projects/experience where relevant)
3. Top 5 Questions to Ask the Recruiter (thoughtful, shows research)
4. Likely Screener Questions (3-5 questions). For each question, provide:
   - Why the recruiter is asking it
   - A strong 3-5 sentence answer tailored to the candidate's background and the JD
   - One specific example or detail to mention, drawn from their experience notes if available
5. Red Flags / Things to Clarify (anything vague or worth probing in JD)
6. 1-line "Why [Company]?" Answer (genuine, not corporate-sounding)
Be direct and practical. No fluff.`

export interface PrepGuideInput {
  companyName: string
  roleTitle: string
  jobDescription: string
  resume: string
  experience: string
  additionalInfo: string
}

const COMPANY_RESEARCH_SYSTEM_PROMPT = `You are a company research analyst. Given a company name and a role, produce a concise research brief for a software engineer preparing for an interview.
Cover:
- What the company does and who their customers are
- Business model and revenue stage (startup/growth/public, known funding or revenue if notable)
- Engineering culture signals (tech stack if known, eng blog, open source presence, known practices)
- Recent news, launches, or strategic shifts relevant to a software engineer
- Reputation as an employer (Glassdoor signals, known strengths/weaknesses)
Be factual and specific. Flag anything you are uncertain about. Skip sections where you have no useful signal rather than filling with generics.`

// Phase 1 skill: focused company research that feeds into prep guide generation.
// Starter implementation uses Claude's training knowledge.
// To upgrade: replace this call with a web search tool loop (Brave Search API or Anthropic built-in web_search_20250305).
async function researchCompany(companyName: string, roleTitle: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: COMPANY_RESEARCH_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Company: ${companyName}\nRole I'm interviewing for: ${roleTitle}`,
      },
    ],
  })

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim()
}

export async function generatePrepGuide(input: PrepGuideInput): Promise<string> {
  // Phase 1: research the company independently before generating the guide
  const companyResearch = await researchCompany(input.companyName, input.roleTitle)

  const experienceSection = input.experience.trim()
    ? `\nMy Experience / Projects:\n${input.experience}`
    : ""

  const additionalInfoSection = input.additionalInfo.trim()
    ? `\nAdditional Info About This Round:\n${input.additionalInfo}`
    : ""

  // Phase 2: generate the prep guide with research context injected
  const userMessage = `Company Research Brief:
${companyResearch}

---
Company: ${input.companyName}
Role: ${input.roleTitle}
JD: ${input.jobDescription}
My Background: ${input.resume}${experienceSection}${additionalInfoSection}`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS + THINKING_BUDGET,
    thinking: { type: "enabled", budget_tokens: THINKING_BUDGET },
    system: PREP_GUIDE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  })

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim()

  if (!text) {
    throw new Error("No text returned from Claude")
  }

  return text
}

const ACTION_PLAN_SYSTEM_PROMPT = `You are a career coach helping a software engineer improve their interviewing skills.
Given notes from a recent interview, generate a concrete, personalised action plan for their next interview prep.
Structure your response as:
1. Key Takeaways (2-3 bullet points — the most important things to internalise from this interview)
2. Specific Skills to Work On (for each: what to improve and exactly how — be concrete, not generic)
3. Questions to Prepare For (any questions from this session they should have better answers for next time — with suggested approach)
4. Before Your Next Interview (a short checklist of things to do or review)
Be direct and honest. No sugarcoating.`

export async function generateActionPlan(reflection: Reflection): Promise<string> {
  const parts = [
    `Company: ${reflection.company}`,
    `Role: ${reflection.role}`,
    `Interview Type: ${reflection.interviewType || "Not specified"}`,
    `Outcome: ${reflection.outcome}`,
    reflection.questionsAsked ? `Questions Asked:\n${reflection.questionsAsked}` : "",
    reflection.wentWell ? `What Went Well:\n${reflection.wentWell}` : "",
    reflection.didntGoWell ? `What Didn't Go Well:\n${reflection.didntGoWell}` : "",
    reflection.additionalNotes ? `Additional Notes:\n${reflection.additionalNotes}` : "",
  ].filter(Boolean)

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: ACTION_PLAN_SYSTEM_PROMPT,
    messages: [{ role: "user", content: parts.join("\n\n") }],
  })

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim()

  if (!text) {
    throw new Error("No text returned from Claude")
  }

  return text
}
