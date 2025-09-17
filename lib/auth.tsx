// Authentication utilities and context
"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, UserWithProfile } from "./types"
import { mockUsers, mockCandidateProfiles, mockEmployerProfiles, mockCompanies } from "./mock-data"

interface AuthContextType {
  user: UserWithProfile | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "employer" | "candidate"
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(getUserWithProfile(userData.id))
      } catch (error) {
        localStorage.removeItem("auth_user")
      }
    }
    setLoading(false)
  }, [])

  const getUserWithProfile = (userId: string): UserWithProfile | null => {
    const baseUser = mockUsers.find((u) => u.id === userId)
    if (!baseUser) return null

    const userWithProfile: UserWithProfile = { ...baseUser }

    if (baseUser.role === "candidate") {
      userWithProfile.candidateProfile = mockCandidateProfiles.find((p) => p.user_id === userId)
    } else if (baseUser.role === "employer") {
      const employerProfile = mockEmployerProfiles.find((p) => p.user_id === userId)
      if (employerProfile) {
        const company = mockCompanies.find((c) => c.id === employerProfile.company_id)
        userWithProfile.employerProfile = {
          ...employerProfile,
          company: company!,
        }
      }
    }

    return userWithProfile
  }

  const login = async (email: string, password: string) => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email)

    if (!foundUser) {
      setLoading(false)
      return { success: false, error: "User not found" }
    }

    // In a real app, you'd verify the password hash
    if (password.length < 6) {
      setLoading(false)
      return { success: false, error: "Invalid password" }
    }

    const userWithProfile = getUserWithProfile(foundUser.id)
    setUser(userWithProfile)
    localStorage.setItem("auth_user", JSON.stringify(foundUser))

    setLoading(false)
    return { success: true }
  }

  const register = async (userData: RegisterData) => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === userData.email)
    if (existingUser) {
      setLoading(false)
      return { success: false, error: "User already exists" }
    }

    // Create new user (in real app, this would be saved to database)
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      password_hash: "hashed_" + userData.password,
      role: userData.role,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      created_at: new Date(),
      updated_at: new Date(),
    }

    // Add to mock data (in real app, this would be database operations)
    mockUsers.push(newUser)

    const userWithProfile = getUserWithProfile(newUser.id)
    setUser(userWithProfile)
    localStorage.setItem("auth_user", JSON.stringify(newUser))

    setLoading(false)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Auth guard hook
export function useRequireAuth(allowedRoles?: Array<"admin" | "employer" | "candidate">) {
  const { user, loading } = useAuth()

  if (loading) return { user: null, loading: true, authorized: false }

  if (!user) return { user: null, loading: false, authorized: false }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { user, loading: false, authorized: false }
  }

  return { user, loading: false, authorized: true }
}
