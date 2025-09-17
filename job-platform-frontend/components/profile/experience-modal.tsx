"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"
import type { Experience } from "@/lib/types"

interface ExperienceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  experience?: Experience | null
}

export function ExperienceModal({ isOpen, onClose, onSave, experience }: ExperienceModalProps) {
  const [formData, setFormData] = useState({
    company_name: "",
    role: "",
    description: "",
    from_date: "",
    to_date: "",
    is_current: false,
    location: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      if (experience) {
        setFormData({
          company_name: experience.company_name || "",
          role: experience.role || "",
          description: experience.description || "",
          from_date: experience.from_date ? new Date(experience.from_date).toISOString().split('T')[0] : "",
          to_date: experience.to_date ? new Date(experience.to_date).toISOString().split('T')[0] : "",
          is_current: experience.is_current || false,
          location: experience.location || "",
        })
      } else {
        setFormData({
          company_name: "",
          role: "",
          description: "",
          from_date: "",
          to_date: "",
          is_current: false,
          location: "",
        })
      }
    }
  }, [isOpen, experience])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = experience ? `http://localhost:5000/api/experiences/${experience.id}` : 'http://localhost:5000/api/experiences'
      const method = experience ? 'PUT' : 'POST'
      
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
        onSave()
      } else {
        setError(data.error || 'Failed to save experience')
      }
    } catch (error) {
      setError('Failed to save experience')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {experience ? 'Edit Experience' : 'Add Experience'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                placeholder="e.g., Google, Microsoft"
                value={formData.company_name}
                onChange={(e) => updateFormData("company_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Job Title *</Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer, Product Manager"
                value={formData.role}
                onChange={(e) => updateFormData("role", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your role and responsibilities..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_date">Start Date *</Label>
              <Input
                id="from_date"
                type="date"
                value={formData.from_date}
                onChange={(e) => updateFormData("from_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_date">End Date</Label>
              <Input
                id="to_date"
                type="date"
                value={formData.to_date}
                onChange={(e) => updateFormData("to_date", e.target.value)}
                disabled={formData.is_current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) => updateFormData("is_current", checked)}
            />
            <Label htmlFor="is_current">I currently work here</Label>
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

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : experience ? "Update Experience" : "Add Experience"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
