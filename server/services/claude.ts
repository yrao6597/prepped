import { anthropic } from "../lib/anthropic.js"
import type { Reflection } from "./reflections.js"

const MODEL = "claude-sonnet-4-20250514"
const MAX_TOKENS = 4096

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
