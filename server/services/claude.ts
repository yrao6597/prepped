import { anthropic } from "../lib/anthropic.js"
import type { Reflection } from "./reflections.js"
import { SYSTEM_PROMPT as RECRUITER_CALL_PROMPT } from "../prompts/recruiter-call.js"
import { SYSTEM_PROMPT as TECHNICAL_PROMPT } from "../prompts/technical.js"
import { SYSTEM_PROMPT as BEHAVIORAL_PROMPT } from "../prompts/behavioral.js"
import { SYSTEM_PROMPT as COMPANY_RESEARCH_PROMPT } from "../prompts/company-research.js"

const MODEL = "claude-sonnet-4-20250514"
const MAX_TOKENS = 4096
const THINKING_BUDGET = 8000

const PREP_GUIDE_PROMPTS: Record<string, string> = {
  "recruiter-call": RECRUITER_CALL_PROMPT,
  "technical": TECHNICAL_PROMPT,
  "behavioral": BEHAVIORAL_PROMPT,
}

export interface PrepGuideInput {
  companyName: string
  roleTitle: string
  jobDescription: string
  resume: string
  experience: string
  additionalInfo: string
  prepType: "recruiter-call" | "technical" | "behavioral"
}

// Phase 1: focused company research that feeds into prep guide generation.
// Starter implementation uses Claude's training knowledge.
// To upgrade: replace this call with a web search tool loop (Brave Search API or Anthropic built-in web_search_20250305).
async function researchCompany(companyName: string, roleTitle: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: COMPANY_RESEARCH_PROMPT,
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
    system: PREP_GUIDE_PROMPTS[input.prepType] ?? RECRUITER_CALL_PROMPT,
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
