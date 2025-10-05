'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Clock, 
  Eye, 
  UserPlus,
  FileText,
  Calendar,
  Activity,
  BarChart3,
  PlusCircle,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MapPin,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';
import Link from 'next/link';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  hiredCandidates: number;
  teamMembers: number;
  jobViews: number;
}

interface RecentApplication {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  job_id: string;
  status: string;
  applied_at: string;
  rating?: number;
  expected_salary?: string;
}

interface RecentJob {
  id: string;
  title: string;
  status: string;
  applications_count: number;
  views_count: number;
  created_at: string;
  job_type: string;
  location: string;
}

interface TeamActivity {
  id: string;
  member_name: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'job_created' | 'application_reviewed' | 'candidate_hired' | 'team_invited';
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
  shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
  interview: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  hired: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  paused: 'bg-orange-100 text-orange-800 border-orange-200',
  closed: 'bg-red-100 text-red-800 border-red-200'
};

export default function EmployerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'employer' && user.role !== 'team_member') {
        router.push('/jobs');
        return;
      }
      loadDashboardData();
    }
  }, [user, loading]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');
      
      // Load all dashboard data in parallel
      const [statsRes, applicationsRes, jobsRes] = await Promise.all([
        fetch(getApiUrl('/employer/dashboard-stats'), {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(getApiUrl('/employer/recent-applications'), {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(getApiUrl('/employer/recent-jobs'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (applicationsRes.ok) {
        const data = await applicationsRes.json();
        setRecentApplications(data.applications || []);
      }

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setRecentJobs(data.jobs || []);
      }

      // Mock team activity for now (can be replaced with real API)
      setTeamActivity([
        {
          id: '1',
          member_name: 'John Smith',
          action: 'created job',
          target: 'Senior Developer',
          timestamp: new Date().toISOString(),
          type: 'job_created'
        },
        {
          id: '2',
          member_name: 'Sarah Johnson',
          action: 'reviewed application',
          target: 'Frontend Developer',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'application_reviewed'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'employer' && user.role !== 'team_member')) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Access denied. This dashboard is only available for employers and team members.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your jobs, applications, and team in one place
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/jobs/post">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Post New Job
              </Button>
            </Link>
            <Link href="/jobs/manage">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats?.totalJobs || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeJobs || 0} active
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">{stats?.totalApplications || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingApplications || 0} pending
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hired</p>
                <p className="text-2xl font-bold">{stats?.hiredCandidates || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.shortlistedApplications || 0} shortlisted
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Size</p>
                <p className="text-2xl font-bold">{stats?.teamMembers || 1}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.jobViews || 0} job views
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="team">Team Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Pipeline Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Application Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Review</span>
                    <span className="text-sm font-medium">{stats?.pendingApplications || 0}</span>
                  </div>
                  <Progress value={((stats?.pendingApplications || 0) / Math.max(stats?.totalApplications || 1, 1)) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Shortlisted</span>
                    <span className="text-sm font-medium">{stats?.shortlistedApplications || 0}</span>
                  </div>
                  <Progress value={((stats?.shortlistedApplications || 0) / Math.max(stats?.totalApplications || 1, 1)) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hired</span>
                    <span className="text-sm font-medium">{stats?.hiredCandidates || 0}</span>
                  </div>
                  <Progress value={((stats?.hiredCandidates || 0) / Math.max(stats?.totalApplications || 1, 1)) * 100} className="h-2" />
                </div>
                <div className="mt-4">
                  <Link href="/employer/applications">
                    <Button variant="outline" className="w-full">
                      View Application Pipeline
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/jobs/post">
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1">
                      <PlusCircle className="h-5 w-5" />
                      <span className="text-xs">Post Job</span>
                    </Button>
                  </Link>
                  <Link href="/employer/candidates">
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1">
                      <Users className="h-5 w-5" />
                      <span className="text-xs">View Candidates</span>
                    </Button>
                  </Link>
                  <Link href="/team/dashboard">
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1">
                      <UserPlus className="h-5 w-5" />
                      <span className="text-xs">Manage Team</span>
                    </Button>
                  </Link>
                  <Link href="/employer/analytics">
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-xs">Analytics</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground">
                    Applications will appear here once candidates start applying to your jobs.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {application.candidate_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{application.candidate_name}</p>
                          <p className="text-sm text-muted-foreground">{application.job_title}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied {formatTimeAgo(application.applied_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {application.expected_salary && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{application.expected_salary}</p>
                            <p className="text-xs text-muted-foreground">Expected</p>
                          </div>
                        )}
                        <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        <Link href={`/jobs/${application.job_id}/applications`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recent Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Jobs Posted</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by posting your first job opening.
                  </p>
                  <Link href="/jobs/post">
                    <Button>Post Your First Job</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {job.job_type}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Posted {formatTimeAgo(job.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{job.applications_count}</p>
                          <p className="text-xs text-muted-foreground">Applications</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{job.views_count}</p>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                        <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                        <Link href={`/jobs/${job.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Team Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                  <p className="text-muted-foreground">
                    Team activity will appear here as your team members take actions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {activity.member_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.member_name}</span>
                          {' '}
                          <span className="text-muted-foreground">{activity.action}</span>
                          {' '}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
