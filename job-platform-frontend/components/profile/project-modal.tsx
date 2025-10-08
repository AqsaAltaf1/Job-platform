"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"
import type { Project } from "@/lib/types"
import { showToast } from "@/lib/toast"

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  project?: Project | null
}

export function ProjectModal({ isOpen, onClose, onSave, project }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_url: "",
    github_url: "",
    image_url: "",
    technologies: [] as string[],
    start_date: "",
    end_date: "",
  })

  const [newTechnology, setNewTechnology] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          title: project.title || "",
          description: project.description || "",
          project_url: project.project_url || "",
          github_url: project.github_url || "",
          image_url: project.image_url || "",
          technologies: project.technologies || [],
          start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : "",
          end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : "",
        })
      } else {
        setFormData({
          title: "",
          description: "",
          project_url: "",
          github_url: "",
          image_url: "",
          technologies: [],
          start_date: "",
          end_date: "",
        })
      }
    }
  }, [isOpen, project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setValidationErrors({})

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false)
      setError("Please fix the validation errors below")
      return
    }

    try {
      const url = project ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/projects/${project.id}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/projects`
      const method = project ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        showToast.success(project ? 'Project updated successfully!' : 'Project added successfully!')
        onSave()
      } else {
        setError(data.error || 'Failed to save project')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Required field validations
    if (!formData.title.trim()) {
      errors.title = "Project title is required"
    }

    if (!formData.description.trim()) {
      errors.description = "Project description is required"
    } else if (formData.description.trim().length < 20) {
      errors.description = "Description must be at least 20 characters long"
    }

    if (formData.technologies.length === 0) {
      errors.technologies = "At least one technology is required"
    }

    // Date validations
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (startDate >= endDate) {
        errors.end_date = "End date must be after start date"
      }
    }

    // Future date validation
    if (formData.start_date) {
      const startDate = new Date(formData.start_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (startDate > today) {
        errors.start_date = "Start date cannot be in the future"
      }
    }

    if (formData.end_date) {
      const endDate = new Date(formData.end_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (endDate > today) {
        errors.end_date = "End date cannot be in the future"
      }
    }

    // URL validations
    if (formData.project_url && !isValidUrl(formData.project_url)) {
      errors.project_url = "Please enter a valid project URL"
    }

    if (formData.github_url && !isValidUrl(formData.github_url)) {
      errors.github_url = "Please enter a valid GitHub URL"
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      errors.image_url = "Please enter a valid image URL"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()],
      }))
      setNewTechnology("")
    }
  }

  const removeTechnology = (techToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((tech) => tech !== techToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTechnology()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {project ? 'Edit Project' : 'Add Project'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-primary hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="e.g., E-commerce Website, Mobile App"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              className={validationErrors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              required
            />
            {validationErrors.title && (
              <p className="text-sm text-red-600">{validationErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your project, what it does, and your role..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              className={validationErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              rows={3}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-600">{validationErrors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies Used *</Label>
            <div className="flex gap-2">
              <Input
                id="technologies"
                placeholder="Add a technology (e.g., React, Node.js)"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                onKeyPress={handleKeyPress}
                className={validationErrors.technologies ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              <Button type="button" onClick={addTechnology} disabled={!newTechnology.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTechnology(tech)} />
                </Badge>
              ))}
            </div>
            {validationErrors.technologies && (
              <p className="text-sm text-red-600">{validationErrors.technologies}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_url">Live Demo URL</Label>
              <Input
                id="project_url"
                type="url"
                placeholder="https://yourproject.com"
                value={formData.project_url}
                onChange={(e) => updateFormData("project_url", e.target.value)}
                className={validationErrors.project_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validationErrors.project_url && (
                <p className="text-sm text-red-600">{validationErrors.project_url}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                placeholder="https://github.com/username/project"
                value={formData.github_url}
                onChange={(e) => updateFormData("github_url", e.target.value)}
                className={validationErrors.github_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validationErrors.github_url && (
                <p className="text-sm text-red-600">{validationErrors.github_url}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Project Image URL</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://example.com/project-image.jpg"
              value={formData.image_url}
              onChange={(e) => updateFormData("image_url", e.target.value)}
              className={validationErrors.image_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {validationErrors.image_url && (
              <p className="text-sm text-red-600">{validationErrors.image_url}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => updateFormData("start_date", e.target.value)}
                className={validationErrors.start_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validationErrors.start_date && (
                <p className="text-sm text-red-600">{validationErrors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => updateFormData("end_date", e.target.value)}
                className={validationErrors.end_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {validationErrors.end_date && (
                <p className="text-sm text-red-600">{validationErrors.end_date}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="hover:bg-primary hover:text-white hover:border-primary">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
              {loading ? "Saving..." : project ? "Update Project" : "Add Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
