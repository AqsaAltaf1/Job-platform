"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { jobsApi, type CreateJobData, type UpdateJobData } from "@/lib/jobs"
import type { JobWithCompany, Company } from "@/lib/types"

interface JobFormProps {
  job?: JobWithCompany
  onSuccess?: (job: JobWithCompany) => void
  onCancel?: () => void
}

export function JobForm({ job, onSuccess, onCancel }: JobFormProps) {
  const [formData, setFormData] = useState<CreateJobData>({
    title: "",
    description: "",
    requirements: "",
    salary_min: undefined,
    salary_max: undefined,
    location: "",
    job_type: "full-time",
    experience_level: "mid",
    company_id: "",
    expires_at: undefined,
  })

  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [loadingCompanies, setLoadingCompanies] = useState(true)

  useEffect(() => {
    // Load companies
    const loadCompanies = async () => {
      try {
        const companiesData = await jobsApi.getCompanies()
        setCompanies(companiesData)
      } catch (err) {
        setError("Failed to load companies")
      } finally {
        setLoadingCompanies(false)
      }
    }

    loadCompanies()
  }, [])

  useEffect(() => {
    // Pre-fill form if editing existing job
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        salary_min: job.salary_min || undefined,
        salary_max: job.salary_max || undefined,
        location: job.location,
        job_type: job.job_type,
        experience_level: job.experience_level,
        company_id: job.company_id,
        expires_at: job.expires_at || undefined,
      })
    }
  }, [job])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let result

      if (job) {
        // Update existing job
        result = await jobsApi.updateJob(job.id, formData as UpdateJobData)
      } else {
        // Create new job (assuming current user is posting)
        result = await jobsApi.createJob(formData, "2") // Mock user ID
      }

      if (result.success && result.job) {
        onSuccess?.(result.job)
      } else {
        setError(result.error || "Operation failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof CreateJobData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loadingCompanies) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{job ? "Edit Job" : "Create New Job"}</CardTitle>
        <CardDescription>
          {job ? "Update the job details below" : "Fill in the details to post a new job"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Frontend Developer"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select value={formData.company_id} onValueChange={(value) => updateFormData("company_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_type">Job Type</Label>
              <Select value={formData.job_type} onValueChange={(value: any) => updateFormData("job_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select
                value={formData.experience_level}
                onValueChange={(value: any) => updateFormData("experience_level", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. San Francisco, CA (Remote OK)"
              value={formData.location}
              onChange={(e) => updateFormData("location", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Minimum Salary</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder="e.g. 80000"
                value={formData.salary_min || ""}
                onChange={(e) =>
                  updateFormData("salary_min", e.target.value ? Number.parseInt(e.target.value) : undefined)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_max">Maximum Salary</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder="e.g. 120000"
                value={formData.salary_max || ""}
                onChange={(e) =>
                  updateFormData("salary_max", e.target.value ? Number.parseInt(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="List the required skills, experience, and qualifications..."
              value={formData.requirements}
              onChange={(e) => updateFormData("requirements", e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_at">Application Deadline (Optional)</Label>
            <Input
              id="expires_at"
              type="date"
              value={formData.expires_at ? formData.expires_at.toISOString().split("T")[0] : ""}
              onChange={(e) => updateFormData("expires_at", e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? (job ? "Updating..." : "Creating...") : job ? "Update Job" : "Create Job"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
