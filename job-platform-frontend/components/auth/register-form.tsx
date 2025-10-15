"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { googleAuth } from "@/lib/google-auth"

interface RegisterFormProps {
  onRoleChange?: (role: "candidate" | "employer") => void
}

export function RegisterForm({ onRoleChange }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "candidate" as "employer" | "candidate",
    otp: "",
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState<"form" | "otp">("form")
  const [otpSent, setOtpSent] = useState(false)
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { register, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (step === "form") {
      // Validate form data
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }

      // Send OTP first
      const result = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        phone: formData.phone || undefined,
      })

      if (result.success && (result as any).requiresOtp) {
        setOtpSent(true)
        setOtpExpiresAt(new Date((result as any).expiresAt))
        setStep("otp")
        setResendCooldown(60) // 60 seconds cooldown
        startResendCooldown()
      } else if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Registration failed")
      }
    } else {
      // Verify OTP and complete registration
      if (!formData.otp || formData.otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP")
        return
      }

      const result = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        phone: formData.phone || undefined,
        otp: formData.otp,
      })

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.error || "OTP verification failed")
      }
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError("")
    
    try {
      // Redirect to Google OAuth
      window.location.href = googleAuth.getAuthUrl()
    } catch (error) {
      setGoogleLoading(false)
      const errorMessage = error instanceof Error ? error.message : "Google login failed"
      setError(errorMessage)
    }
  }

  const startResendCooldown = () => {
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    setError("")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/otp/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const result = await response.json()

      if (result.success) {
        setOtpExpiresAt(new Date(result.expiresAt))
        setResendCooldown(60)
        startResendCooldown()
        setError("")
      } else {
        setError(result.error || "Failed to resend OTP")
      }
    } catch (error) {
      setError("Failed to resend OTP. Please try again.")
    }
  }

  const handleBackToForm = () => {
    setStep("form")
    setOtpSent(false)
    setOtpExpiresAt(null)
    setResendCooldown(0)
    setError("")
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "role" && onRoleChange) {
      onRoleChange(value as "candidate" | "employer")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {step === "form" ? "Create your account" : "Verify your email"}
        </CardTitle>
        {step === "otp" && (
          <CardDescription>
            We sent a 6-digit code to {formData.email}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "form" ? (
            <>
              {/* Account Type Selection */}
              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => updateFormData("role", "candidate")}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      formData.role === "candidate"
                        ? "bg-primary text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData("role", "employer")}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      formData.role === "employer"
                        ? "bg-primary text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Employer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1-555-0123"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    required
                    className="h-12 rounded-xl pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    required
                    className="h-12 rounded-xl pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white" disabled={loading}>
                {loading ? "Sending verification..." : "Send Verification Code"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {googleLoading ? "Signing in with Google..." : "Continue with Google"}
              </Button>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    updateFormData("otp", value)
                  }}
                  required
                  className="h-12 rounded-xl text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {otpExpiresAt && (
                <div className="text-center text-sm text-muted-foreground">
                  Code expires at {otpExpiresAt.toLocaleTimeString()}
                </div>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Create Account"}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-sm text-primary hover:underline disabled:text-muted-foreground"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s` 
                    : "Didn't receive the code? Resend"
                  }
                </button>
                
                <div className="text-sm text-muted-foreground">
                  Wrong email?{" "}
                  <button
                    type="button"
                    onClick={handleBackToForm}
                    className="text-primary hover:underline"
                  >
                    Go back
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "form" && (
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}