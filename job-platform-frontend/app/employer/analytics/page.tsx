'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  GitCompare, 
  UserPlus, 
  Database,
  TrendingUp,
  Target, 
  Award,
  Activity,
  Eye,
  Download,
  Filter,
  Search,
  Plus,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Heart,
  Brain,
  Zap,
  Scale,
  Lightbulb,
  PieChart,
  Clock,
  MapPin,
  Briefcase,
  UserCheck,
  UserX,
  ArrowLeft
} from 'lucide-react'
import CandidateComparison from '@/components/employer/candidate-comparison'
import TeamFitCulture from '@/components/employer/team-fit-culture'
import AdvancedAnalytics from '@/components/employer/advanced-analytics'
import Link from 'next/link'

export default function EmployerAnalytics() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <AuthGuard>
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold mb-2">Advanced Analytics & Insights</h1>
              <p className="text-gray-600">
                Comprehensive tools for candidate evaluation, team fit analysis, and hiring quality metrics
            </p>
          </div>
            <div className="flex gap-2">
              <Link href="/employer/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
            </Button>
              </Link>
          </div>
        </div>
      </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-600">Active Candidates</p>
                  <p className="text-2xl font-bold text-primary">24</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+12% vs last month</span>
            </div>
          </CardContent>
        </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-600">Team Fit Score</p>
                  <p className="text-2xl font-bold text-primary">4.2/5</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+0.3 vs last quarter</span>
            </div>
          </CardContent>
        </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-600">Diversity Index</p>
                  <p className="text-2xl font-bold text-primary">0.78</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+5% vs last quarter</span>
            </div>
          </CardContent>
        </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-600">Hiring Quality</p>
                  <p className="text-2xl font-bold text-primary">4.1/5</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+0.2 vs last quarter</span>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
              Overview
          </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Candidate Comparison
          </TabsTrigger>
            <TabsTrigger value="team-fit" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Team Fit Analysis
          </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Advanced Analytics
          </TabsTrigger>
        </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest hiring activities and candidate interactions
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sarah Johnson hired for Senior Developer role</p>
                        <p className="text-xs text-gray-600">2 hours ago</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Hired</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">3 new candidates viewed your job posting</p>
                        <p className="text-xs text-gray-600">4 hours ago</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Views</Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Michael Chen shortlisted for Full Stack role</p>
                        <p className="text-xs text-gray-600">1 day ago</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Shortlisted</Badge>
                    </div>
                  </div>
              </CardContent>
            </Card>

              {/* Key Insights */}
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations and insights
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Strong Diversity Progress</p>
                          <p className="text-xs text-green-700">Your diversity index has improved by 5% this quarter</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Candidate Quality Trending Up</p>
                          <p className="text-xs text-blue-700">Average candidate quality score increased to 4.1/5</p>
                        </div>
                      </div>
          </div>
                    
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Time to Fill Optimization</p>
                          <p className="text-xs text-orange-700">Consider streamlining your interview process</p>
                        </div>
                      </div>
                    </div>
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks and shortcuts for efficient hiring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setActiveTab('comparison')}
                  >
                    <GitCompare className="h-6 w-6" />
                    <span className="text-sm">Compare Candidates</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setActiveTab('team-fit')}
                  >
                    <UserPlus className="h-6 w-6" />
                    <span className="text-sm">Team Fit Analysis</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <Database className="h-6 w-6" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                  
                  <Link href="/candidates">
                    <Button 
                      variant="outline" 
                      className="h-20 w-full flex flex-col items-center justify-center gap-2"
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Browse Candidates</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidate Comparison Tab */}
          <TabsContent value="comparison">
            <CandidateComparison />
          </TabsContent>

          {/* Team Fit Analysis Tab */}
          <TabsContent value="team-fit">
            <TeamFitCulture />
        </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics">
            <AdvancedAnalytics />
        </TabsContent>
      </Tabs>
    </div>
    </AuthGuard>
  )
}