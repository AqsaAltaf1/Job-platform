// Job management utilities and API functions
import type { Job, JobWithCompany, Company } from "./types"
import { mockJobs, mockCompanies, getJobsWithCompany, getJobById } from "./mock-data"

export interface CreateJobData {
  title: string
  description: string
  requirements: string
  salary_min?: number
  salary_max?: number
  location: string
  job_type: "full-time" | "part-time" | "contract" | "internship"
  experience_level: "entry" | "mid" | "senior" | "executive"
  company_id: string
  expires_at?: Date
}

export interface UpdateJobData extends Partial<CreateJobData> {
  status?: "draft" | "published" | "closed"
}

// Job management functions (mock implementation)
export const jobsApi = {
  // Get all jobs with optional filtering
  getJobs: async (filters?: {
    status?: string
    company_id?: string
    posted_by?: string
  }): Promise<JobWithCompany[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay

    let jobs = getJobsWithCompany()

    if (filters?.status) {
      jobs = jobs.filter((job) => job.status === filters.status)
    }

    if (filters?.company_id) {
      jobs = jobs.filter((job) => job.company_id === filters.company_id)
    }

    if (filters?.posted_by) {
      jobs = jobs.filter((job) => job.posted_by === filters.posted_by)
    }

    return jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  // Get single job by ID
  getJob: async (id: string): Promise<JobWithCompany | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return getJobById(id) || null
  },

  // Create new job
  createJob: async (
    data: CreateJobData,
    postedBy: string,
  ): Promise<{ success: boolean; job?: JobWithCompany; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    try {
      const newJob: Job = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        posted_by: postedBy,
        status: "draft",
        created_at: new Date(),
        updated_at: new Date(),
      }

      // Add to mock data
      mockJobs.push(newJob)

      const jobWithCompany = getJobById(newJob.id)
      return { success: true, job: jobWithCompany! }
    } catch (error) {
      return { success: false, error: "Failed to create job" }
    }
  },

  // Update existing job
  updateJob: async (
    id: string,
    data: UpdateJobData,
  ): Promise<{ success: boolean; job?: JobWithCompany; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 600))

    try {
      const jobIndex = mockJobs.findIndex((job) => job.id === id)
      if (jobIndex === -1) {
        return { success: false, error: "Job not found" }
      }

      mockJobs[jobIndex] = {
        ...mockJobs[jobIndex],
        ...data,
        updated_at: new Date(),
      }

      const jobWithCompany = getJobById(id)
      return { success: true, job: jobWithCompany! }
    } catch (error) {
      return { success: false, error: "Failed to update job" }
    }
  },

  // Delete job
  deleteJob: async (id: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    try {
      const jobIndex = mockJobs.findIndex((job) => job.id === id)
      if (jobIndex === -1) {
        return { success: false, error: "Job not found" }
      }

      mockJobs.splice(jobIndex, 1)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to delete job" }
    }
  },

  // Get companies (for job creation form)
  getCompanies: async (): Promise<Company[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return [...mockCompanies]
  },
}
