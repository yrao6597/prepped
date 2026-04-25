import * as claudeService from "../services/claude.js"
import type { PrepGuideInput } from "../services/claude.js"
import type { Reflection } from "../services/reflections.js"

export function generatePrepGuide(input: PrepGuideInput): Promise<string> {
  return claudeService.generatePrepGuide(input)
}

export function generateActionPlan(reflection: Reflection): Promise<string> {
  return claudeService.generateActionPlan(reflection)
}
