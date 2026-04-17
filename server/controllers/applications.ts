import * as applicationsService from "../services/applications.js"
import type { Application } from "../services/applications.js"

export function getApplications(): Application[] {
  return applicationsService.getApplications()
}

export function createApplication(application: Application): void {
  applicationsService.createApplication(application)
}

export function deleteApplication(id: string): void {
  applicationsService.deleteApplication(id)
}
