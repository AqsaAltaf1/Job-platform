'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  Star,
  Eye,
  MessageSquare,
  FileText,
  Download,
  Filter,
  Search,
  Plus,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Edit,
  Trash2,
  Archive,
  Send,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Timer,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Heart,
  Brain,
  Code,
  Palette,
  BarChart3,
  PieChart,
  Database,
  Settings,
  Bell,
  Share,
  Copy,
  Link as LinkIcon,
  ArrowRight,
  ArrowLeft,
  Move,
  GripVertical
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { getApiUrl } from '@/lib/config'

interface Application {
  id: string
  candidate: {
    id: string
    name: string
    email: string
    avatar?: string
    location: string
    experience_years: number
    current_role: string
    skills: string[]
    education: string
    phone?: string
  }
  job: {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary_range?: string
  }
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
  applied_date: string
  last_activity: string
  notes: string[]
  attachments: Array<{
    name: string
    url: string
    type: string
  }>
  interview_schedule?: {
    date: string
    time: string
    type: 'phone' | 'video' | 'in-person'
    interviewer: string
    location?: string
  }
  score: {
    overall: number
    skills: number
    experience: number
    culture_fit: number
  }
  tags: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  source: string
  referral?: string
}

interface KanbanColumn {
  id: string
  title: string
  status: Application['status']
  color: string
  applications: Application[]
  limit?: number
}

const KANBAN_COLUMNS: Omit<KanbanColumn, 'applications'>[] = [
  { id: 'pending', title: 'Applied', status: 'pending', color: 'bg-gray-100 border-gray-300', limit: 50 },
  { id: 'reviewed', title: 'Screening', status: 'reviewed', color: 'bg-blue-100 border-blue-300', limit: 20 },
  { id: 'interview_scheduled', title: 'Interview Scheduled', status: 'interview_scheduled', color: 'bg-yellow-100 border-yellow-300', limit: 15 },
  { id: 'interviewed', title: 'Interviewed', status: 'interviewed', color: 'bg-indigo-100 border-indigo-300', limit: 15 },
  { id: 'shortlisted', title: 'Shortlisted', status: 'shortlisted', color: 'bg-purple-100 border-purple-300', limit: 10 },
  { id: 'offered', title: 'Offered', status: 'offered', color: 'bg-orange-100 border-orange-300', limit: 5 },
  { id: 'hired', title: 'Hired', status: 'hired', color: 'bg-green-100 border-green-300', limit: 10 },
  { id: 'rejected', title: 'Rejected', status: 'rejected', color: 'bg-red-100 border-red-300', limit: 100 }
]

