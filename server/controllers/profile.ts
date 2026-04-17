import * as profileService from "../services/profile.js"
import type { Profile } from "../services/profile.js"

export function getProfile(): Profile {
  return profileService.getProfile()
}

export function updateResume(resume: string): void {
  profileService.updateResume(resume)
}

export function updateExperience(experience: string): void {
  profileService.updateExperience(experience)
}

export function updateProfile(fields: Pick<Profile, "email" | "linkedin" | "github" | "website">): void {
  profileService.updateProfile(fields)
}
