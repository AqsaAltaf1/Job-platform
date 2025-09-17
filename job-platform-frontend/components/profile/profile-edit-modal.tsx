"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Upload, Camera } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { profileAPI } from "@/lib/profile-api"
import type { UserProfile } from "@/lib/types"

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function ProfileEditModal({ isOpen, onClose, onSave }: ProfileEditModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    website: "",
    linkedin_url: "",
    github_url: "",
    phone: "",
    profile_picture_url: "",
    // Candidate fields
    skills: [] as string[],
    experience_years: undefined as number | undefined,
    education: "",
    resume_url: "",
    portfolio_url: "",
    salary_expectation: undefined as number | undefined,
    availability: "immediate" as "immediate" | "2-weeks" | "1-month" | "not-available",
    // Employer fields
    position: "",
    company_name: "",
    company_description: "",
    company_website: "",
    company_size: "",
    company_industry: "",
    company_location: "",
  })

  const [newSkill, setNewSkill] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen && user) {
      loadUserProfile()
    }
  }, [isOpen, user])

  const loadUserProfile = async () => {
    try {
      const response = await profileAPI.getProfile()
      const profile = response.user.employerProfile || response.user.candidateProfile
      
      if (profile) {
        setFormData({
          bio: profile.bio || "",
          location: profile.location || "",
          website: profile.website || "",
          linkedin_url: profile.linkedin_url || "",
          github_url: profile.github_url || "",
          phone: profile.phone || "",
          profile_picture_url: profile.profile_picture_url || "",
          // Candidate fields
          skills: profile.skills || [],
          experience_years: profile.experience_years || undefined,
          education: profile.education || "",
          resume_url: profile.resume_url || "",
          portfolio_url: profile.portfolio_url || "",
          salary_expectation: profile.salary_expectation || undefined,
          availability: profile.availability || "immediate",
          // Employer fields
          position: profile.position || "",
          company_name: profile.company_name || "",
          company_description: profile.company_description || "",
          company_website: profile.company_website || "",
          company_size: profile.company_size || "",
          company_industry: profile.company_industry || "",
          company_location: profile.company_location || "",
        })
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    try {
      await profileAPI.updateProfile(formData)
      setSuccess(true)
      setTimeout(() => {
        onSave()
        onClose()
      }, 1500)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success && (
            <Alert>
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Picture */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Picture</h3>
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage 
                  src={formData.profile_picture_url || `https://ui-avatars.com/api/?name=${formData.first_name}+${formData.last_name}&background=3b82f6&color=fff&size=80`} 
                  alt={`${formData.first_name} ${formData.last_name}`}
                />
                <AvatarFallback className="text-lg">
                  {formData.first_name?.[0]}{formData.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
                <Input
                  id="profile_picture_url"
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={formData.profile_picture_url || ""}
                  onChange={(e) => updateFormData("profile_picture_url", e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Enter a URL to your profile picture or leave blank for auto-generated avatar
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => updateFormData("bio", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin_url}
                  onChange={(e) => updateFormData("linkedin_url", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub</Label>
                <Input
                  id="github_url"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={formData.github_url}
                  onChange={(e) => updateFormData("github_url", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Role-specific fields */}
          {user?.role === "candidate" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    placeholder="Add a skill (e.g., JavaScript, React)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button type="button" onClick={addSkill} disabled={!newSkill.trim()}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.experience_years || ""}
                    onChange={(e) =>
                      updateFormData("experience_years", e.target.value ? Number.parseInt(e.target.value) : undefined)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value: any) => updateFormData("availability", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Available Immediately</SelectItem>
                      <SelectItem value="2-weeks">2 Weeks Notice</SelectItem>
                      <SelectItem value="1-month">1 Month Notice</SelectItem>
                      <SelectItem value="not-available">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  placeholder="e.g., Bachelor of Computer Science - University of California"
                  value={formData.education}
                  onChange={(e) => updateFormData("education", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resume_url">Resume URL</Label>
                  <Input
                    id="resume_url"
                    type="url"
                    placeholder="https://example.com/resume.pdf"
                    value={formData.resume_url}
                    onChange={(e) => updateFormData("resume_url", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">Portfolio URL</Label>
                  <Input
                    id="portfolio_url"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio_url}
                    onChange={(e) => updateFormData("portfolio_url", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_expectation">Salary Expectation</Label>
                <Input
                  id="salary_expectation"
                  type="number"
                  placeholder="e.g., 85000"
                  value={formData.salary_expectation || ""}
                  onChange={(e) =>
                    updateFormData("salary_expectation", e.target.value ? Number.parseInt(e.target.value) : undefined)
                  }
                />
              </div>
            </div>
          )}

          {user?.role === "employer" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="position">Your Position</Label>
                <Input
                  id="position"
                  placeholder="e.g., HR Manager, CEO, Recruiter"
                  value={formData.position}
                  onChange={(e) => updateFormData("position", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  placeholder="e.g., TechCorp Inc."
                  value={formData.company_name}
                  onChange={(e) => updateFormData("company_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_description">Company Description</Label>
                <Textarea
                  id="company_description"
                  placeholder="Tell us about your company..."
                  value={formData.company_description}
                  onChange={(e) => updateFormData("company_description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_website">Company Website</Label>
                  <Input
                    id="company_website"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={formData.company_website}
                    onChange={(e) => updateFormData("company_website", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size</Label>
                  <Select
                    value={formData.company_size}
                    onValueChange={(value) => updateFormData("company_size", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_industry">Industry</Label>
                  <Input
                    id="company_industry"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={formData.company_industry}
                    onChange={(e) => updateFormData("company_industry", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_location">Company Location</Label>
                  <Input
                    id="company_location"
                    placeholder="e.g., San Francisco, CA"
                    value={formData.company_location}
                    onChange={(e) => updateFormData("company_location", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
