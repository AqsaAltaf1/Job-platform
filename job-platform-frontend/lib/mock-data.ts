// Mock data for development without database
import type { User, Company, Job, Application, CandidateProfile, EmployerProfile, JobWithCompany } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@jobplatform.com",
    password_hash: "hashed_password",
    role: "admin",
    first_name: "Admin",
    last_name: "User",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "employer@techcorp.com",
    password_hash: "hashed_password",
    role: "employer",
    first_name: "Sarah",
    last_name: "Johnson",
    phone: "+1-555-0123",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-15"),
  },
  {
    id: "3",
    email: "john.doe@email.com",
    password_hash: "hashed_password",
    role: "candidate",
    first_name: "John",
    last_name: "Doe",
    phone: "+1-555-0456",
    created_at: new Date("2024-02-01"),
    updated_at: new Date("2024-02-01"),
  },
]

export const mockCompanies: Company[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    description: "Leading technology solutions provider specializing in cloud infrastructure and AI.",
    website: "https://techcorp.com",
    logo_url: "/abstract-tech-logo.png",
    industry: "Technology",
    size: "100-500",
    location: "San Francisco, CA",
    created_at: new Date("2024-01-10"),
    updated_at: new Date("2024-01-10"),
  },
  {
    id: "2",
    name: "Creative Studios",
    description: "Award-winning design and marketing agency.",
    website: "https://creativestudios.com",
    logo_url: "/creative-agency-logo.png",
    industry: "Marketing & Advertising",
    size: "50-100",
    location: "New York, NY",
    created_at: new Date("2024-01-20"),
    updated_at: new Date("2024-01-20"),
  },
]

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    description:
      "We are looking for an experienced Frontend Developer to join our growing team. You will be responsible for building modern, responsive web applications using React and TypeScript.",
    requirements:
      "Requirements:\n• 5+ years of experience with React\n• Strong TypeScript skills\n• Experience with modern CSS frameworks\n• Knowledge of testing frameworks\n• Excellent communication skills",
    salary_min: 90000,
    salary_max: 130000,
    location: "San Francisco, CA (Remote OK)",
    job_type: "full-time",
    experience_level: "senior",
    company_id: "1",
    posted_by: "2",
    status: "published",
    created_at: new Date("2024-03-01"),
    updated_at: new Date("2024-03-01"),
    expires_at: new Date("2024-04-01"),
  },
  {
    id: "2",
    title: "UX/UI Designer",
    description:
      "Join our creative team as a UX/UI Designer. You will work on exciting projects for various clients, creating user-centered designs that drive engagement and conversion.",
    requirements:
      "Requirements:\n• 3+ years of UX/UI design experience\n• Proficiency in Figma and Adobe Creative Suite\n• Strong portfolio showcasing web and mobile designs\n• Understanding of user research methodologies\n• Collaborative mindset",
    salary_min: 70000,
    salary_max: 95000,
    location: "New York, NY",
    job_type: "full-time",
    experience_level: "mid",
    company_id: "2",
    posted_by: "2",
    status: "published",
    created_at: new Date("2024-03-05"),
    updated_at: new Date("2024-03-05"),
    expires_at: new Date("2024-04-05"),
  },
  {
    id: "3",
    title: "Junior Full Stack Developer",
    description:
      "Great opportunity for a junior developer to grow their skills in a supportive environment. You will work on both frontend and backend development using modern technologies.",
    requirements:
      "Requirements:\n• 1-2 years of web development experience\n• Knowledge of JavaScript, HTML, CSS\n• Basic understanding of Node.js\n• Eagerness to learn and grow\n• Good problem-solving skills",
    salary_min: 55000,
    salary_max: 70000,
    location: "Remote",
    job_type: "full-time",
    experience_level: "entry",
    company_id: "1",
    posted_by: "2",
    status: "published",
    created_at: new Date("2024-03-10"),
    updated_at: new Date("2024-03-10"),
    expires_at: new Date("2024-04-10"),
  },
]

export const mockCandidateProfiles: CandidateProfile[] = [
  {
    id: "1",
    user_id: "3",
    bio: "Passionate full-stack developer with 3 years of experience building modern web applications. Love working with React, Node.js, and cloud technologies.",
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "AWS", "MongoDB"],
    experience_years: 3,
    education: "Bachelor of Computer Science - University of California",
    resume_url: "/resumes/john-doe-resume.pdf",
    portfolio_url: "https://johndoe.dev",
    linkedin_url: "https://linkedin.com/in/johndoe",
    github_url: "https://github.com/johndoe",
    location: "Los Angeles, CA",
    salary_expectation: 85000,
    availability: "2-weeks",
    created_at: new Date("2024-02-01"),
    updated_at: new Date("2024-03-01"),
  },
]

export const mockEmployerProfiles: EmployerProfile[] = [
  {
    id: "1",
    user_id: "2",
    company_id: "1",
    position: "Head of Engineering",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-15"),
  },
]

export const mockApplications: Application[] = [
  {
    id: "1",
    job_id: "1",
    candidate_id: "3",
    status: "pending",
    cover_letter:
      "I am very interested in this position and believe my skills in React and TypeScript make me a great fit for your team.",
    resume_url: "/resumes/john-doe-resume.pdf",
    applied_at: new Date("2024-03-02"),
    updated_at: new Date("2024-03-02"),
  },
]

// Helper functions to get related data
export const getJobsWithCompany = (): JobWithCompany[] => {
  return mockJobs.map((job) => ({
    ...job,
    company: mockCompanies.find((c) => c.id === job.company_id)!,
  }))
}

export const getJobById = (id: string): JobWithCompany | undefined => {
  const job = mockJobs.find((j) => j.id === id)
  if (!job) return undefined

  return {
    ...job,
    company: mockCompanies.find((c) => c.id === job.company_id)!,
  }
}

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((u) => u.id === id)
}

export const getCompanyById = (id: string): Company | undefined => {
  return mockCompanies.find((c) => c.id === id)
}
