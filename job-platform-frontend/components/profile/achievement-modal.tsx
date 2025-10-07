'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Save, X } from 'lucide-react'

interface Achievement {
  id?: string
  title: string
  description: string
  category: 'professional' | 'academic' | 'personal' | 'award' | 'project'
  impact: string
  metrics?: string
  date?: string
  isVisible: boolean
  priority: number
}

interface AchievementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (achievement: Achievement) => void
  achievement?: Achievement | null
  saving?: boolean
}

export default function AchievementModal({ 
  isOpen, 
  onClose, 
  onSave, 
  achievement, 
  saving = false 
}: AchievementModalProps) {
  const [formData, setFormData] = useState<Achievement>({
    title: '',
    description: '',
    category: 'professional',
    impact: '',
    metrics: '',
    date: '',
    isVisible: true,
    priority: 1
  })

  useEffect(() => {
    if (achievement) {
      setFormData(achievement)
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'professional',
        impact: '',
        metrics: '',
        date: '',
        isVisible: true,
        priority: 1
      })
    }
  }, [achievement, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.impact) {
      return
    }
    onSave(formData)
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'professional',
      impact: '',
      metrics: '',
      date: '',
      isVisible: true,
      priority: 1
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {achievement ? 'Edit Achievement' : 'Add New Achievement'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Achievement Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Led Development of E-commerce Platform"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="professional">Professional</option>
                <option value="academic">Academic</option>
                <option value="personal">Personal</option>
                <option value="award">Award</option>
                <option value="project">Project</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you accomplished and how you did it..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="impact">Impact *</Label>
            <Textarea
              id="impact"
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              placeholder="What was the impact or result of this achievement?"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="metrics">Metrics (Optional)</Label>
              <Input
                id="metrics"
                value={formData.metrics}
                onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                placeholder="e.g., 40% revenue increase, 10,000+ users"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isVisible">Make this achievement visible to employers</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !formData.title || !formData.description || !formData.impact}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Achievement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
