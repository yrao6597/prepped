import type { PrepGuideInput } from "../types"

const API_URL = "https://api.anthropic.com/v1/messages"
const MODEL = "claude-sonnet-4-20250514"

const PREP_GUIDE_SYSTEM_PROMPT = `You are a job search coach helping a software engineer prepare for a recruiter screening call.
The user will give you: company name, job title, job description, and optionally their background/resume.
The user may provide a resume AND a separate "My Experience" section with richer detail on specific projects and work. If both are provided, use the experience notes as the primary source of specific talking points and examples — treat the resume as supporting context.
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

class ClaudeApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = "ClaudeApiError"
  }
}

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new ClaudeApiError(0, "VITE_ANTHROPIC_API_KEY is not set. Add it to your .env file.")
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new ClaudeApiError(response.status, `API error ${response.status}: ${body}`)
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>
  }

  const textBlock = data.content.find((block) => block.type === "text")
  if (!textBlock) {
    throw new ClaudeApiError(0, "No text content in Claude response")
  }

  return textBlock.text
}

export async function generatePrepGuide(input: PrepGuideInput): Promise<string> {
  const experienceSection = input.experience.trim()
    ? `\nMy Experience / Projects:\n${input.experience}`
    : ""

  const userMessage = `Company: ${input.companyName}
Role: ${input.roleTitle}
JD: ${input.jobDescription}
My Background: ${input.resume}${experienceSection}`

  return callClaude(PREP_GUIDE_SYSTEM_PROMPT, userMessage)
}
