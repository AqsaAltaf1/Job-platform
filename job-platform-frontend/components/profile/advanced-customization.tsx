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

// Create ImageIcon component since it's not available in lucide-react
const ImageIcon = ({ className }: { className?: string }) => (
  <Image className={className} />
)
import { showToast } from '@/lib/toast'
import { getApiUrl } from '@/lib/config'
import PortfolioItemModal from './portfolio-item-modal'
import WorkSampleModal from './work-sample-modal'

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
    if (user?.id) {
      fetchCustomizationData()
    }
  }, [user?.id]) // Only depend on user ID to prevent unnecessary re-fetches

  const fetchCustomizationData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwt_token')
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
        console.error('Failed to fetch customization data:', response.status)
        showToast.error('Failed to load customization data')
        setPortfolioItems([])
        setWorkSamples([])
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
      const token = localStorage.getItem('jwt_token')
      const url = item.id 
        ? getApiUrl(`/candidate/portfolio-item/${item.id}`)
        : getApiUrl('/candidate/portfolio-item')
      const response = await fetch(url, {
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
      const token = localStorage.getItem('jwt_token')
      const url = sample.id 
        ? getApiUrl(`/candidate/work-sample/${sample.id}`)
        : getApiUrl('/candidate/work-sample')
      const response = await fetch(url, {
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

  const deletePortfolioItem = async (id: string) => {
    try {
      const token = localStorage.getItem('jwt_token')
      const response = await fetch(getApiUrl(`/candidate/portfolio-item/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        showToast.success('Portfolio item deleted successfully')
        fetchCustomizationData()
      } else {
        showToast.error('Failed to delete portfolio item')
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error)
      showToast.error('Failed to delete portfolio item')
    }
  }

  const deleteWorkSample = async (id: string) => {
    try {
      const token = localStorage.getItem('jwt_token')
      const response = await fetch(getApiUrl(`/candidate/work-sample/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        showToast.success('Work sample deleted successfully')
        fetchCustomizationData()
      } else {
        showToast.error('Failed to delete work sample')
      }
    } catch (error) {
      console.error('Error deleting work sample:', error)
      showToast.error('Failed to delete work sample')
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


          {/* Portfolio Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken images and show placeholder instead
                        e.currentTarget.style.display = 'none'
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement
                        if (placeholder) {
                          placeholder.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full flex items-center justify-center text-gray-400"
                    style={{ display: item.thumbnail_url ? 'none' : 'flex' }}
                  >
                    <ImageIcon className="h-12 w-12" />
                  </div>
                </div>
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
                        onClick={() => item.id && deletePortfolioItem(item.id)}
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
                        onClick={() => sample.id && deleteWorkSample(sample.id)}
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

      {/* Modals */}
      <PortfolioItemModal
        isOpen={showAddPortfolio || !!editingPortfolio}
        onClose={() => {
          setShowAddPortfolio(false)
          setEditingPortfolio(null)
        }}
        onSave={savePortfolioItem}
        item={editingPortfolio}
        saving={saving}
      />

      <WorkSampleModal
        isOpen={showAddWorkSample || !!editingWorkSample}
        onClose={() => {
          setShowAddWorkSample(false)
          setEditingWorkSample(null)
        }}
        onSave={saveWorkSample}
        sample={editingWorkSample}
        saving={saving}
      />
    </div>
  )
}
