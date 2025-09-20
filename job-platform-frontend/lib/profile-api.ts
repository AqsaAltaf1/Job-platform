import { tokenManager } from './auth-api'
import type { EmployerProfile, CandidateProfile } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Helper function to make authenticated requests
async function authenticatedRequest(url: string, options: RequestInit = {}) {
  const token = tokenManager.getToken()
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const statusText = response.statusText || 'Unknown Error'
    const statusCode = response.status
    
    // Create detailed error message
    let errorMessage = `HTTP ${statusCode}: ${statusText}`
    
    if (errorData.error) {
      errorMessage += ` - ${errorData.error}`
    }
    
    if (errorData.message) {
      errorMessage += ` - ${errorData.message}`
    }
    
    // Add specific error details for common status codes
    switch (statusCode) {
      case 400:
        errorMessage += ' (Bad Request - Check your input data)'
        break
      case 401:
        errorMessage += ' (Unauthorized - Please login again)'
        break
      case 403:
        errorMessage += ' (Forbidden - You do not have permission or file is too large)'
        break
      case 404:
        errorMessage += ' (Not Found - Resource not found)'
        break
      case 413:
        errorMessage += ' (Payload Too Large - File size exceeds limit)'
        break
      case 422:
        errorMessage += ' (Unprocessable Entity - Invalid data format)'
        break
      case 500:
        errorMessage += ' (Internal Server Error - Server issue)'
        break
    }
    
    throw new Error(errorMessage)
  }

  return response.json()
}

export const profileAPI = {
  // Get current user's profile
  async getProfile(): Promise<{ success: boolean; user: any }> {
    return authenticatedRequest(`${API_BASE_URL}/api/auth/profile`)
  },

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<{ success: boolean; user: any }> {
    return authenticatedRequest(`${API_BASE_URL}/api/profiles/${userId}`)
  },

  // Update current user's profile
  async updateProfile(profileData: Partial<EmployerProfile | CandidateProfile>): Promise<{ success: boolean; profile: EmployerProfile | CandidateProfile; message: string }> {
    return authenticatedRequest(`${API_BASE_URL}/api/profiles`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  // Get all user profiles (admin only)
  async getAllProfiles(): Promise<{ success: boolean; users: any[] }> {
    return authenticatedRequest(`${API_BASE_URL}/api/profiles`)
  },
}

export default profileAPI
