// Mock data for development without database
import type { User, Company, Job, Application, CandidateProfile, EmployerProfile, JobWithCompany } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@jobplatform.com",
    password_hash: "hashed_password",
    role: "super_admin",
    first_name: "Admin",
    last_name: "User",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
]

export const mockCompanies: Company[] = []

export const mockJobs: Job[] = []

export const mockApplications: Application[] = []

export const mockCandidateProfiles: CandidateProfile[] = []

export const mockEmployerProfiles: EmployerProfile[] = []

// Helper function to get jobs with company data
export function getJobsWithCompany(): JobWithCompany[] {
  return mockJobs.map(job => ({
    ...job,
    company: mockCompanies.find(company => company.id === job.company_id) || {
      id: "unknown",
      name: "Unknown Company",
      description: "",
      website: "",
      logo_url: "",
      industry: "",
      size: "",
      location: "",
      created_at: new Date(),
      updated_at: new Date(),
    }
  }))
}