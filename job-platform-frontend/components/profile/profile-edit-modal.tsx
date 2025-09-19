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
import { X, Upload, Camera, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { profileAPI } from "@/lib/profile-api"

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      loadUserProfile()
    }
  }, [isOpen, user])

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

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
      // Prepare data for submission
      const submitData = { ...formData }
      
      // If a file is selected, compress and convert it to base64 data URL
      if (selectedFile) {
        try {
          const compressedDataUrl = await compressImage(selectedFile)
          submitData.profile_picture_url = compressedDataUrl
          
          await profileAPI.updateProfile(submitData)
          setSuccess(true)
          setTimeout(() => {
            onSave()
            onClose()
          }, 1500)
        } catch (error) {
          setError(error instanceof Error ? error.message : "Failed to process image")
        } finally {
          setLoading(false)
        }
        return // Exit early, the rest will be handled above
      }
      
      // No file selected, proceed with normal update
      await profileAPI.updateProfile(submitData)
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

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Check file size (max 2MB - reduced from 5MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB')
        return
      }
      
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setError('')
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full p-2 hover:bg-blue-900 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
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
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Profile Picture</h3>
            <div className="flex items-center gap-8">
              <Avatar className="w-24 h-24 border-4 border-gray-100">
                <AvatarImage 
                  src={previewUrl || formData.profile_picture_url || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=3b82f6&color=fff&size=96`} 
                  alt={`${user?.first_name} ${user?.last_name}` || "User"}
                />
                <AvatarFallback className="text-xl font-semibold">
                  {user?.first_name?.[0]}{user?.last_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-4 flex-1">
                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Upload Profile Picture</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="profile-picture-upload"
                    />
                    <label
                      htmlFor="profile-picture-upload"
                      className="flex items-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl cursor-pointer transition-colors font-medium"
                    >
                      <Upload className="h-5 w-5" />
                      Choose File
                    </label>
                    {selectedFile && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB - will be compressed)
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Supported formats: JPG, PNG, GIF. Maximum file size: 2MB (will be compressed automatically)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => updateFormData("bio", e.target.value)}
                rows={4}
                className="rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="linkedin_url" className="text-sm font-medium text-gray-700">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin_url}
                  onChange={(e) => updateFormData("linkedin_url", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="github_url" className="text-sm font-medium text-gray-700">GitHub</Label>
                <Input
                  id="github_url"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={formData.github_url}
                  onChange={(e) => updateFormData("github_url", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900"
                />
              </div>
            </div>

          </div>

          {/* Role-specific fields */}
          {user?.role === "candidate" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Professional Information</h3>
              
              <div className="space-y-3">
                <Label htmlFor="skills" className="text-sm font-medium text-gray-700">Skills</Label>
                <div className="flex gap-3">
                  <Input
                    id="skills"
                    placeholder="Add a skill (e.g., JavaScript, React)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900"
                  />
                  <Button type="button" onClick={addSkill} disabled={!newSkill.trim()} className="h-12 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer hover:text-blue-900" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="experience_years" className="text-sm font-medium text-gray-700">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.experience_years || ""}
                    onChange={(e) =>
                      updateFormData("experience_years", e.target.value ? Number.parseInt(e.target.value) : undefined)
                    }
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="availability" className="text-sm font-medium text-gray-700">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value: any) => updateFormData("availability", value)}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900">
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

            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} className="h-12 px-8 rounded-xl border-gray-200 hover:bg-blue-900 hover:text-white hover:border-blue-900">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl bg-blue-900 hover:bg-blue-800 text-white">
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
