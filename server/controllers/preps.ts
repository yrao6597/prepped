import * as prepsService from "../services/preps.js"
import type { PrepGuide } from "../services/preps.js"

export function getPreps(): PrepGuide[] {
  return prepsService.getPreps()
}

export function createPrep(prep: PrepGuide): void {
  prepsService.createPrep(prep)
}

export function deletePrep(id: string): void {
  prepsService.deletePrep(id)
}
