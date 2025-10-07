'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { checkSubscriptionStatus } from '@/lib/subscription-check';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  Users,
  Building,
  Eye,
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Bookmark,
  BookmarkCheck,
  Heart,
  HeartOff,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { getApiUrl } from '@/lib/config';
import Link from 'next/link';

interface JobViewPageProps {
  params: {
    id: string;
  };
}

interface Job {
  id: string;
  employer_profile_id: string;
  posted_by: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  job_type: string;
  work_arrangement: string;
  experience_level: string;
  location: string;
  department: string;
  salary_min: string; // API returns as string
  salary_max: string; // API returns as string
  salary_currency: string;
  salary_period: string;
  skills_required: string[];
  benefits: string;
  application_deadline: string;
  status: string;
  is_featured: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  employerProfile: {
    id: string;
    company_name: string;
    company_display_name: string | null;
    company_logo_url: string | null;
    company_size: string;
    headquarters_location: string | null;
    company_sector: string | null;
  };
  postedBy: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export default function JobViewPage({ params }: JobViewPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    loadJob();
  }, [params.id]);

  useEffect(() => {
    if (user && job) {
      checkEditPermissions();
      if (user.role === 'candidate') {
        checkIfJobSaved();
      }
      setSubscriptionStatus(checkSubscriptionStatus(user));
    }
  }, [user, job]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/jobs/${params.id}`));
      const data = await response.json();
      
      if (data.success) {
        setJob(data.job);
      } else {
        showToast.error('Job not found');
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Load job error:', error);
      showToast.error('Failed to load job');
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkEditPermissions = () => {
    if (!user || !job) return;
    
    // Only employers and team members from the same company can edit
    if (user.role === 'employer' || user.role === 'team_member') {
      setCanEdit(true);
    }
  };

  const checkIfJobSaved = async () => {
    if (!user || user.role !== 'candidate') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/jobs/${params.id}/saved`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.data.isSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleSaveJob = async () => {
    if (!user || user.role !== 'candidate') {
      showToast.error('Only candidates can save jobs');
      return;
    }

    setSavingJob(true);
    try {
      const token = localStorage.getItem('token');
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await fetch(getApiUrl(`/jobs/${params.id}/save`), {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        showToast.success(isSaved ? 'Job removed from saved jobs' : 'Job saved successfully');
      } else {
        throw new Error('Failed to save/unsave job');
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      showToast.error('Failed to save job');
    } finally {
      setSavingJob(false);
    }
  };

  const handleEdit = () => {
    router.push(`/jobs/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(getApiUrl(`/jobs/${params.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        showToast.success('Job deleted successfully');
        router.push('/jobs/manage');
      } else {
        showToast.error(data.error || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Delete job error:', error);
      showToast.error('Failed to delete job');
    }
  };

  const formatSalary = (min: string, max: string, currency: string, period: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);

    if (minNum && maxNum) {
      return `${formatter.format(minNum)} - ${formatter.format(maxNum)} ${period}`;
    } else if (minNum) {
      return `From ${formatter.format(minNum)} ${period}`;
    } else if (maxNum) {
      return `Up to ${formatter.format(maxNum)} ${period}`;
    }
    return 'Salary negotiable';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/jobs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          
          {canEdit && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {job.employerProfile.company_logo_url ? (
              <img 
                src={job.employerProfile.company_logo_url} 
                alt={job.employerProfile.company_name}
                className="w-16 h-16 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              {job.is_featured && (
                <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
              )}
              <Badge className={getStatusColor(job.status)}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{job.employerProfile.company_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{job.job_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{job.views_count} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{job.applications_count} applications</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.responsibilities}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Required */}
          {job.skills_required && job.skills_required.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.benefits}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Job Type</div>
                <div className="text-gray-900">{job.job_type.replace('_', ' ')}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Work Arrangement</div>
                <div className="text-gray-900">{job.work_arrangement.replace('_', ' ')}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Experience Level</div>
                <div className="text-gray-900">{job.experience_level.replace('_', ' ')}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Department</div>
                <div className="text-gray-900">{job.department}</div>
              </div>
              
              {job.application_deadline && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Application Deadline</div>
                  <div className="text-gray-900">
                    {new Date(job.application_deadline).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Company</div>
                <div className="text-gray-900">{job.employerProfile.company_name}</div>
              </div>
              
              {job.employerProfile.company_size && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Company Size</div>
                  <div className="text-gray-900">{job.employerProfile.company_size} employees</div>
                </div>
              )}
              
              {job.employerProfile.headquarters_location && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Headquarters</div>
                  <div className="text-gray-900">{job.employerProfile.headquarters_location}</div>
                </div>
              )}
              
              {job.employerProfile.company_sector && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Industry</div>
                  <div className="text-gray-900">{job.employerProfile.company_sector}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posted By */}
          <Card>
            <CardHeader>
              <CardTitle>Posted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">
                {job.postedBy.first_name} {job.postedBy.last_name}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Posted on {new Date(job.created_at).toLocaleDateString()}
              </div>
              {job.updated_at !== job.created_at && (
                <div className="text-sm text-gray-500">
                  Updated on {new Date(job.updated_at).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {user?.role === 'candidate' && job.status === 'active' && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {subscriptionStatus?.canApplyJobs ? (
                    <Link href={`/jobs/${job.id}/apply`}>
                      <Button className="w-full" size="lg">
                        Apply for this Job
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/pricing">
                      <Button className="w-full" size="lg" variant="outline">
                        Subscribe to Apply for Jobs
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={toggleSaveJob}
                    disabled={savingJob}
                  >
                    {savingJob ? (
                      'Saving...'
                    ) : isSaved ? (
                      <>
                        <HeartOff className="h-4 w-4 mr-2" />
                        Remove from Saved
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-2" />
                        Save Job
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
