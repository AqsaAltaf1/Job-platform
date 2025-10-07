'use client'

import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Kanban, 
  Users, 
  Briefcase, 
  BarChart3, 
  Settings,
  Filter,
  Download,
  Plus,
  Search,
  Eye,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Info,
  ArrowLeft,
  Zap,
  Heart,
  Brain,
  Code,
  Palette,
  Database,
  PieChart,
  Bell,
  Share,
  Copy,
  Link as LinkIcon,
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
  Move,
  GripVertical,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import KanbanBoard from '@/components/employer/kanban-board'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getApiUrl } from '@/lib/config'

export default function EmployerKanban() {
  const [activeTab, setActiveTab] = useState('pipeline')
  const [stats, setStats] = useState({
    totalApplications: 0,
    inPipeline: 0,
    hiredThisMonth: 0,
    avgTimeToHire: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/employer/all-applications'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.applications) {
          const applications = data.applications
          const totalApplications = applications.length
          const inPipeline = applications.filter(app => 
            ['reviewed', 'interview_scheduled', 'interviewed', 'shortlisted', 'offered'].includes(app.status)
          ).length
          const hiredThisMonth = applications.filter(app => 
            app.status === 'hired' && 
            new Date(app.applied_at).getMonth() === new Date().getMonth()
          ).length
          
          setStats({
            totalApplications,
            inPipeline,
            hiredThisMonth,
            avgTimeToHire: 28 // This would need to be calculated from actual data
          })
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Application Pipeline</h1>
              <p className="text-gray-600">
                Visualize and manage your hiring pipeline with drag-and-drop Kanban boards
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/employer/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold text-primary">{stats.totalApplications}</p>
                    )}
                  </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Pipeline</p>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold text-primary">{stats.inPipeline}</p>
                    )}
                  </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hired This Month</p>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold text-primary">{stats.hiredThisMonth}</p>
                    )}
                  </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold text-primary">{stats.avgTimeToHire} days</p>
                    )}
                  </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Pipeline View
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Pipeline View Tab */}
          <TabsContent value="pipeline">
            <KanbanBoard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pipeline Flow */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Pipeline Flow
                  </CardTitle>
                  <CardDescription>
                    Track application movement through your hiring stages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No pipeline data available</p>
                      <p className="text-sm text-gray-400">Applications will appear here once candidates apply</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Key hiring performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No performance data available</p>
                    <p className="text-sm text-gray-400">Metrics will appear as you process applications</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates in your hiring pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Activity will appear as you manage applications</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pipeline Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Pipeline Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize your hiring pipeline stages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Applied</p>
                        <p className="text-xs text-gray-600">New applications</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={50} className="w-16 px-2 py-1 border rounded text-sm" />
                        <span className="text-xs text-gray-600">limit</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Screening</p>
                        <p className="text-xs text-gray-600">Initial review</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={20} className="w-16 px-2 py-1 border rounded text-sm" />
                        <span className="text-xs text-gray-600">limit</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Interview</p>
                        <p className="text-xs text-gray-600">Interview stage</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={15} className="w-16 px-2 py-1 border rounded text-sm" />
                        <span className="text-xs text-gray-600">limit</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Shortlisted</p>
                        <p className="text-xs text-gray-600">Final candidates</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={10} className="w-16 px-2 py-1 border rounded text-sm" />
                        <span className="text-xs text-gray-600">limit</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>

              {/* Automation Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Automation Rules
                  </CardTitle>
                  <CardDescription>
                    Set up automatic actions for your pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Auto-move to Screening</p>
                        <p className="text-xs text-gray-600">After 24 hours in Applied</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Send Interview Reminder</p>
                        <p className="text-xs text-gray-600">24 hours before interview</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Auto-reject Inactive</p>
                        <p className="text-xs text-gray-600">After 7 days without activity</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Notify on High Priority</p>
                        <p className="text-xs text-gray-600">Immediate notification</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    Save Rules
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Team Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Permissions
                </CardTitle>
                <CardDescription>
                  Manage who can access and modify the pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">John Smith</p>
                        <p className="text-xs text-gray-600">Hiring Manager</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Sarah Wilson</p>
                        <p className="text-xs text-gray-600">Recruiter</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">View & Edit</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Mike Johnson</p>
                        <p className="text-xs text-gray-600">Interviewer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">View Only</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
