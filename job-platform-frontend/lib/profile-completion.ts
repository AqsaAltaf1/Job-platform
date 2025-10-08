import { User } from './types'

export interface ProfileCompletionStatus {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
}

export const checkCandidateProfileCompletion = (user: User | null): ProfileCompletionStatus => {
  if (!user) {
    return {
      isComplete: false,
      missingFields: ['User not logged in'],
      completionPercentage: 0
    }
  }

  const missingFields: string[] = []
  
  // Check basic profile fields
  if (!user.first_name) missingFields.push('First Name')
  if (!user.last_name) missingFields.push('Last Name')
  if (!user.email) missingFields.push('Email')
  if (!user.phone) missingFields.push('Phone')
  
  // Check candidate profile fields
  const candidateProfile = user.candidateProfile
  if (!candidateProfile) {
    missingFields.push('Candidate Profile')
    return {
      isComplete: false,
      missingFields,
      completionPercentage: Math.round((4 - missingFields.length) / 4 * 100)
    }
  }
  
  if (!candidateProfile.bio) missingFields.push('Bio')
  if (!candidateProfile.location) missingFields.push('Location')
  if (!candidateProfile.availability) missingFields.push('Availability')
  if (!candidateProfile.expected_salary) missingFields.push('Expected Salary')
  if (!candidateProfile.experience_level) missingFields.push('Experience Level')
  
  // Check if they have at least one skill
  if (!candidateProfile.coreSkills || candidateProfile.coreSkills.length === 0) {
    missingFields.push('Skills')
  }
  
  // Check if they have at least one experience
  if (!candidateProfile.experiences || candidateProfile.experiences.length === 0) {
    missingFields.push('Work Experience')
  }
  
  // Check if they have at least one education
  if (!candidateProfile.educations || candidateProfile.educations.length === 0) {
    missingFields.push('Education')
  }

  const totalFields = 10 // Total number of required fields
  const completedFields = totalFields - missingFields.length
  const completionPercentage = Math.round((completedFields / totalFields) * 100)

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage
  }
}

export const checkEmployerProfileCompletion = (user: User | null): ProfileCompletionStatus => {
  if (!user) {
    return {
      isComplete: false,
      missingFields: ['User not logged in'],
      completionPercentage: 0
    }
  }

  const missingFields: string[] = []
  
  // Check basic profile fields (phone is optional for employers)
  if (!user.first_name) missingFields.push('First Name')
  if (!user.last_name) missingFields.push('Last Name')
  if (!user.email) missingFields.push('Email')
  // Phone is optional for employers - removed from required fields
  
  // Check employer profile fields
  const employerProfile = user.employerProfile
  if (!employerProfile) {
    missingFields.push('Employer Profile')
    return {
      isComplete: false,
      missingFields,
      completionPercentage: Math.round((4 - missingFields.length) / 4 * 100)
    }
  }

  // Debug logging to help identify issues
  console.log('Checking employer profile completion:', {
    user_id: user.id,
    employerProfile: employerProfile,
    company_name: employerProfile.company_name,
    company_size: employerProfile.company_size,
    company_industry: employerProfile.company_industry,
    company_description: employerProfile.company_description,
    company_website: employerProfile.company_website,
    company_location: employerProfile.company_location
  })
  
  if (!employerProfile.company_name) missingFields.push('Company Name')
  if (!employerProfile.company_size) missingFields.push('Company Size')
  if (!employerProfile.company_industry) missingFields.push('Industry')
  if (!employerProfile.company_description) missingFields.push('Company Description')
  if (!employerProfile.company_website) missingFields.push('Company Website')
  if (!employerProfile.company_location) missingFields.push('Company Location')

  const totalFields = 9 // Total number of required fields (phone removed for employers)
  const completedFields = totalFields - missingFields.length
  const completionPercentage = Math.round((completedFields / totalFields) * 100)

  const result = {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage
  }

  console.log('Employer profile completion result:', result)
  return result
}

export const getProfileCompletionMessage = (status: ProfileCompletionStatus, userRole: string): string => {
  if (status.isComplete) {
    return 'Your profile is complete!'
  }
  
  const roleText = userRole === 'candidate' ? 'candidate' : 'employer'
  return `Complete your ${roleText} profile to access all features. Missing: ${status.missingFields.join(', ')}`
}
