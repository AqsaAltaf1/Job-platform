'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { getApiUrl } from '@/lib/config'
import AchievementModal from './achievement-modal'
import NarrativeSectionModal from './narrative-section-modal'

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

interface NarrativeSection {
  id?: string
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


  useEffect(() => {
    if (user) {
      fetchNarrativeData()
    }
  }, [user])

  const fetchNarrativeData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwt_token')
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
        console.error('Failed to fetch narrative data:', response.status)
        showToast.error('Failed to load narrative data')
        setAchievements([])
        setNarrativeSections([])
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
      console.log('Saving achievement:', achievement)
      const token = localStorage.getItem('jwt_token')
      const url = achievement.id 
        ? getApiUrl(`/candidate/achievement/${achievement.id}`)
        : getApiUrl('/candidate/achievement')
      const response = await fetch(url, {
        method: achievement.id ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(achievement)
      })

      console.log('Save achievement response status:', response.status)
      if (response.ok) {
        const result = await response.json()
        console.log('Save achievement result:', result)
        showToast.success(`Achievement ${achievement.id ? 'updated' : 'added'} successfully`)
        fetchNarrativeData()
        setShowAddAchievement(false)
        setEditingAchievement(null)
      } else {
        const errorText = await response.text()
        console.error('Save achievement error response:', errorText)
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
      console.log('Saving section:', section)
      const token = localStorage.getItem('jwt_token')
      const url = section.id 
        ? getApiUrl(`/candidate/narrative-section/${section.id}`)
        : getApiUrl('/candidate/narrative-section')
      const response = await fetch(url, {
        method: section.id ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(section)
      })

      console.log('Save section response status:', response.status)
      if (response.ok) {
        const result = await response.json()
        console.log('Save section result:', result)
        showToast.success(`Section ${section.id ? 'updated' : 'added'} successfully`)
        fetchNarrativeData()
        setShowAddSection(false)
        setEditingSection(null)
      } else {
        const errorText = await response.text()
        console.error('Save section error response:', errorText)
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
      const token = localStorage.getItem('jwt_token')
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
      const token = localStorage.getItem('jwt_token')
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
    console.log('Toggling achievement visibility:', { id, isVisible })
    const achievement = achievements.find(a => a.id === id)
    if (achievement) {
      console.log('Found achievement:', achievement)
      await saveAchievement({ ...achievement, isVisible })
    } else {
      console.log('Achievement not found with id:', id)
    }
  }

  const toggleSectionVisibility = async (id: string, isVisible: boolean) => {
    console.log('Toggling section visibility:', { id, isVisible })
    const section = narrativeSections.find(s => s.id === id)
    if (section) {
      console.log('Found section:', section)
      await saveSection({ ...section, isVisible })
    } else {
      console.log('Section not found with id:', id)
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
                        onClick={() => achievement.id && toggleAchievementVisibility(achievement.id, !achievement.isVisible)}
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
                        onClick={() => achievement.id && deleteAchievement(achievement.id)}
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
                        onClick={() => section.id && toggleSectionVisibility(section.id, !section.isVisible)}
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
                        onClick={() => section.id && deleteSection(section.id)}
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

      {/* Modals */}
      <AchievementModal
        isOpen={showAddAchievement || !!editingAchievement}
        onClose={() => {
          setShowAddAchievement(false)
          setEditingAchievement(null)
        }}
        onSave={saveAchievement}
        achievement={editingAchievement}
        saving={saving}
      />

      <NarrativeSectionModal
        isOpen={showAddSection || !!editingSection}
        onClose={() => {
          setShowAddSection(false)
          setEditingSection(null)
        }}
        onSave={saveSection}
        section={editingSection}
        saving={saving}
      />
    </div>
  )
}
