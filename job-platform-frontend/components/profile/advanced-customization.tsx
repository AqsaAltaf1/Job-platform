'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Link, 
  FileText, 
  Image, 
  Video,
  Code,
  Globe,
  Github,
  ExternalLink,
  Save,
  Eye,
  EyeOff,
  Download,
  Star,
  Award
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { getApiUrl } from '@/lib/config'

interface PortfolioItem {
  id: string
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

interface WorkSample {
  id: string
  title: string
  description: string
  type: 'code' | 'design' | 'writing' | 'analysis' | 'other'
  url?: string
  file_url?: string
  skills_demonstrated: string[]
  isVisible: boolean
  order: number
}

export default function AdvancedCustomization() {
  const { user } = useAuth()
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [workSamples, setWorkSamples] = useState<WorkSample[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddPortfolio, setShowAddPortfolio] = useState(false)
  const [showAddWorkSample, setShowAddWorkSample] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null)
  const [editingWorkSample, setEditingWorkSample] = useState<WorkSample | null>(null)

  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    type: 'project' as const,
    url: '',
    file_url: '',
    thumbnail_url: '',
    technologies: [] as string[],
    isVisible: true,
    order: 1
  })

  const [newWorkSample, setNewWorkSample] = useState({
    title: '',
    description: '',
    type: 'code' as const,
    url: '',
    file_url: '',
    skills_demonstrated: [] as string[],
    isVisible: true,
    order: 1
  })

  useEffect(() => {
    if (user) {
      fetchCustomizationData()
    }
  }, [user])

  const fetchCustomizationData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/candidate/customization-data'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPortfolioItems(data.data.portfolio || [])
        setWorkSamples(data.data.workSamples || [])
      } else {
        // Mock data for now
        setPortfolioItems([
          {
            id: '1',
            title: 'E-commerce Platform',
            description: 'Full-stack e-commerce platform built with React, Node.js, and PostgreSQL',
            type: 'project',
            url: 'https://github.com/user/ecommerce-platform',
            thumbnail_url: '/api/placeholder/400/300',
            technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
            isVisible: true,
            order: 1
          }
        ])
        setWorkSamples([
          {
            id: '1',
            title: 'API Design Documentation',
            description: 'Comprehensive API documentation for RESTful services',
            type: 'writing',
            url: 'https://docs.example.com/api',
            skills_demonstrated: ['Technical Writing', 'API Design', 'Documentation'],
            isVisible: true,
            order: 1
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching customization data:', error)
      showToast.error('Failed to load customization data')
    } finally {
      setLoading(false)
    }
  }

  const savePortfolioItem = async (item: PortfolioItem) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/candidate/portfolio-item'), {
        method: item.id ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })

      if (response.ok) {
        showToast.success(`Portfolio item ${item.id ? 'updated' : 'added'} successfully`)
        fetchCustomizationData()
        setShowAddPortfolio(false)
        setEditingPortfolio(null)
        resetPortfolioForm()
      } else {
        showToast.error('Failed to save portfolio item')
      }
    } catch (error) {
      console.error('Error saving portfolio item:', error)
      showToast.error('Failed to save portfolio item')
    } finally {
      setSaving(false)
    }
  }

  const saveWorkSample = async (sample: WorkSample) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/candidate/work-sample'), {
        method: sample.id ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sample)
      })

      if (response.ok) {
        showToast.success(`Work sample ${sample.id ? 'updated' : 'added'} successfully`)
        fetchCustomizationData()
        setShowAddWorkSample(false)
        setEditingWorkSample(null)
        resetWorkSampleForm()
      } else {
        showToast.error('Failed to save work sample')
      }
    } catch (error) {
      console.error('Error saving work sample:', error)
      showToast.error('Failed to save work sample')
    } finally {
      setSaving(false)
    }
  }

  const resetPortfolioForm = () => {
    setNewPortfolio({
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
  }

  const resetWorkSampleForm = () => {
    setNewWorkSample({
      title: '',
      description: '',
      type: 'code',
      url: '',
      file_url: '',
      skills_demonstrated: [],
      isVisible: true,
      order: 1
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <Code className="h-4 w-4" />
      case 'article': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'presentation': return <Image className="h-4 w-4" />
      case 'certificate': return <Award className="h-4 w-4" />
      case 'code': return <Code className="h-4 w-4" />
      case 'design': return <Image className="h-4 w-4" />
      case 'writing': return <FileText className="h-4 w-4" />
      case 'analysis': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-800'
      case 'article': return 'bg-green-100 text-green-800'
      case 'video': return 'bg-red-100 text-red-800'
      case 'presentation': return 'bg-purple-100 text-purple-800'
      case 'certificate': return 'bg-yellow-100 text-yellow-800'
      case 'code': return 'bg-gray-100 text-gray-800'
      case 'design': return 'bg-pink-100 text-pink-800'
      case 'writing': return 'bg-indigo-100 text-indigo-800'
      case 'analysis': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Profile Customization</h2>
          <p className="text-gray-600 mt-1">
            Showcase your work with portfolio items and work samples
          </p>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="work-samples">Work Samples</TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Portfolio Items</h3>
            <Button onClick={() => setShowAddPortfolio(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Portfolio Item
            </Button>
          </div>

          {/* Add/Edit Portfolio Form */}
          {(showAddPortfolio || editingPortfolio) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingPortfolio ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="portfolioTitle">Title *</Label>
                    <Input
                      id="portfolioTitle"
                      value={editingPortfolio?.title || newPortfolio.title}
                      onChange={(e) => {
                        if (editingPortfolio) {
                          setEditingPortfolio({ ...editingPortfolio, title: e.target.value })
                        } else {
                          setNewPortfolio({ ...newPortfolio, title: e.target.value })
                        }
                      }}
                      placeholder="e.g., E-commerce Platform"
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolioType">Type</Label>
                    <select
                      id="portfolioType"
                      value={editingPortfolio?.type || newPortfolio.type}
                      onChange={(e) => {
                        if (editingPortfolio) {
                          setEditingPortfolio({ ...editingPortfolio, type: e.target.value as any })
                        } else {
                          setNewPortfolio({ ...newPortfolio, type: e.target.value as any })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="project">Project</option>
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="presentation">Presentation</option>
                      <option value="certificate">Certificate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="portfolioDescription">Description *</Label>
                  <Textarea
                    id="portfolioDescription"
                    value={editingPortfolio?.description || newPortfolio.description}
                    onChange={(e) => {
                      if (editingPortfolio) {
                        setEditingPortfolio({ ...editingPortfolio, description: e.target.value })
                      } else {
                        setNewPortfolio({ ...newPortfolio, description: e.target.value })
                      }
                    }}
                    placeholder="Describe your project, what you built, and the technologies used..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="portfolioUrl">URL (Optional)</Label>
                    <Input
                      id="portfolioUrl"
                      type="url"
                      value={editingPortfolio?.url || newPortfolio.url}
                      onChange={(e) => {
                        if (editingPortfolio) {
                          setEditingPortfolio({ ...editingPortfolio, url: e.target.value })
                        } else {
                          setNewPortfolio({ ...newPortfolio, url: e.target.value })
                        }
                      }}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolioThumbnail">Thumbnail URL (Optional)</Label>
                    <Input
                      id="portfolioThumbnail"
                      type="url"
                      value={editingPortfolio?.thumbnail_url || newPortfolio.thumbnail_url}
                      onChange={(e) => {
                        if (editingPortfolio) {
                          setEditingPortfolio({ ...editingPortfolio, thumbnail_url: e.target.value })
                        } else {
                          setNewPortfolio({ ...newPortfolio, thumbnail_url: e.target.value })
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="portfolioTechnologies">Technologies (comma-separated)</Label>
                  <Input
                    id="portfolioTechnologies"
                    value={(editingPortfolio?.technologies || newPortfolio.technologies).join(', ')}
                    onChange={(e) => {
                      const technologies = e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      if (editingPortfolio) {
                        setEditingPortfolio({ ...editingPortfolio, technologies })
                      } else {
                        setNewPortfolio({ ...newPortfolio, technologies })
                      }
                    }}
                    placeholder="React, Node.js, PostgreSQL, Stripe"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="portfolioVisible"
                    checked={editingPortfolio?.isVisible ?? newPortfolio.isVisible}
                    onChange={(e) => {
                      if (editingPortfolio) {
                        setEditingPortfolio({ ...editingPortfolio, isVisible: e.target.checked })
                      } else {
                        setNewPortfolio({ ...newPortfolio, isVisible: e.target.checked })
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="portfolioVisible">Make this portfolio item visible to employers</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (editingPortfolio) {
                        savePortfolioItem(editingPortfolio)
                      } else {
                        savePortfolioItem({
                          ...newPortfolio,
                          id: Date.now().toString()
                        })
                      }
                    }}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Portfolio Item'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddPortfolio(false)
                      setEditingPortfolio(null)
                      resetPortfolioForm()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {item.thumbnail_url && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPortfolio(item)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* Delete function */}}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                    {item.isVisible ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Eye className="h-3 w-3 mr-1" />
                        Visible
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hidden
                      </Badge>
                    )}
                  </div>
                  
                  {item.technologies && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {item.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {item.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Work Samples Tab */}
        <TabsContent value="work-samples" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work Samples</h3>
            <Button onClick={() => setShowAddWorkSample(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Work Sample
            </Button>
          </div>

          {/* Add/Edit Work Sample Form */}
          {(showAddWorkSample || editingWorkSample) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingWorkSample ? 'Edit Work Sample' : 'Add New Work Sample'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sampleTitle">Title *</Label>
                    <Input
                      id="sampleTitle"
                      value={editingWorkSample?.title || newWorkSample.title}
                      onChange={(e) => {
                        if (editingWorkSample) {
                          setEditingWorkSample({ ...editingWorkSample, title: e.target.value })
                        } else {
                          setNewWorkSample({ ...newWorkSample, title: e.target.value })
                        }
                      }}
                      placeholder="e.g., API Design Documentation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sampleType">Type</Label>
                    <select
                      id="sampleType"
                      value={editingWorkSample?.type || newWorkSample.type}
                      onChange={(e) => {
                        if (editingWorkSample) {
                          setEditingWorkSample({ ...editingWorkSample, type: e.target.value as any })
                        } else {
                          setNewWorkSample({ ...newWorkSample, type: e.target.value as any })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="code">Code</option>
                      <option value="design">Design</option>
                      <option value="writing">Writing</option>
                      <option value="analysis">Analysis</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sampleDescription">Description *</Label>
                  <Textarea
                    id="sampleDescription"
                    value={editingWorkSample?.description || newWorkSample.description}
                    onChange={(e) => {
                      if (editingWorkSample) {
                        setEditingWorkSample({ ...editingWorkSample, description: e.target.value })
                      } else {
                        setNewWorkSample({ ...newWorkSample, description: e.target.value })
                      }
                    }}
                    placeholder="Describe your work sample and what it demonstrates..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="sampleUrl">URL (Optional)</Label>
                  <Input
                    id="sampleUrl"
                    type="url"
                    value={editingWorkSample?.url || newWorkSample.url}
                    onChange={(e) => {
                      if (editingWorkSample) {
                        setEditingWorkSample({ ...editingWorkSample, url: e.target.value })
                      } else {
                        setNewWorkSample({ ...newWorkSample, url: e.target.value })
                      }
                    }}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="sampleSkills">Skills Demonstrated (comma-separated)</Label>
                  <Input
                    id="sampleSkills"
                    value={(editingWorkSample?.skills_demonstrated || newWorkSample.skills_demonstrated).join(', ')}
                    onChange={(e) => {
                      const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      if (editingWorkSample) {
                        setEditingWorkSample({ ...editingWorkSample, skills_demonstrated: skills })
                      } else {
                        setNewWorkSample({ ...newWorkSample, skills_demonstrated: skills })
                      }
                    }}
                    placeholder="Technical Writing, API Design, Documentation"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sampleVisible"
                    checked={editingWorkSample?.isVisible ?? newWorkSample.isVisible}
                    onChange={(e) => {
                      if (editingWorkSample) {
                        setEditingWorkSample({ ...editingWorkSample, isVisible: e.target.checked })
                      } else {
                        setNewWorkSample({ ...newWorkSample, isVisible: e.target.checked })
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="sampleVisible">Make this work sample visible to employers</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (editingWorkSample) {
                        saveWorkSample(editingWorkSample)
                      } else {
                        saveWorkSample({
                          ...newWorkSample,
                          id: Date.now().toString()
                        })
                      }
                    }}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Work Sample'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddWorkSample(false)
                      setEditingWorkSample(null)
                      resetWorkSampleForm()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Samples List */}
          <div className="space-y-4">
            {workSamples.map((sample) => (
              <Card key={sample.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(sample.type)}
                        <h4 className="text-lg font-semibold">{sample.title}</h4>
                        <Badge className={getTypeColor(sample.type)}>
                          {sample.type}
                        </Badge>
                        {sample.isVisible ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Visible
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{sample.description}</p>
                      
                      {sample.skills_demonstrated && sample.skills_demonstrated.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {sample.skills_demonstrated.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {sample.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(sample.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Sample
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingWorkSample(sample)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Delete function */}}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Alert>
        <Star className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Showcase your best work with high-quality portfolio items and work samples. This helps employers understand your capabilities beyond your resume and gives them concrete examples of your skills in action.
        </AlertDescription>
      </Alert>
    </div>
  )
}
