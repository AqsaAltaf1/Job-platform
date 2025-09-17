"use client"

import type React from "react"

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { CandidateProfileForm } from "@/components/profile/candidate-profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [basicInfo, setBasicInfo] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (error) {
      console.error("Failed to update basic info:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = (profileData: any) => {
    console.log("Profile saved:", profileData)
    // In a real app, this would save to the database
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          <div className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
                  {success && (
                    <Alert>
                      <AlertDescription>Basic information updated successfully!</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={basicInfo.first_name}
                        onChange={(e) => setBasicInfo((prev) => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={basicInfo.last_name}
                        onChange={(e) => setBasicInfo((prev) => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Basic Info"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Role-specific Profile */}
            {user?.role === "candidate" && (
              <CandidateProfileForm profile={user.candidateProfile} onSave={handleProfileSave} />
            )}

            {user?.role === "employer" && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Manage your company profile and details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <p className="text-sm text-muted-foreground">
                        {user.employerProfile?.company?.name || "No company assigned"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        placeholder="Your position at the company"
                        defaultValue={user.employerProfile?.position || ""}
                      />
                    </div>

                    <Button>Update Company Info</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
