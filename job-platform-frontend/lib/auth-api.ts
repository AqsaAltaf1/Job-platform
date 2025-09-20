// Authentication API client for connecting to the Node.js backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  role: "super_admin" | "employer" | "candidate"
  first_name: string
  last_name: string
  phone?: string
  otp?: string
}

export interface AuthResponse {
  success: boolean
  user?: any
  token?: string
  error?: string
  requiresOtp?: boolean
  expiresAt?: string
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
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
          errorMessage += ' (Unauthorized - Invalid credentials)'
          break
        case 403:
          errorMessage += ' (Forbidden - Access denied)'
          break
        case 404:
          errorMessage += ' (Not Found - Resource not found)'
          break
        case 409:
          errorMessage += ' (Conflict - User already exists)'
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

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// Authentication API functions
export const authAPI = {
  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed"
      }
    }
  },

  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed"
      }
    }
  },

  // Get current user profile
  getProfile: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await apiRequest<AuthResponse>("/auth/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get profile"
      }
    }
  },
}

// Token management utilities
export const tokenManager = {
  // Store token in localStorage
  setToken: (token: string) => {
    localStorage.setItem("jwt_token", token)
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem("jwt_token")
  },

  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem("jwt_token")
  },

  // Check if token exists
  hasToken: (): boolean => {
    return !!localStorage.getItem("jwt_token")
  },
}
