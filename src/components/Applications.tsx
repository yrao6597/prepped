import { useState } from "react"

export default function Applications() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applications</h1>
          <p className="mt-2 text-sm text-gray-500">
            Save job postings, extract the important bits, and keep your search organized.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="shrink-0 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-gray-700"
          >
            + Add Application
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">New Application</h2>
              <p className="mt-1 text-sm text-gray-500">
                Paste a job link or description and we&apos;ll build this out next.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-sm text-gray-400 transition-colors hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Job Posting URL</label>
              <input
                type="text"
                placeholder="https://company.com/careers/role"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Job Description</label>
              <textarea
                placeholder="Optional for now. Paste the job description here if you want to save or extract from text later."
                rows={6}
                className="w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-all duration-150 hover:border-gray-400 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-gray-700"
              >
                Extract Info
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-400">
          No applications yet. Add your first one to start tracking roles.
        </p>
      </div>
    </div>
  )
}
