'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Eye, 
  Heart, 
  HeartOff,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  Star,
  Mail,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  job_type: string;
  location: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  status: string;
  posted_at: string;
  employerProfile: {
    company_name: string;
    company_logo: string;
  };
}

interface Application {
  id: string;
  status: string;
  applied_at: string;
  cover_letter: string;
  expected_salary: string;
  interview_scheduled_at?: string;
  interview_notes?: string;
  employer_notes?: string;
  rating?: number;
  job: Job;
}

interface SavedJob {
  id: string;
  saved_at: string;
  notes?: string;
  job: Job;
}

interface DashboardStats {
  profileViews: number;
  appliedJobs: number;
  invitations: number;
  profileReviews: number;
  profileViewsData: Array<{ month: string; views: number }>;
  applicationStatus: {
    rejected: number;
    accepted: number;
    interview: number;
    pending: number;
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interview: 'bg-indigo-100 text-indigo-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Pending',
  reviewing: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview Scheduled',
  hired: 'Hired',
  rejected: 'Rejected'
};

export default function CandidateDashboard() {
  const { user, loading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    profileViews: 0,
    appliedJobs: 0,
    invitations: 0,
    profileReviews: 0,
    profileViewsData: [],
    applicationStatus: {
      rejected: 0,
      accepted: 0,
      interview: 0,
      pending: 0
    }
  });
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    if (user && user.role === 'candidate') {
      fetchApplications();
      fetchSavedJobs();
      fetchDashboardStats();
    }
  }, [user]);

  // Update dashboard stats when applications change
  useEffect(() => {
    if (applications.length > 0) {
      fetchDashboardStats();
    }
  }, [applications]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(getApiUrl('/candidate/applications'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data.applications || []);
      } else {
        throw new Error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch(getApiUrl('/candidate/saved-jobs'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data.data.savedJobs || []);
      } else {
        throw new Error('Failed to fetch saved jobs');
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoadingSavedJobs(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      
      // Fetch dashboard statistics from API
      const response = await fetch(getApiUrl('/candidate/dashboard-stats'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.stats);
      } else {
        // Fallback to calculated data from applications if API fails
        const applicationStatus = {
          rejected: applications.filter(app => app.status === 'rejected').length,
          accepted: applications.filter(app => app.status === 'hired').length,
          interview: applications.filter(app => app.status === 'interview').length,
          pending: applications.filter(app => app.status === 'pending' || app.status === 'reviewing' || app.status === 'shortlisted').length
        };
        
        const fallbackStats: DashboardStats = {
          profileViews: 0, // This would need to be tracked separately
          appliedJobs: applications.length,
          invitations: 0, // This would need to be fetched from invitations API
          profileReviews: 0, // This would need to be fetched from reviews API
          profileViewsData: [
            { month: 'Jan', views: 0 },
            { month: 'Feb', views: 0 },
            { month: 'Mar', views: 0 },
            { month: 'Apr', views: 0 },
            { month: 'May', views: 0 },
            { month: 'Jun', views: 0 }
          ],
          applicationStatus
        };
        
        setDashboardStats(fallbackStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Fallback to calculated data from applications
      const applicationStatus = {
        rejected: applications.filter(app => app.status === 'rejected').length,
        accepted: applications.filter(app => app.status === 'hired').length,
        interview: applications.filter(app => app.status === 'interview').length,
        pending: applications.filter(app => app.status === 'pending' || app.status === 'reviewing' || app.status === 'shortlisted').length
      };
      
      const fallbackStats: DashboardStats = {
        profileViews: 0,
        appliedJobs: applications.length,
        invitations: 0,
        profileReviews: 0,
        profileViewsData: [
          { month: 'Jan', views: 0 },
          { month: 'Feb', views: 0 },
          { month: 'Mar', views: 0 },
          { month: 'Apr', views: 0 },
          { month: 'May', views: 0 },
          { month: 'Jun', views: 0 }
        ],
        applicationStatus
      };
      
      setDashboardStats(fallbackStats);
    } finally {
      setLoadingStats(false);
    }
  };

  const unsaveJob = async (jobId: string) => {
    try {
      const response = await fetch(getApiUrl(`/jobs/${jobId}/save`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSavedJobs(savedJobs.filter(saved => saved.job.id !== jobId));
        toast.success('Job removed from saved jobs');
      } else {
        throw new Error('Failed to unsave job');
      }
    } catch (error) {
      console.error('Error unsaving job:', error);
      toast.error('Failed to remove job from saved jobs');
    }
  };

  const updateJobNotes = async (jobId: string, notes: string) => {
    try {
      const response = await fetch(getApiUrl(`/jobs/${jobId}/save/notes`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        setSavedJobs(savedJobs.map(saved => 
          saved.job.id === jobId ? { ...saved, notes } : saved
        ));
        toast.success('Notes updated successfully');
        setEditingNotes(null);
      } else {
        throw new Error('Failed to update notes');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    try {
      const response = await fetch(getApiUrl(`/applications/${applicationId}/withdraw`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status: 'withdrawn' } : app
        ));
        toast.success('Application withdrawn successfully');
      } else {
        throw new Error('Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error('Failed to withdraw application');
    }
  };

  const formatSalary = (min: string, max: string, currency: string) => {
    if (!min && !max) return 'Not specified';
    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);
    
    if (minNum && maxNum) {
      return `${currency} ${minNum.toLocaleString()} - ${maxNum.toLocaleString()}`;
    } else if (minNum) {
      return `${currency} ${minNum.toLocaleString()}+`;
    } else if (maxNum) {
      return `Up to ${currency} ${maxNum.toLocaleString()}`;
    }
    return 'Not specified';
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'candidate') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              This dashboard is only available for candidates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Profile Views */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.profileViews.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applied Jobs */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applied Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.appliedJobs}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invitations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Invitations</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.invitations}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Reviews */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.profileReviews}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Views Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">MY PROFILE VIEWS</CardTitle>
              </div>
              <Select defaultValue="6months">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Last Month</SelectItem>
                  <SelectItem value="3months" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Last 3 Months</SelectItem>
                  <SelectItem value="6months" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Last 6 Months</SelectItem>
                  <SelectItem value="1year" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {dashboardStats.profileViewsData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary/80"
                    style={{ height: `${(data.views / 600) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500</span>
              <span>600</span>
            </div>
          </CardContent>
        </Card>

        {/* Application Status Pie Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">APPLICATION STATUS</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="relative w-48 h-48">
                {/* Pie Chart SVG */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Rejected - Red */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="20"
                    strokeDasharray={`${(dashboardStats.applicationStatus.rejected / 40) * 251.2} 251.2`}
                    strokeDashoffset="0"
                  />
                  {/* Accepted - Green */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="20"
                    strokeDasharray={`${(dashboardStats.applicationStatus.accepted / 40) * 251.2} 251.2`}
                    strokeDashoffset={`-${(dashboardStats.applicationStatus.rejected / 40) * 251.2}`}
                  />
                  {/* Interview - Primary Blue */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="20"
                    strokeDasharray={`${(dashboardStats.applicationStatus.interview / 40) * 251.2} 251.2`}
                    strokeDashoffset={`-${((dashboardStats.applicationStatus.rejected + dashboardStats.applicationStatus.accepted) / 40) * 251.2}`}
                  />
                  {/* Pending - Orange */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="20"
                    strokeDasharray={`${(dashboardStats.applicationStatus.pending / 40) * 251.2} 251.2`}
                    strokeDashoffset={`-${((dashboardStats.applicationStatus.rejected + dashboardStats.applicationStatus.accepted + dashboardStats.applicationStatus.interview) / 40) * 251.2}`}
                  />
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats.applicationStatus.rejected + dashboardStats.applicationStatus.accepted + dashboardStats.applicationStatus.interview + dashboardStats.applicationStatus.pending}
                    </p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Rejected ({dashboardStats.applicationStatus.rejected})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Accepted ({dashboardStats.applicationStatus.accepted})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
                <span className="text-sm text-gray-600">Interview ({dashboardStats.applicationStatus.interview})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending ({dashboardStats.applicationStatus.pending})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
