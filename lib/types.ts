// Database schema types for the job platform

export interface User {
  id: string
  email: string
  password_hash: string
  role: "admin" | "employer" | "candidate"
  first_name: string
  last_name: string
  phone?: string
  created_at: Date
  updated_at: Date
}

export interface Company {
  id: string
  name: string
  description?: string
  website?: string
  logo_url?: string
  industry?: string
  size?: string
  location?: string
  created_at: Date
  updated_at: Date
}

export interface Job {
  id: string
  title: string
  description: string
  requirements: string
  salary_min?: number
  salary_max?: number
  location: string
  job_type: "full-time" | "part-time" | "contract" | "internship"
  experience_level: "entry" | "mid" | "senior" | "executive"
  company_id: string
  posted_by: string // user_id
  status: "draft" | "published" | "closed"
  created_at: Date
  updated_at: Date
  expires_at?: Date
}

export interface Application {
  id: string
  job_id: string
  candidate_id: string
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired"
  cover_letter?: string
  resume_url?: string
  applied_at: Date
  updated_at: Date
}

export interface CandidateProfile {
  id: string
  user_id: string
  bio?: string
  skills: string[]
  experience_years?: number
  education?: string
  resume_url?: string
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  location?: string
  salary_expectation?: number
  availability: "immediate" | "2-weeks" | "1-month" | "not-available"
  created_at: Date
  updated_at: Date
}

export interface EmployerProfile {
  id: string
  user_id: string
  company_id: string
  position?: string
  created_at: Date
  updated_at: Date
}

// Extended types with relations
export interface JobWithCompany extends Job {
  company: Company
}

export interface ApplicationWithDetails extends Application {
  job: JobWithCompany
  candidate: User & { profile: CandidateProfile }
}

export interface UserWithProfile extends User {
  candidateProfile?: CandidateProfile
  employerProfile?: EmployerProfile & { company: Company }
}
