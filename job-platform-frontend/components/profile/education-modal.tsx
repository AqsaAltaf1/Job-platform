"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"
import type { Education } from "@/lib/types"

interface EducationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  education?: Education | null
}

export function EducationModal({ isOpen, onClose, onSave, education }: EducationModalProps) {
  const [formData, setFormData] = useState({
    institution_name: "",
    degree: "",
    field_of_study: "",
    description: "",
    start_date: "",
    end_date: "",
    is_current: false,
    location: "",
    gpa: "",
    activities: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      if (education) {
        setFormData({
          institution_name: education.institution_name || "",
          degree: education.degree || "",
          field_of_study: education.field_of_study || "",
          description: education.description || "",
          start_date: education.start_date ? new Date(education.start_date).toISOString().split('T')[0] : "",
          end_date: education.end_date ? new Date(education.end_date).toISOString().split('T')[0] : "",
          is_current: education.is_current || false,
          location: education.location || "",
          gpa: education.gpa ? education.gpa.toString() : "",
          activities: education.activities || "",
        })
      } else {
        setFormData({
          institution_name: "",
          degree: "",
          field_of_study: "",
          description: "",
          start_date: "",
          end_date: "",
          is_current: false,
          location: "",
          gpa: "",
          activities: "",
        })
      }
    }
  }, [isOpen, education])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = education ? `http://localhost:5000/api/educations/${education.id}` : 'http://localhost:5000/api/educations'
      const method = education ? 'PUT' : 'POST'
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (data.success) {
        onSave()
      } else {
        setError(data.error || 'Failed to save education')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save education')
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
            {education ? 'Edit Education' : 'Add Education'}
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
              <Label htmlFor="institution_name">Institution Name *</Label>
              <Input
                id="institution_name"
                placeholder="e.g., Stanford University, MIT"
                value={formData.institution_name}
                onChange={(e) => updateFormData("institution_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                placeholder="e.g., Bachelor of Science, Master of Arts"
                value={formData.degree}
                onChange={(e) => updateFormData("degree", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_of_study">Field of Study</Label>
            <Input
              id="field_of_study"
              placeholder="e.g., Computer Science, Business Administration"
              value={formData.field_of_study}
              onChange={(e) => updateFormData("field_of_study", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your education, achievements, or relevant coursework..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => updateFormData("start_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => updateFormData("end_date", e.target.value)}
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
            <Label htmlFor="is_current">I am currently studying here</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Stanford, CA"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="e.g., 3.8"
                value={formData.gpa}
                onChange={(e) => updateFormData("gpa", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activities">Activities & Achievements</Label>
            <Textarea
              id="activities"
              placeholder="List any relevant activities, clubs, honors, or achievements..."
              value={formData.activities}
              onChange={(e) => updateFormData("activities", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : education ? "Update Education" : "Add Education"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
