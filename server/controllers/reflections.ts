import * as reflectionsService from "../services/reflections.js"
import type { Reflection } from "../services/reflections.js"

export function getReflections(): Reflection[] {
  return reflectionsService.getReflections()
}

export function createReflection(reflection: Reflection): void {
  reflectionsService.createReflection(reflection)
}

export function updateReflection(id: string, reflection: Omit<Reflection, "id" | "createdAt">): void {
  reflectionsService.updateReflection(id, reflection)
}

export function deleteReflection(id: string): void {
  reflectionsService.deleteReflection(id)
}
