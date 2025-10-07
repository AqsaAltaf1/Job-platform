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
  Star, 
  Award, 
  Briefcase, 
  GraduationCap,
  Trophy,
  Target,
  Lightbulb,
  Users,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { getApiUrl } from '@/lib/config'

interface Achievement {
  id: string
  title: string
  description: string
  category: 'professional' | 'academic' | 'personal' | 'award' | 'project'
  impact: string
  metrics?: string
  date: string
  isVisible: boolean
  priority: number
}

interface NarrativeSection {
  id: string
  title: string
  content: string
  isVisible: boolean
  order: number
}

export default function NarrativeControl() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [narrativeSections, setNarrativeSections] = useState<NarrativeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddAchievement, setShowAddAchievement] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [editingSection, setEditingSection] = useState<NarrativeSection | null>(null)

  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    category: 'professional' as const,
    impact: '',
    metrics: '',
    date: '',
    isVisible: true,
    priority: 1
  })

  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
    isVisible: true,
    order: 1
  })

  useEffect(() => {
    if (user) {
      fetchNarrativeData()
    }
  }, [user])

  const fetchNarrativeData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/candidate/narrative-data'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAchievements(data.data.achievements || [])
        setNarrativeSections(data.data.sections || [])
      } else {
        // Mock data for now
        setAchievements([
          {
            id: '1',
            title: 'Led Development of E-commerce Platform',
            description: 'Successfully led a team of 5 developers to build a scalable e-commerce platform serving 10,000+ users',
            category: 'professional',
            impact: 'Increased company revenue by 40% and improved user satisfaction scores',
            metrics: '40% revenue increase, 10,000+ users, 5 team members',
            date: '2023-06-01',
            isVisible: true,
            priority: 1
          },
          {
            id: '2',
            title: 'Best Innovation Award 2023',
            description: 'Received company-wide recognition for innovative solution to customer onboarding process',
            category: 'award',
            impact: 'Reduced customer onboarding time by 60% and improved conversion rates',
            metrics: '60% time reduction, 25% conversion improvement',
            date: '2023-12-15',
            isVisible: true,
            priority: 2
          }
        ])
        setNarrativeSections([
          {
            id: '1',
            title: 'Professional Philosophy',
            content: 'I believe in building technology that solves real-world problems and creates meaningful impact. My approach combines technical excellence with user-centered design, always keeping the end user in mind.',
            isVisible: true,
            order: 1
          },
          {
            id: '2',
            title: 'Leadership Style',
            content: 'I lead by example and believe in empowering team members to reach their full potential. My leadership philosophy centers around clear communication, setting ambitious but achievable goals, and fostering a collaborative environment.',
            isVisible: true,
            order: 2
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching narrative data:', error)
      showToast.error('Failed to load narrative data')
    } finally {
      setLoading(false)
    }
  }

  const saveAchievement = async (achievement: Achievement) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/candidate/achievement'), {
        method: achievement.id ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(achievement)
      })

      if (response.ok) {
        showToast.success(`Achievement ${achievement.id ? 'updated' : 'added'} successfully`)
        fetchNarrativeData()
        setShowAddAchievement(false)
        setEditingAchievement(null)
        setNewAchievement({
          title: '',
          description: '',
          category: 'professional',
          impact: '',
          metrics: '',
          date: '',
          isVisible: true,
          priority: 1
        })
      } else {
        showToast.error('Failed to save achievement')
      }
    } catch (error) {
      console.error('Error saving achievement:', error)
      showToast.error('Failed to save achievement')
    } finally {
      setSaving(false)
    }
  }

  const saveSection = async (section: NarrativeSection) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/candidate/narrative-section'), {
        method: section.id ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(section)
      })

      if (response.ok) {
        showToast.success(`Section ${section.id ? 'updated' : 'added'} successfully`)
        fetchNarrativeData()
        setShowAddSection(false)
        setEditingSection(null)
        setNewSection({
          title: '',
          content: '',
          isVisible: true,
          order: 1
        })
      } else {
        showToast.error('Failed to save section')
      }
    } catch (error) {
      console.error('Error saving section:', error)
      showToast.error('Failed to save section')
    } finally {
      setSaving(false)
    }
  }

  const deleteAchievement = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/candidate/achievement/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        showToast.success('Achievement deleted successfully')
        fetchNarrativeData()
      } else {
        showToast.error('Failed to delete achievement')
      }
    } catch (error) {
      console.error('Error deleting achievement:', error)
      showToast.error('Failed to delete achievement')
    }
  }

  const deleteSection = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/candidate/narrative-section/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        showToast.success('Section deleted successfully')
        fetchNarrativeData()
      } else {
        showToast.error('Failed to delete section')
      }
    } catch (error) {
      console.error('Error deleting section:', error)
      showToast.error('Failed to delete section')
    }
  }

  const toggleAchievementVisibility = async (id: string, isVisible: boolean) => {
    const achievement = achievements.find(a => a.id === id)
    if (achievement) {
      await saveAchievement({ ...achievement, isVisible })
    }
  }

  const toggleSectionVisibility = async (id: string, isVisible: boolean) => {
    const section = narrativeSections.find(s => s.id === id)
    if (section) {
      await saveSection({ ...section, isVisible })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional': return <Briefcase className="h-4 w-4" />
      case 'academic': return <GraduationCap className="h-4 w-4" />
      case 'personal': return <Users className="h-4 w-4" />
      case 'award': return <Trophy className="h-4 w-4" />
      case 'project': return <Target className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional': return 'bg-blue-100 text-blue-800'
      case 'academic': return 'bg-green-100 text-green-800'
      case 'personal': return 'bg-purple-100 text-purple-800'
      case 'award': return 'bg-yellow-100 text-yellow-800'
      case 'project': return 'bg-orange-100 text-orange-800'
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
          <h2 className="text-2xl font-bold text-gray-900">Narrative Control</h2>
          <p className="text-gray-600 mt-1">
            Highlight your achievements and tell your professional story
          </p>
        </div>
      </div>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="narrative">Professional Narrative</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Achievements</h3>
            <Button onClick={() => setShowAddAchievement(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </div>

          {/* Add/Edit Achievement Form */}
          {(showAddAchievement || editingAchievement) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Achievement Title *</Label>
                    <Input
                      id="title"
                      value={editingAchievement?.title || newAchievement.title}
                      onChange={(e) => {
                        if (editingAchievement) {
                          setEditingAchievement({ ...editingAchievement, title: e.target.value })
                        } else {
                          setNewAchievement({ ...newAchievement, title: e.target.value })
                        }
                      }}
                      placeholder="e.g., Led Development of E-commerce Platform"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={editingAchievement?.category || newAchievement.category}
                      onChange={(e) => {
                        if (editingAchievement) {
                          setEditingAchievement({ ...editingAchievement, category: e.target.value as any })
                        } else {
                          setNewAchievement({ ...newAchievement, category: e.target.value as any })
                        }
                      }}
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
                    value={editingAchievement?.description || newAchievement.description}
                    onChange={(e) => {
                      if (editingAchievement) {
                        setEditingAchievement({ ...editingAchievement, description: e.target.value })
                      } else {
                        setNewAchievement({ ...newAchievement, description: e.target.value })
                      }
                    }}
                    placeholder="Describe what you accomplished and how you did it..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="impact">Impact *</Label>
                  <Textarea
                    id="impact"
                    value={editingAchievement?.impact || newAchievement.impact}
                    onChange={(e) => {
                      if (editingAchievement) {
                        setEditingAchievement({ ...editingAchievement, impact: e.target.value })
                      } else {
                        setNewAchievement({ ...newAchievement, impact: e.target.value })
                      }
                    }}
                    placeholder="What was the impact or result of this achievement?"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="metrics">Metrics (Optional)</Label>
                    <Input
                      id="metrics"
                      value={editingAchievement?.metrics || newAchievement.metrics}
                      onChange={(e) => {
                        if (editingAchievement) {
                          setEditingAchievement({ ...editingAchievement, metrics: e.target.value })
                        } else {
                          setNewAchievement({ ...newAchievement, metrics: e.target.value })
                        }
                      }}
                      placeholder="e.g., 40% revenue increase, 10,000+ users"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editingAchievement?.date || newAchievement.date}
                      onChange={(e) => {
                        if (editingAchievement) {
                          setEditingAchievement({ ...editingAchievement, date: e.target.value })
                        } else {
                          setNewAchievement({ ...newAchievement, date: e.target.value })
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={editingAchievement?.isVisible ?? newAchievement.isVisible}
                    onChange={(e) => {
                      if (editingAchievement) {
                        setEditingAchievement({ ...editingAchievement, isVisible: e.target.checked })
                      } else {
                        setNewAchievement({ ...newAchievement, isVisible: e.target.checked })
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="isVisible">Make this achievement visible to employers</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (editingAchievement) {
                        saveAchievement(editingAchievement)
                      } else {
                        saveAchievement({
                          ...newAchievement,
                          id: Date.now().toString()
                        })
                      }
                    }}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Achievement'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddAchievement(false)
                      setEditingAchievement(null)
                      setNewAchievement({
                        title: '',
                        description: '',
                        category: 'professional',
                        impact: '',
                        metrics: '',
                        date: '',
                        isVisible: true,
                        priority: 1
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements List */}
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(achievement.category)}
                        <h4 className="text-lg font-semibold">{achievement.title}</h4>
                        <Badge className={getCategoryColor(achievement.category)}>
                          {achievement.category}
                        </Badge>
                        {achievement.isVisible ? (
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
                      
                      <p className="text-gray-600 mb-3">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Impact:</span>
                          <span className="text-sm text-gray-600">{achievement.impact}</span>
                        </div>
                        
                        {achievement.metrics && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Metrics:</span>
                            <span className="text-sm text-gray-600">{achievement.metrics}</span>
                          </div>
                        )}
                        
                        {achievement.date && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Date:</span>
                            <span className="text-sm text-gray-600">
                              {new Date(achievement.date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAchievementVisibility(achievement.id, !achievement.isVisible)}
                      >
                        {achievement.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAchievement(achievement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAchievement(achievement.id)}
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

        {/* Narrative Tab */}
        <TabsContent value="narrative" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Professional Narrative</h3>
            <Button onClick={() => setShowAddSection(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {/* Add/Edit Section Form */}
          {(showAddSection || editingSection) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sectionTitle">Section Title *</Label>
                  <Input
                    id="sectionTitle"
                    value={editingSection?.title || newSection.title}
                    onChange={(e) => {
                      if (editingSection) {
                        setEditingSection({ ...editingSection, title: e.target.value })
                      } else {
                        setNewSection({ ...newSection, title: e.target.value })
                      }
                    }}
                    placeholder="e.g., Professional Philosophy"
                  />
                </div>

                <div>
                  <Label htmlFor="sectionContent">Content *</Label>
                  <Textarea
                    id="sectionContent"
                    value={editingSection?.content || newSection.content}
                    onChange={(e) => {
                      if (editingSection) {
                        setEditingSection({ ...editingSection, content: e.target.value })
                      } else {
                        setNewSection({ ...newSection, content: e.target.value })
                      }
                    }}
                    placeholder="Write your professional narrative here..."
                    rows={6}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sectionVisible"
                    checked={editingSection?.isVisible ?? newSection.isVisible}
                    onChange={(e) => {
                      if (editingSection) {
                        setEditingSection({ ...editingSection, isVisible: e.target.checked })
                      } else {
                        setNewSection({ ...newSection, isVisible: e.target.checked })
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="sectionVisible">Make this section visible to employers</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (editingSection) {
                        saveSection(editingSection)
                      } else {
                        saveSection({
                          ...newSection,
                          id: Date.now().toString()
                        })
                      }
                    }}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Section'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddSection(false)
                      setEditingSection(null)
                      setNewSection({
                        title: '',
                        content: '',
                        isVisible: true,
                        order: 1
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sections List */}
          <div className="space-y-4">
            {narrativeSections.map((section) => (
              <Card key={section.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="text-lg font-semibold">{section.title}</h4>
                        {section.isVisible ? (
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
                      
                      <p className="text-gray-600 whitespace-pre-wrap">{section.content}</p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSectionVisibility(section.id, !section.isVisible)}
                      >
                        {section.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSection(section)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSection(section.id)}
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

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Use your professional narrative to tell your story beyond just your resume. Share your values, approach to work, and what drives you professionally. This helps employers understand not just what you've done, but who you are.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
