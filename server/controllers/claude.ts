import * as claudeService from "../services/claude.js"
import type { Reflection } from "../services/reflections.js"

export function generateActionPlan(reflection: Reflection): Promise<string> {
  return claudeService.generateActionPlan(reflection)
}
