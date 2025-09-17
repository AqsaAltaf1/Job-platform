// Job management utilities and API functions
import type { Job, JobWithCompany, Company } from "./types"
import { api } from "./api"

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

// Job management functions (now using real API)
export const jobsApi = {
  // Get all jobs with optional filtering
  getJobs: async (filters?: {
    status?: string
    company_id?: string
    posted_by?: string
  }): Promise<JobWithCompany[]> => {
    try {
      const jobs = await api.jobs.getJobs() as JobWithCompany[]
      
      let filteredJobs = jobs

      if (filters?.status) {
        filteredJobs = filteredJobs.filter((job) => job.status === filters.status)
      }

      if (filters?.company_id) {
        filteredJobs = filteredJobs.filter((job) => job.company_id === filters.company_id)
      }

      if (filters?.posted_by) {
        filteredJobs = filteredJobs.filter((job) => job.posted_by === filters.posted_by)
      }

      return filteredJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      return []
    }
  },

  // Get single job by ID
  getJob: async (id: string): Promise<JobWithCompany | null> => {
    try {
      return await api.jobs.getJob(id) as JobWithCompany
    } catch (error) {
      console.error('Failed to fetch job:', error)
      return null
    }
  },

  // Create new job (placeholder - backend doesn't have this endpoint yet)
  createJob: async (
    data: CreateJobData,
    postedBy: string,
  ): Promise<{ success: boolean; job?: JobWithCompany; error?: string }> => {
    return { success: false, error: "Create job endpoint not implemented yet" }
  },

  // Update existing job (placeholder - backend doesn't have this endpoint yet)
  updateJob: async (
    id: string,
    data: UpdateJobData,
  ): Promise<{ success: boolean; job?: JobWithCompany; error?: string }> => {
    return { success: false, error: "Update job endpoint not implemented yet" }
  },

  // Delete job (placeholder - backend doesn't have this endpoint yet)
  deleteJob: async (id: string): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: "Delete job endpoint not implemented yet" }
  },

  // Get companies (now using real API)
  getCompanies: async (): Promise<Company[]> => {
    try {
      return await api.companies.getCompanies() as Company[]
    } catch (error) {
      console.error('Failed to fetch companies:', error)
      return []
    }
  },
}
