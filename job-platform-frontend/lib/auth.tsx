// Authentication utilities and context
"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, UserWithProfile } from "./types"
import { authAPI, tokenManager, RegisterData } from "./auth-api"

interface AuthContextType {
  user: UserWithProfile | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  showProfileModal: boolean
  setShowProfileModal: (show: boolean) => void
  refreshUser: () => Promise<void>
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    // Check for stored JWT token on mount
    const token = tokenManager.getToken()
    if (token) {
      // Verify token by getting user profile
      authAPI.getProfile(token).then((response) => {
        if (response.success && response.user) {
          setUser(response.user as UserWithProfile)
        } else {
          // Token is invalid, remove it
          tokenManager.removeToken()
        }
        setLoading(false)
      }).catch(() => {
        tokenManager.removeToken()
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])


  const login = async (email: string, password: string) => {
    setLoading(true)

    try {
      const response = await authAPI.login({ email, password })
      
      if (response.success && response.user && response.token) {
        // Store token and user data
        tokenManager.setToken(response.token)
        setUser(response.user as UserWithProfile)
        setLoading(false)
        
        // Don't automatically show profile modal on login - let user decide when to edit
        
        return { success: true, user: response.user as UserWithProfile }
      } else {
        setLoading(false)
        return { success: false, error: response.error || "Login failed" }
      }
    } catch (error) {
      setLoading(false)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Login failed" 
      }
    }
  }

  const register = async (userData: RegisterData) => {
    setLoading(true)

    try {
      const response = await authAPI.register(userData)
      
      if (response.success) {
        if (response.requiresOtp) {
          // OTP sent, return success with OTP flag
          setLoading(false)
          return { 
            success: true, 
            requiresOtp: true,
            expiresAt: response.expiresAt
          }
        } else if (response.user && response.token) {
          // Registration completed successfully
          tokenManager.setToken(response.token)
          setUser(response.user as UserWithProfile)
          setLoading(false)
          
          // Always show profile modal for new registrations
          setShowProfileModal(true)
          
          return { success: true }
        }
      }
      
      setLoading(false)
      return { success: false, error: response.error || "Registration failed" }
    } catch (error) {
      setLoading(false)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Registration failed" 
      }
    }
  }

  const logout = () => {
    setUser(null)
    tokenManager.removeToken()
  }

  const refreshUser = async () => {
    const token = tokenManager.getToken()
    if (token) {
      try {
        console.log('Refreshing user data...')
        const response = await authAPI.getProfile(token)
        console.log('Profile API response:', response)
        if (response.success && response.user) {
          console.log('Setting user data:', {
            user: response.user,
            hasCandidateProfile: !!response.user.candidateProfile,
            candidateProfile: response.user.candidateProfile
          })
          setUser(response.user as UserWithProfile)
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading, showProfileModal, setShowProfileModal, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Auth guard hook
export function useRequireAuth(allowedRoles?: Array<"super_admin" | "employer" | "candidate">) {
  const { user, loading } = useAuth()

  if (loading) return { user: null, loading: true, authorized: false }

  if (!user) return { user: null, loading: false, authorized: false }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { user, loading: false, authorized: false }
  }

  return { user, loading: false, authorized: true }
}
