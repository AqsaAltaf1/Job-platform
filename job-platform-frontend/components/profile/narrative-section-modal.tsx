'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Save, X } from 'lucide-react'

interface NarrativeSection {
  id?: string
  title: string
  content: string
  isVisible: boolean
  order: number
}

interface NarrativeSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (section: NarrativeSection) => void
  section?: NarrativeSection | null
  saving?: boolean
}

export default function NarrativeSectionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  section, 
  saving = false 
}: NarrativeSectionModalProps) {
  const [formData, setFormData] = useState<NarrativeSection>({
    title: '',
    content: '',
    isVisible: true,
    order: 1
  })

  useEffect(() => {
    if (section) {
      setFormData(section)
    } else {
      setFormData({
        title: '',
        content: '',
        isVisible: true,
        order: 1
      })
    }
  }, [section, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      return
    }
    onSave(formData)
  }

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      isVisible: true,
      order: 1
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {section ? 'Edit Section' : 'Add New Section'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sectionTitle">Section Title *</Label>
            <Input
              id="sectionTitle"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Professional Philosophy"
              required
            />
          </div>

          <div>
            <Label htmlFor="sectionContent">Content *</Label>
            <Textarea
              id="sectionContent"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your professional narrative here..."
              rows={6}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sectionVisible"
              checked={formData.isVisible}
              onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="sectionVisible">Make this section visible to employers</Label>
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
              disabled={saving || !formData.title || !formData.content}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
