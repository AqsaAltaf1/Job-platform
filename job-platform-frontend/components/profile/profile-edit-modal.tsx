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
import { X, Upload, Camera, Image as ImageIcon, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { profileAPI } from "@/lib/profile-api"
import { showToast, toastMessages } from "@/lib/toast"
import { SKILL_CATEGORIES } from "@/lib/skills-data"

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function ProfileEditModal({ isOpen, onClose, onSave }: ProfileEditModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    job_title: "",
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
    // Company Information
    company_name: "",
    company_legal_name: "",
    company_display_name: "",
    company_description: "",
    company_logo_url: "",
    company_website: "",
    careers_page_url: "",
    company_industry: "",
    company_sector: "",
    company_size: "",
    company_location: "",
    headquarters_location: "",
    remote_policy: "",
  })

  const [newSkill, setNewSkill] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [customSkill, setCustomSkill] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

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
          first_name: profile.first_name || response.user.first_name || "",
          last_name: profile.last_name || response.user.last_name || "",
          bio: profile.bio || "",
          job_title: profile.job_title || "",
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
          // Company Information
          company_name: profile.company_name || "",
          company_legal_name: profile.company_legal_name || "",
          company_display_name: profile.company_display_name || "",
          company_description: profile.company_description || "",
          company_logo_url: profile.company_logo_url || "",
          company_website: profile.company_website || "",
          careers_page_url: profile.careers_page_url || "",
          company_industry: profile.company_industry || "",
          company_sector: profile.company_sector || "",
          company_size: profile.company_size || "",
          company_location: profile.company_location || "",
          headquarters_location: profile.headquarters_location || "",
          remote_policy: profile.remote_policy || "",
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
    setValidationErrors({})

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false)
      setError("Please fix the validation errors below")
      return
    }

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
          showToast.success('Profile updated successfully!')
          setTimeout(() => {
            onSave()
            onClose()
          }, 1000)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : toastMessages.profileUpdateError
          setError(errorMessage)
          showToast.error(errorMessage)
        } finally {
          setLoading(false)
        }
        return // Exit early, the rest will be handled above
      }
      
      // No file selected, proceed with normal update
      await profileAPI.updateProfile(submitData)
      setSuccess(true)
      showToast.success('Profile updated successfully!')
      setTimeout(() => {
        onSave()
        onClose()
      }, 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : toastMessages.profileUpdateError
      setError(errorMessage)
      showToast.error(errorMessage)
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

  const addSkillFromDropdown = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }))
      setNewSkill("")
      setSelectedCategory("")
    }
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, customSkill.trim()],
      }))
      setCustomSkill("")
      setShowCustomInput(false)
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

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateURL = (url: string): boolean => {
    if (!url.trim()) return true // Empty URLs are allowed
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true // Empty phone is allowed
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    return phoneRegex.test(cleanPhone)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Basic validation for all users
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Please enter a valid phone number"
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required"
    }

    // URL validations
    if (formData.website && !validateURL(formData.website)) {
      errors.website = "Please enter a valid website URL"
    }

    if (formData.linkedin_url && !validateURL(formData.linkedin_url)) {
      errors.linkedin_url = "Please enter a valid LinkedIn URL"
    }

    if (formData.github_url && !validateURL(formData.github_url)) {
      errors.github_url = "Please enter a valid GitHub URL"
    }

    // Role-specific validations
    if (user?.role === "candidate") {
      if (!formData.bio.trim()) {
        errors.bio = "Bio is required"
      } else if (formData.bio.trim().length < 50) {
        errors.bio = "Bio must be at least 50 characters long"
      }

      if (!formData.job_title.trim()) {
        errors.job_title = "Job title is required"
      }

      if (formData.skills.length === 0) {
        errors.skills = "At least one skill is required"
      }

      if (!formData.experience_years || formData.experience_years < 0) {
        errors.experience_years = "Years of experience is required and must be 0 or greater"
      }

      if (formData.resume_url && !validateURL(formData.resume_url)) {
        errors.resume_url = "Please enter a valid resume URL"
      }

      if (formData.portfolio_url && !validateURL(formData.portfolio_url)) {
        errors.portfolio_url = "Please enter a valid portfolio URL"
      }

      if (formData.salary_expectation && formData.salary_expectation < 0) {
        errors.salary_expectation = "Salary expectation must be 0 or greater"
      }
    }

    if (user?.role === "employer") {
      if (!formData.first_name.trim()) {
        errors.first_name = "First name is required"
      }

      if (!formData.last_name.trim()) {
        errors.last_name = "Last name is required"
      }

      if (!formData.position.trim()) {
        errors.position = "Your position is required"
      }

      if (!formData.company_name.trim()) {
        errors.company_name = "Company name is required"
      }

      if (!formData.company_description.trim()) {
        errors.company_description = "Company description is required"
      } else if (formData.company_description.trim().length < 50) {
        errors.company_description = "Company description must be at least 50 characters long"
      }

      if (!formData.company_industry) {
        errors.company_industry = "Company industry is required"
      }

      if (!formData.company_size) {
        errors.company_size = "Company size is required"
      }

      if (!formData.headquarters_location.trim()) {
        errors.headquarters_location = "Headquarters location is required"
      }

      if (!formData.remote_policy) {
        errors.remote_policy = "Remote work policy is required"
      }

      if (formData.company_website && !validateURL(formData.company_website)) {
        errors.company_website = "Please enter a valid company website URL"
      }

      if (formData.careers_page_url && !validateURL(formData.careers_page_url)) {
        errors.careers_page_url = "Please enter a valid careers page URL"
      }

      if (formData.company_logo_url && !validateURL(formData.company_logo_url)) {
        errors.company_logo_url = "Please enter a valid logo URL"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
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
                          className="text-red-500 hover:text-primary p-1 rounded-full hover:bg-primary/10"
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
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  className={`h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                    validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-600">{validationErrors.phone}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  className={`h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                    validationErrors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {validationErrors.location && (
                  <p className="text-sm text-red-600">{validationErrors.location}</p>
                )}
              </div>
            </div>

            {/* Bio and Job Title - Only for Candidates */}
            {user?.role === "candidate" && (
              <>
            <div className="space-y-3">
              <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio * (min 50 characters)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => updateFormData("bio", e.target.value)}
                rows={4}
                className={`rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 resize-none ${
                  validationErrors.bio ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {validationErrors.bio && (
                <p className="text-sm text-red-600">{validationErrors.bio}</p>
              )}
            </div>

                <div className="space-y-3">
                  <Label htmlFor="job_title" className="text-sm font-medium text-gray-700">Job Title *</Label>
                  <Input
                    id="job_title"
                    placeholder="e.g., Software Engineer, Chef, Marketing Manager, Data Scientist"
                    value={formData.job_title}
                    onChange={(e) => updateFormData("job_title", e.target.value)}
                    className={`h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                      validationErrors.job_title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {validationErrors.job_title && (
                    <p className="text-sm text-red-600">{validationErrors.job_title}</p>
                  )}
                </div>
              </>
            )}

            {/* Name Fields - Only for Employers */}
            {user?.role === "employer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name *</Label>
                  <Input
                    id="first_name"
                    placeholder="e.g., John"
                    value={formData.first_name}
                    onChange={(e) => updateFormData("first_name", e.target.value)}
                    className={`h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                      validationErrors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    required
                  />
                  {validationErrors.first_name && (
                    <p className="text-sm text-red-600">{validationErrors.first_name}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name *</Label>
                  <Input
                    id="last_name"
                    placeholder="e.g., Smith"
                    value={formData.last_name}
                    onChange={(e) => updateFormData("last_name", e.target.value)}
                    className={`h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                      validationErrors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    required
                  />
                  {validationErrors.last_name && (
                    <p className="text-sm text-red-600">{validationErrors.last_name}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
                className={`h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                  validationErrors.website ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {validationErrors.website && (
                <p className="text-sm text-red-600">{validationErrors.website}</p>
              )}
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
                  className={`h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                    validationErrors.linkedin_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {validationErrors.linkedin_url && (
                  <p className="text-sm text-red-600">{validationErrors.linkedin_url}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="github_url" className="text-sm font-medium text-gray-700">GitHub</Label>
                <Input
                  id="github_url"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={formData.github_url}
                  onChange={(e) => updateFormData("github_url", e.target.value)}
                  className={`h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                    validationErrors.github_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {validationErrors.github_url && (
                  <p className="text-sm text-red-600">{validationErrors.github_url}</p>
                )}
              </div>
            </div>

          </div>

          {/* Role-specific fields */}
          {user?.role === "candidate" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Professional Information</h3>
              
              <div className="space-y-4">
                <Label htmlFor="skills" className="text-sm font-medium text-gray-700">Skills</Label>
                
                {/* Category Selection - This is the main dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="skill-category" className="text-sm font-medium text-gray-700">Select Your Field/Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900">
                      <SelectValue placeholder="Choose your field (e.g., Software, Teaching, Chef, etc.)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Skills from Selected Category - Auto-populate when category is selected */}
                {selectedCategory && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Skills for {SKILL_CATEGORIES.find(c => c.id === selectedCategory)?.name}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-xl p-3">
                      {SKILL_CATEGORIES.find(c => c.id === selectedCategory)?.skills.map((skill) => (
                        <Button
                          key={skill}
                          type="button"
                          variant={formData.skills.includes(skill) ? "default" : "outline"}
                          size="sm"
                          onClick={() => addSkillFromDropdown(skill)}
                          disabled={formData.skills.includes(skill)}
                          className="text-xs h-8"
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Skill Input - For skills not in any category */}
                <div className="space-y-2">
                  {!showCustomInput ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomInput(true)}
                      className="w-full h-12 rounded-xl border-gray-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Skill (Not in any category)
                    </Button>
                  ) : (
                <div className="flex gap-3">
                  <Input
                        placeholder="Enter custom skill..."
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addCustomSkill()
                          }
                        }}
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900"
                  />
                      <Button type="button" onClick={addCustomSkill} disabled={!customSkill.trim()} className="h-12 px-6 rounded-xl bg-blue-900 hover:bg-blue-800 text-white">
                    Add
                  </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowCustomInput(false)
                        setCustomSkill("")
                      }} className="h-12 px-6 rounded-xl border-gray-200">
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Selected Skills Display */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Your Skills ({formData.skills.length}) *</Label>
                  <div className={`flex flex-wrap gap-2 min-h-[2rem] p-3 border rounded-xl ${
                    validationErrors.skills ? 'border-red-500' : ''
                  }`}>
                    {formData.skills.length > 0 ? (
                      formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer hover:text-blue-900" onClick={() => removeSkill(skill)} />
                    </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No skills added yet</span>
                    )}
                  </div>
                  {validationErrors.skills && (
                    <p className="text-sm text-red-600">{validationErrors.skills}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="experience_years" className="text-sm font-medium text-gray-700">Years of Experience *</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.experience_years || ""}
                    onChange={(e) =>
                      updateFormData("experience_years", e.target.value ? Number.parseInt(e.target.value) : undefined)
                    }
                    className={`h-12 rounded-xl border-gray-200 focus:border-blue-900 focus:ring-blue-900 ${
                      validationErrors.experience_years ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {validationErrors.experience_years && (
                    <p className="text-sm text-red-600">{validationErrors.experience_years}</p>
                  )}
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
                      <SelectItem value="immediate" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Available Immediately</SelectItem>
                      <SelectItem value="2-weeks" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">2 Weeks Notice</SelectItem>
                      <SelectItem value="1-month" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">1 Month Notice</SelectItem>
                      <SelectItem value="not-available" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Not Available</SelectItem>
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
                    className={validationErrors.resume_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {validationErrors.resume_url && (
                    <p className="text-sm text-red-600">{validationErrors.resume_url}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">Portfolio URL</Label>
                  <Input
                    id="portfolio_url"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio_url}
                    onChange={(e) => updateFormData("portfolio_url", e.target.value)}
                    className={validationErrors.portfolio_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {validationErrors.portfolio_url && (
                    <p className="text-sm text-red-600">{validationErrors.portfolio_url}</p>
                  )}
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
                  className={validationErrors.salary_expectation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.salary_expectation && (
                  <p className="text-sm text-red-600">{validationErrors.salary_expectation}</p>
                )}
              </div>
            </div>
          )}

          {user?.role === "employer" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Company Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="position">Your Position *</Label>
                <Input
                  id="position"
                  placeholder="e.g., HR Manager, CEO, Recruiter"
                  value={formData.position}
                  onChange={(e) => updateFormData("position", e.target.value)}
                  className={validationErrors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.position && (
                  <p className="text-sm text-red-600">{validationErrors.position}</p>
                )}
              </div>

              {/* Company Names Section */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">Company Names</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name (Primary) *</Label>
                <Input
                  id="company_name"
                  placeholder="e.g., TechCorp Inc."
                  value={formData.company_name}
                  onChange={(e) => updateFormData("company_name", e.target.value)}
                  className={validationErrors.company_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.company_name && (
                  <p className="text-sm text-red-600">{validationErrors.company_name}</p>
                )}
              </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_legal_name">Legal Name (Optional)</Label>
                    <Input
                      id="company_legal_name"
                      placeholder="e.g., TechCorp Incorporated"
                      value={formData.company_legal_name}
                      onChange={(e) => updateFormData("company_legal_name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_display_name">Display Name (Optional)</Label>
                  <Input
                    id="company_display_name"
                    placeholder="e.g., TechCorp (how you want to appear to candidates)"
                    value={formData.company_display_name}
                    onChange={(e) => updateFormData("company_display_name", e.target.value)}
                  />
                </div>
              </div>

              {/* Company Description */}
              <div className="space-y-2">
                <Label htmlFor="company_description">Company Description * (min 50 characters)</Label>
                <Textarea
                  id="company_description"
                  placeholder="Tell us about your company, mission, and culture..."
                  value={formData.company_description}
                  onChange={(e) => updateFormData("company_description", e.target.value)}
                  rows={4}
                  className={validationErrors.company_description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {validationErrors.company_description && (
                  <p className="text-sm text-red-600">{validationErrors.company_description}</p>
                )}
              </div>

              {/* Branding Section */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">Branding & Assets</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="company_logo_url">Company Logo URL</Label>
                  <Input
                    id="company_logo_url"
                    type="url"
                    placeholder="https://yourcompany.com/logo.png"
                    value={formData.company_logo_url}
                    onChange={(e) => updateFormData("company_logo_url", e.target.value)}
                  />
                </div>
              </div>

              {/* Industry & Sector */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">Industry & Sector</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_industry">Industry *</Label>
                    <Select
                      value={formData.company_industry}
                      onValueChange={(value) => updateFormData("company_industry", value)}
                    >
                      <SelectTrigger className={validationErrors.company_industry ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Technology</SelectItem>
                        <SelectItem value="Healthcare" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Healthcare</SelectItem>
                        <SelectItem value="Finance" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Finance</SelectItem>
                        <SelectItem value="Education" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Education</SelectItem>
                        <SelectItem value="Manufacturing" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Manufacturing</SelectItem>
                        <SelectItem value="Retail" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Retail</SelectItem>
                        <SelectItem value="Consulting" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Consulting</SelectItem>
                        <SelectItem value="Marketing" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Marketing & Advertising</SelectItem>
                        <SelectItem value="Real Estate" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Real Estate</SelectItem>
                        <SelectItem value="Non-profit" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Non-profit</SelectItem>
                        <SelectItem value="Government" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Government</SelectItem>
                        <SelectItem value="Other" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.company_industry && (
                      <p className="text-sm text-red-600">{validationErrors.company_industry}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_sector">Sector (Optional)</Label>
                    <Input
                      id="company_sector"
                      placeholder="e.g., B2B SaaS, Consumer Electronics"
                      value={formData.company_sector}
                      onChange={(e) => updateFormData("company_sector", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Company Size */}
                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size *</Label>
                  <Select
                    value={formData.company_size}
                    onValueChange={(value) => updateFormData("company_size", value)}
                  >
                    <SelectTrigger className={validationErrors.company_size ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">1-10 employees</SelectItem>
                      <SelectItem value="11-50" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">11-50 employees</SelectItem>
                      <SelectItem value="51-200" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">51-200 employees</SelectItem>
                      <SelectItem value="201-500" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">201-500 employees</SelectItem>
                      <SelectItem value="501-1000" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">501-1000 employees</SelectItem>
                    <SelectItem value="1001-5000" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">1001-5000 employees</SelectItem>
                    <SelectItem value="5000+" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">5000+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.company_size && (
                  <p className="text-sm text-red-600">{validationErrors.company_size}</p>
                )}
              </div>

              {/* Locations Section */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">Locations</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="headquarters_location">Headquarters Location *</Label>
                    <Input
                      id="headquarters_location"
                      placeholder="e.g., San Francisco, CA, USA"
                      value={formData.headquarters_location}
                      onChange={(e) => updateFormData("headquarters_location", e.target.value)}
                      className={validationErrors.headquarters_location ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {validationErrors.headquarters_location && (
                      <p className="text-sm text-red-600">{validationErrors.headquarters_location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_location">Primary Office Location</Label>
                    <Input
                      id="company_location"
                      placeholder="e.g., New York, NY, USA"
                      value={formData.company_location}
                      onChange={(e) => updateFormData("company_location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remote_policy">Remote Work Policy *</Label>
                  <Select
                    value={formData.remote_policy}
                    onValueChange={(value) => updateFormData("remote_policy", value)}
                  >
                    <SelectTrigger className={validationErrors.remote_policy ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                      <SelectValue placeholder="Select remote policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-site" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">On-site Only</SelectItem>
                      <SelectItem value="remote" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Fully Remote</SelectItem>
                      <SelectItem value="hybrid" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Hybrid (Office + Remote)</SelectItem>
                      <SelectItem value="flexible" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.remote_policy && (
                    <p className="text-sm text-red-600">{validationErrors.remote_policy}</p>
                  )}
                </div>
              </div>

              {/* Website & Links */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">Website & Links</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="company_website">Company Website</Label>
                  <Input
                      id="company_website"
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={formData.company_website}
                      onChange={(e) => updateFormData("company_website", e.target.value)}
                      className={validationErrors.company_website ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {validationErrors.company_website && (
                    <p className="text-sm text-red-600">{validationErrors.company_website}</p>
                  )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="careers_page_url">Careers Page URL</Label>
                  <Input
                      id="careers_page_url"
                      type="url"
                      placeholder="https://yourcompany.com/careers"
                      value={formData.careers_page_url}
                      onChange={(e) => updateFormData("careers_page_url", e.target.value)}
                      className={validationErrors.careers_page_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {validationErrors.careers_page_url && (
                      <p className="text-sm text-red-600">{validationErrors.careers_page_url}</p>
                    )}
                  </div>
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
