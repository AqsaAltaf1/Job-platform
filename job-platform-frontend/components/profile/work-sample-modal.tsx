'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'

interface WorkSample {
  id?: string
  title: string
  description: string
  type: 'code' | 'design' | 'writing' | 'analysis' | 'other'
  url?: string
  file_url?: string
  skills_demonstrated: string[]
  isVisible: boolean
  order: number
}

interface WorkSampleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sample: WorkSample) => void
  sample: WorkSample | null
  saving: boolean
}

export default function WorkSampleModal({ isOpen, onClose, onSave, sample, saving }: WorkSampleModalProps) {
  const [formData, setFormData] = useState<WorkSample>({
    title: '',
    description: '',
    type: 'code',
    url: '',
    file_url: '',
    skills_demonstrated: [],
    isVisible: true,
    order: 1
  })

  const [skillsInput, setSkillsInput] = useState('')

  useEffect(() => {
    if (sample) {
      setFormData(sample)
      setSkillsInput(sample.skills_demonstrated?.join(', ') || '')
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'code',
        url: '',
        file_url: '',
        skills_demonstrated: [],
        isVisible: true,
        order: 1
      })
      setSkillsInput('')
    }
  }, [sample, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSkillsInput(value)
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
    setFormData(prev => ({
      ...prev,
      skills_demonstrated: skills
    }))
  }

  const handleSubmit = () => {
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{sample ? 'Edit Work Sample' : 'Add New Work Sample'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title *
            </Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="col-span-3" 
              placeholder="e.g., API Documentation" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <select
              id="type"
              value={formData.type}
              onChange={handleChange}
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="code">Code</option>
              <option value="design">Design</option>
              <option value="writing">Writing</option>
              <option value="analysis">Analysis</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description *
            </Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="col-span-3" 
              placeholder="Describe your work sample..." 
              rows={3} 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input 
              id="url" 
              value={formData.url || ''} 
              onChange={handleChange} 
              className="col-span-3" 
              placeholder="https://example.com" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file_url" className="text-right">
              File URL
            </Label>
            <Input 
              id="file_url" 
              value={formData.file_url || ''} 
              onChange={handleChange} 
              className="col-span-3" 
              placeholder="https://example.com/file.pdf" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="skills_demonstrated" className="text-right">
              Skills Demonstrated
            </Label>
            <Input 
              id="skills_demonstrated" 
              value={skillsInput} 
              onChange={handleSkillsChange} 
              className="col-span-3" 
              placeholder="Technical Writing, API Design, Documentation (comma-separated)" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isVisible" className="text-right">
              Visible
            </Label>
            <input 
              id="isVisible" 
              type="checkbox" 
              checked={formData.isVisible} 
              onChange={handleChange} 
              className="col-span-3 h-4 w-4" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Work Sample'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
