"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus, Search } from "lucide-react"
import type { CandidateProfile } from "@/lib/types"
import { SKILL_CATEGORIES, ALL_SKILLS, searchSkills } from "@/lib/skills-data"

interface CandidateProfileFormProps {
  profile?: CandidateProfile
  onSave?: (profile: Partial<CandidateProfile>) => void
}

export function CandidateProfileForm({ profile, onSave }: CandidateProfileFormProps) {
  const [formData, setFormData] = useState({
    bio: "",
    job_title: "",
    skills: [] as string[],
    experience_years: undefined as number | undefined,
    education: "",
    resume_url: "",
    portfolio_url: "",
    linkedin_url: "",
    github_url: "",
    location: "",
    salary_expectation: undefined as number | undefined,
    availability: "immediate" as "immediate" | "2-weeks" | "1-month" | "not-available",
  })

  const [newSkill, setNewSkill] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [customSkill, setCustomSkill] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || "",
        job_title: profile.job_title || "",
        skills: profile.skills || [],
        experience_years: profile.experience_years || undefined,
        education: profile.education || "",
        resume_url: profile.resume_url || "",
        portfolio_url: profile.portfolio_url || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        location: profile.location || "",
        salary_expectation: profile.salary_expectation || undefined,
        availability: profile.availability || "immediate",
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSave?.(formData)
      setSuccess(true)
    } catch (error) {
      console.error("Failed to save profile:", error)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Profile</CardTitle>
        <CardDescription>Complete your profile to attract potential employers</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert>
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell employers about yourself, your experience, and what you're looking for..."
              value={formData.bio}
              onChange={(e) => updateFormData("bio", e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              placeholder="e.g., Software Engineer, Chef, Marketing Manager, Data Scientist"
              value={formData.job_title}
              onChange={(e) => updateFormData("job_title", e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="skills">Skills</Label>
            
            {/* Category Selection - This is the main dropdown */}
            <div className="space-y-2">
              <Label htmlFor="skill-category">Select Your Field/Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your field (e.g., Software, Teaching, Chef, etc.)..." />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skills from Selected Category - Auto-populate when category is selected */}
            {selectedCategory && (
              <div className="space-y-2">
                <Label>Skills for {SKILL_CATEGORIES.find(c => c.id === selectedCategory)?.name}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {SKILL_CATEGORIES.find(c => c.id === selectedCategory)?.skills.map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant={formData.skills.includes(skill) ? "default" : "outline"}
                      size="sm"
                      onClick={() => addSkillFromDropdown(skill)}
                      disabled={formData.skills.includes(skill)}
                      className="text-xs"
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
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Skill (Not in any category)
                </Button>
              ) : (
                <div className="flex gap-2">
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
                  />
                  <Button type="button" onClick={addCustomSkill} disabled={!customSkill.trim()}>
                    Add
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowCustomInput(false)
                    setCustomSkill("")
                  }}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Selected Skills Display */}
            <div className="space-y-2">
              <Label>Your Skills ({formData.skills.length})</Label>
              <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border rounded-md">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">No skills added yet</span>
                )}
              </div>
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
              />
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Links & Documents</h3>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin_url}
                  onChange={(e) => updateFormData("linkedin_url", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
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

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