export default function KanbanBoard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [draggedApplication, setDraggedApplication] = useState<Application | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user, selectedJob])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Try to fetch real applications first
      try {
        console.log('Fetching applications from:', getApiUrl('/employer/all-applications'))
        console.log('Using token:', token ? 'Token exists' : 'No token')
        
        const response = await fetch(getApiUrl('/employer/all-applications'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)

        if (response.ok) {
          const data = await response.json()
          console.log('API Response data:', data)
          if (data.success && data.applications) {
            // Transform backend applications to frontend format
            const transformedApplications: Application[] = data.applications.map((app: any) => ({
              id: app.id,
              candidate: {
                id: app.candidate_id,
                name: app.candidate_name || 'Unknown Candidate',
                email: app.candidate_email || 'unknown@email.com',
                avatar: '/api/placeholder/40/40',
                location: app.candidate_location || 'Unknown Location',
                experience_years: app.experience_years || 0,
                current_role: 'Unknown Role', // Not provided by backend
                skills: [], // Not provided by backend
                education: 'Unknown Education', // Not provided by backend
                phone: app.candidate_phone
              },
              job: {
                id: app.job_id,
                title: app.job_title || 'Unknown Job',
                company: 'Unknown Company', // Not provided by backend
                location: 'Unknown Location', // Not provided by backend
                type: 'Full-time', // Not provided by backend
                salary_range: app.expected_salary ? `$${app.expected_salary}` : undefined
              },
              status: app.status,
              applied_date: app.applied_at,
              last_activity: app.applied_at, // Backend doesn't provide updated_at
              notes: app.employer_notes ? [app.employer_notes] : [],
              attachments: app.resume_url ? [{ name: 'resume.pdf', url: app.resume_url, type: 'resume' }] : [],
              score: {
                overall: app.rating || 3.0,
                skills: 3.5,
                experience: 3.0,
                culture_fit: 3.5
              },
              tags: [],
              priority: 'medium',
              source: 'direct'
            }))
            
            setApplications(transformedApplications)
            organizeApplicationsIntoColumns(transformedApplications)
            console.log('Successfully loaded', transformedApplications.length, 'applications from API')
            return
          } else {
            console.log('API response not successful or no applications:', data)
          }
        } else {
          const errorData = await response.json()
          console.log('API error response:', errorData)
        }
      } catch (apiError) {
        console.log('API fetch failed:', apiError)
        showToast.error('Failed to load applications from server')
      }
      
      // No fallback to mock data - only show real applications
      setApplications([])
      organizeApplicationsIntoColumns([])
    } catch (error) {
      console.error('Error fetching applications:', error)
      showToast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const organizeApplicationsIntoColumns = (apps: Application[]) => {
    const organizedColumns = KANBAN_COLUMNS.map(column => ({
      ...column,
      applications: apps.filter(app => app.status === column.status)
    }))
    setColumns(organizedColumns)
  }

  const handleDragStart = (e: React.DragEvent, application: Application) => {
    setDraggedApplication(application)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: Application['status']) => {
    e.preventDefault()
    
    if (!draggedApplication) return

    try {
      // Update application status via API
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/applications/${draggedApplication.id}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: targetStatus,
          notes: `Status updated via Kanban board`
        })
      })

      if (response.ok) {
        // Update local state
        const updatedApplications = applications.map(app => 
          app.id === draggedApplication.id 
            ? { ...app, status: targetStatus, last_activity: new Date().toISOString().split('T')[0] }
            : app
        )

        setApplications(updatedApplications)
        organizeApplicationsIntoColumns(updatedApplications)
        setDraggedApplication(null)

        // Show success message
        showToast.success(`Moved ${draggedApplication.candidate.name} to ${targetStatus}`)
      } else {
        const errorData = await response.json()
        showToast.error(errorData.error || 'Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      showToast.error('Failed to update application status')
    }
  }

  const getPriorityColor = (priority: Application['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100'
    if (score >= 3.5) return 'text-blue-600 bg-blue-100'
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const filteredApplications = applications.filter(app => {
    const matchesJob = selectedJob === 'all' || app.job.id === selectedJob
    const matchesSearch = searchTerm === '' || 
      app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || app.priority === filterPriority
    
    return matchesJob && matchesSearch && matchesPriority
  })

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
          <h2 className="text-2xl font-bold text-gray-900">Application Pipeline</h2>
          <p className="text-gray-600 mt-1">
            Manage and track job applications through your hiring pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={fetchApplications}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Job</label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Jobs</option>
                  <option value="j1">Senior Full Stack Developer</option>
                  <option value="j2">Frontend Developer</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedJob('all')
                    setFilterPriority('all')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 ${column.color} rounded-lg border-2 p-4`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{column.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {column.applications.length}
                  {column.limit && `/${column.limit}`}
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Applications */}
            <div className="space-y-3 min-h-[200px]">
              {column.applications
                .filter(app => filteredApplications.includes(app))
                .map(application => (
                <Card
                  key={application.id}
                  className="cursor-move hover:shadow-md transition-shadow bg-white"
                  draggable
                  onDragStart={(e) => handleDragStart(e, application)}
                >
                  <CardContent className="p-4">
                    {/* Candidate Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={application.candidate.avatar} />
                          <AvatarFallback>
                            {application.candidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-sm">{application.candidate.name}</h4>
                          <p className="text-xs text-gray-600">{application.candidate.current_role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={`text-xs ${getPriorityColor(application.priority)}`}>
                          {application.priority}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-800">{application.job.title}</p>
                      <p className="text-xs text-gray-600">{application.job.company}</p>
                    </div>

                    {/* Score */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Overall Score</span>
                        <Badge className={`text-xs ${getScoreColor(application.score.overall)}`}>
                          {application.score.overall}/5
                        </Badge>
                      </div>
                      <Progress value={application.score.overall * 20} className="h-1" />
                    </div>

                    {/* Skills */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {application.candidate.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {application.candidate.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.candidate.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(application.applied_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {application.candidate.location.split(',')[0]}
                      </div>
                    </div>

                    {/* Interview Schedule */}
                    {application.interview_schedule && (
                      <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center gap-2 text-xs text-blue-800">
                          <Calendar className="h-3 w-3" />
                          <span className="font-medium">Interview Scheduled</span>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          {application.interview_schedule.date} at {application.interview_schedule.time}
                        </p>
                        <p className="text-xs text-blue-600">
                          {application.interview_schedule.type} with {application.interview_schedule.interviewer}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" title="View Profile">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Send Message">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" title="View Resume">
                          <FileText className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Application Button */}
            <Button 
              variant="ghost" 
              className="w-full mt-3 border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{applications.length}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {applications.filter(app => ['interview', 'shortlisted', 'offer'].includes(app.status)).length}
              </p>
              <p className="text-sm text-gray-600">In Pipeline</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'hired').length}
              </p>
              <p className="text-sm text-gray-600">Hired</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {applications.filter(app => app.priority === 'high' || app.priority === 'urgent').length}
              </p>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Kanban Tips:</strong> Drag and drop applications between columns to update their status. 
          Use filters to focus on specific jobs or priorities. Click on candidate cards for detailed information.
        </AlertDescription>
      </Alert>
    </div>
  )
}
