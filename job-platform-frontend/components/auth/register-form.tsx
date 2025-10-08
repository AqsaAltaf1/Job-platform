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

      if (result.success && result.requiresOtp) {
        setOtpSent(true)
        setOtpExpiresAt(new Date(result.expiresAt))
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