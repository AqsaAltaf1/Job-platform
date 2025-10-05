// Database schema types for the job platform

export interface User {
  id: string
  email: string
  password_hash: string
  role: "super_admin" | "employer" | "candidate"
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
  employer_profile_id: string
  posted_by: string
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  job_type: "full_time" | "part_time" | "contract" | "internship" | "temporary"
  work_arrangement: "remote" | "on_site" | "hybrid"
  experience_level: "entry_level" | "mid_level" | "senior_level" | "executive"
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  salary_period?: "hourly" | "monthly" | "yearly"
  location?: string
  department?: string
  skills_required?: string[]
  benefits?: string
  application_deadline?: Date
  status: "draft" | "active" | "paused" | "closed" | "filled"
  is_featured?: boolean
  views_count?: number
  applications_count?: number
  created_at: Date
  updated_at: Date
  // Relations
  employerProfile?: EmployerProfile
  postedBy?: User
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
  job_title?: string
  skills: string[]
  experience_years?: number
  education?: string
  resume_url?: string
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  location?: string
  salary_expectation?: number
  availability?: "immediate" | "2-weeks" | "1-month" | "not-available"
  date_of_birth?: string // YYYY-MM-DD format
  country?: string // ISO 2-letter country code
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

// Team management types
export type TeamRole = 'primary_owner' | 'hr_manager' | 'recruiter' | 'interviewer' | 'admin'

export interface TeamPermissions {
  can_post_jobs: boolean
  can_view_applications: boolean
  can_interview_candidates: boolean
  can_manage_team: boolean
  can_access_analytics: boolean
  can_manage_company_profile: boolean
}

export interface TeamMember {
  id: string
  employer_profile_id: string
  first_name: string
  last_name: string
  email: string
  role: TeamRole
  permissions: TeamPermissions
  phone?: string
  department?: string
  job_title?: string
  is_active: boolean
  invited_by?: string
  invited_at?: Date
  joined_at?: Date
  last_active_at?: Date
  created_at: Date
  updated_at: Date
}

export interface EmployerProfile {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  linkedin_url?: string
  profile_picture_url?: string
  // Employer-specific fields
  position?: string
  // Company Information
  company_name?: string
  company_legal_name?: string
  company_display_name?: string
  company_description?: string
  company_logo_url?: string
  company_website?: string
  careers_page_url?: string
  company_industry?: string
  company_sector?: string
  company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5000+'
  company_location?: string
  headquarters_location?: string
  remote_policy?: 'on-site' | 'remote' | 'hybrid' | 'flexible'
  // Team management
  is_primary_owner?: boolean
  account_role?: TeamRole
  permissions?: TeamPermissions
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Enhanced skill types
export interface SkillEvidence {
  id: string
  type: "work_sample" | "github_repo" | "portfolio_link" | "certification" | "project"
  title: string
  description?: string
  url?: string
  file_url?: string
  verified: boolean
  verified_by?: string
  verified_at?: Date
}

export interface PeerEndorsement {
  id: string
  endorser_name: string
  endorser_email: string
  endorser_position?: string
  endorser_company?: string
  relationship: "colleague" | "manager" | "client" | "peer" | "other"
  endorsement_text: string
  skill_level: "beginner" | "intermediate" | "advanced" | "expert"
  star_rating: number // 1-5 stars
  created_at: Date
  verified: boolean
}

export interface EnhancedSkill {
  id: string
  name: string
  category: string
  taxonomy_source: "ESCO" | "O*NET" | "custom"
  taxonomy_id?: string
  level: "beginner" | "intermediate" | "advanced" | "expert" // Set by candidate
  years_experience: number
  last_used?: Date
  evidence: SkillEvidence[]
  endorsements: PeerEndorsement[]
  verified_rating?: number // Calibrated rating from assessments
  skill_rating?: number // Average rating from all endorsements (1.0 to 5.0)
  created_at: Date
  updated_at: Date
}

export interface CandidateProfile {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  bio?: string
  job_title?: string
  location?: string
  website?: string
  linkedin_url?: string
  github_url?: string
  profile_picture_url?: string
  // Enhanced skills system
  core_skills?: EnhancedSkill[]
  additional_skills?: string[] // Legacy simple skills
  experience_years?: number
  education?: string
  resume_url?: string
  portfolio_url?: string
  salary_expectation?: number
  availability?: "immediate" | "2-weeks" | "1-month" | "not-available"
  date_of_birth?: string // YYYY-MM-DD format
  country?: string // ISO 2-letter country code
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Experience {
  id: string
  user_profile_id: string
  company_name: string
  role: string
  description?: string
  from_date: Date
  to_date?: Date
  is_current: boolean
  location?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Project {
  id: string
  user_profile_id: string
  title: string
  description?: string
  project_url?: string
  github_url?: string
  image_url?: string
  technologies?: string[]
  start_date?: Date
  end_date?: Date
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Education {
  id: string
  user_profile_id: string
  institution_name: string
  degree: string
  field_of_study?: string
  description?: string
  start_date: Date
  end_date?: Date
  is_current: boolean
  location?: string
  gpa?: number
  activities?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface ReviewerInvitation {
  id: string
  candidate_profile_id: string
  reviewer_email: string
  reviewer_name?: string
  skills_to_review: string[]
  invitation_token: string
  status: "pending" | "accepted" | "completed" | "expired"
  expires_at: Date
  completed_at?: Date
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface UserWithProfile extends User {
  candidateProfile?: CandidateProfile & {
    experiences?: Experience[]
    projects?: Project[]
    educations?: Education[]
    coreSkills?: EnhancedSkill[]
    reviewerInvitations?: ReviewerInvitation[]
  }
  employerProfile?: EmployerProfile
}
