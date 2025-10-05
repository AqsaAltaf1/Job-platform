'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  Building,
  Clock,
  Search,
  Eye,
  ExternalLink,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  ArrowLeft,
  Star,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { getApiUrl } from '@/lib/config';
import Link from 'next/link';

interface JobApplicationsPageProps {
  params: {
    id: string;
  };
}

interface Application {
  id: string;
  status: string;
  cover_letter: string;
  expected_salary: number;
  salary_currency: string;
  availability_date: string;
  resume_url: string;
  portfolio_url: string;
  rating: number;
  notes: string;
  created_at: string;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  candidateProfile: {
    id: string;
    job_title: string;
    experience_years: number;
    skills: string[];
    location: string;
  };
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  job_type: string;
  work_arrangement: string;
  employerProfile: {
    company_name: string;
  };
}

export default function JobApplicationsPage({ params }: JobApplicationsPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'employer' && user.role !== 'team_member') {
      router.push('/jobs');
      return;
    }

    loadJobAndApplications();
  }, [user, params.id, statusFilter]);

  const loadJobAndApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      // Load job details
      const jobResponse = await fetch(getApiUrl(`/jobs/${params.id}`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const jobData = await jobResponse.json();
      
      if (!jobData.success) {
        showToast.error('Job not found or access denied');
        router.push('/jobs/manage');
        return;
      }
      setJob(jobData.job);

      // Load applications
      const params_obj = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') {
        params_obj.append('status', statusFilter);
      }

      const appsResponse = await fetch(getApiUrl(`/jobs/${params.id}/applications?${params_obj}`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const appsData = await appsResponse.json();
      
      if (appsData.success) {
        setApplications(appsData.applications);
      } else {
        showToast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Load error:', error);
      showToast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, rating?: number, notes?: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('jwt_token');
      
      const updateData: any = { status };
      if (rating) updateData.rating = rating;
      if (notes) updateData.notes = notes;

      const response = await fetch(getApiUrl(`/applications/${applicationId}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.success) {
        showToast.success('Application status updated');
        loadJobAndApplications();
        setSelectedApplication(null);
      } else {
        showToast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast.error('Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interview_scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'interviewed': return 'bg-cyan-100 text-cyan-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'shortlisted': return <CheckCircle className="h-4 w-4" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      case 'interviewed': return <Users className="h-4 w-4" />;
      case 'offered': return <CheckCircle className="h-4 w-4" />;
      case 'hired': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'withdrawn': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredApplications = applications.filter(app =>
    app.candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidateProfile?.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Job not found</h3>
            <Button asChild>
              <Link href="/jobs/manage">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/jobs/manage">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600 mt-2">{job.employerProfile.company_name} • {applications.length} applications</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/jobs/${params.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Job
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/jobs/${params.id}/edit`}>
                  Edit Job
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired'].map(status => (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 capitalize">
                      {status.replace('_', ' ')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications.filter(app => app.status === status).length}
                    </p>
                  </div>
                  {getStatusIcon(status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'No candidates have applied for this position yet.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.candidate.first_name} {application.candidate.last_name}
                        </h3>
                        <Badge className={getStatusColor(application.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(application.status)}
                            {application.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        </Badge>
                        {application.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{application.rating}/5</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {application.candidate.email}
                        </div>
                        
                        {application.candidateProfile?.job_title && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4" />
                            {application.candidateProfile.job_title}
                          </div>
                        )}
                        
                        {application.candidateProfile?.experience_years && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {application.candidateProfile.experience_years} years exp.
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          Applied {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {application.expected_salary && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <DollarSign className="h-4 w-4" />
                          Expected: {application.salary_currency} {application.expected_salary.toLocaleString()}
                        </div>
                      )}

                      {application.cover_letter && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {application.cover_letter.substring(0, 150)}...
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {application.resume_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Resume
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {selectedApplication.candidate.first_name} {selectedApplication.candidate.last_name}
                </CardTitle>
                <CardDescription>
                  Application for {job.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cover Letter */}
                <div>
                  <h4 className="font-semibold mb-2">Cover Letter</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedApplication.cover_letter}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewed')}
                    disabled={updating}
                  >
                    Mark Reviewed
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'shortlisted')}
                    disabled={updating}
                  >
                    Shortlist
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    disabled={updating}
                    variant="outline"
                  >
                    Reject
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedApplication(null)}
                  >
                    Close
                  </Button>
                  {selectedApplication.resume_url && (
                    <Button asChild>
                      <a href={selectedApplication.resume_url} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
