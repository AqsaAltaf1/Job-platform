'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Upload, Image as ImageIcon, X } from 'lucide-react'

interface PortfolioItem {
  id?: string
  title: string
  description: string
  type: 'project' | 'article' | 'video' | 'presentation' | 'certificate'
  url?: string
  file_url?: string
  thumbnail_url?: string
  technologies?: string[]
  isVisible: boolean
  order: number
}

interface PortfolioItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: PortfolioItem) => void
  item: PortfolioItem | null
  saving: boolean
}

export default function PortfolioItemModal({ isOpen, onClose, onSave, item, saving }: PortfolioItemModalProps) {
  const [formData, setFormData] = useState<PortfolioItem>({
    title: '',
    description: '',
    type: 'project',
    url: '',
    file_url: '',
    thumbnail_url: '',
    technologies: [],
    isVisible: true,
    order: 1
  })

  const [technologiesInput, setTechnologiesInput] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    if (item) {
      setFormData(item)
      setTechnologiesInput(item.technologies?.join(', ') || '')
      setImagePreview(item.thumbnail_url || null)
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'project',
        url: '',
        file_url: '',
        thumbnail_url: '',
        technologies: [],
        isVisible: true,
        order: 1
      })
      setTechnologiesInput('')
      setImagePreview(null)
    }
    setImageFile(null)
  }, [item, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }))
  }

  const handleTechnologiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTechnologiesInput(value)
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
    setFormData(prev => ({
      ...prev,
      technologies
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      setImageFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload the image to the server
      try {
        const formData = new FormData()
        formData.append('image', file)
        
        const token = localStorage.getItem('jwt_token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/portfolio-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          setFormData(prev => ({
            ...prev,
            thumbnail_url: result.data.imageUrl
          }))
        } else {
          console.error('Failed to upload image')
          alert('Failed to upload image. Please try again.')
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Error uploading image. Please try again.')
      }
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({
      ...prev,
      thumbnail_url: ''
    }))
  }

  const handleSubmit = () => {
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}</DialogTitle>
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
              placeholder="e.g., E-commerce Platform" 
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
              <option value="project">Project</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="presentation">Presentation</option>
              <option value="certificate">Certificate</option>
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
              placeholder="Describe your portfolio item..." 
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

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Portfolio Image
            </Label>
            <div className="col-span-3 space-y-3">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Portfolio preview" 
                    className="w-32 h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Upload Button */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('imageUpload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </Button>
                <span className="text-sm text-gray-500">Max 5MB, JPG/PNG/GIF</span>
              </div>
              
              {/* Fallback URL Input */}
              <div>
                <Label htmlFor="thumbnail_url" className="text-sm text-gray-600">
                  Or enter image URL:
                </Label>
                <Input 
                  id="thumbnail_url" 
                  value={formData.thumbnail_url || ''} 
                  onChange={handleChange} 
                  className="mt-1" 
                  placeholder="https://example.com/image.jpg" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="technologies" className="text-right">
              Technologies
            </Label>
            <Input 
              id="technologies" 
              value={technologiesInput} 
              onChange={handleTechnologiesChange} 
              className="col-span-3" 
              placeholder="React, Node.js, PostgreSQL (comma-separated)" 
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
            {saving ? 'Saving...' : 'Save Portfolio Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
