'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  ExternalLink
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
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    if (user && user.role === 'candidate') {
      fetchApplications();
      fetchSavedJobs();
    }
  }, [user]);

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
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">
          Track your job applications and manage your saved jobs
        </p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            My Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Saved Jobs ({savedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-6">
          {loadingApplications ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start applying for jobs to see your applications here
                </p>
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{application.job.title}</h3>
                          <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                            {statusLabels[application.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {application.job.employerProfile.company_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(
                              application.job.salary_min,
                              application.job.salary_max,
                              application.job.salary_currency
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {new Date(application.applied_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${application.job.id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Job
                          </Button>
                        </Link>
                        {application.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => withdrawApplication(application.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>

                    {application.interview_scheduled_at && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                          <Calendar className="h-4 w-4" />
                          Interview Scheduled
                        </div>
                        <p className="text-blue-700 text-sm">
                          {new Date(application.interview_scheduled_at).toLocaleString()}
                        </p>
                        {application.interview_notes && (
                          <p className="text-blue-600 text-sm mt-1">
                            {application.interview_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {application.employer_notes && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="font-medium text-sm mb-1">Employer Notes:</p>
                        <p className="text-sm text-muted-foreground">
                          {application.employer_notes}
                        </p>
                      </div>
                    )}

                    {application.cover_letter && (
                      <div className="border-t pt-4">
                        <p className="font-medium text-sm mb-2">Your Cover Letter:</p>
                        <p className="text-sm text-muted-foreground">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          {loadingSavedJobs ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : savedJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Saved Jobs</h3>
                <p className="text-muted-foreground mb-4">
                  Save interesting jobs to come back to them later
                </p>
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedJobs.map((savedJob) => (
                <Card key={savedJob.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{savedJob.job.title}</h3>
                        <p className="text-muted-foreground mb-2">
                          {savedJob.job.employerProfile.company_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {savedJob.job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(
                              savedJob.job.salary_min,
                              savedJob.job.salary_max,
                              savedJob.job.salary_currency
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Saved {new Date(savedJob.saved_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${savedJob.job.id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Job
                          </Button>
                        </Link>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Notes
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Job Notes</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Add your notes about this job..."
                                value={notesText || savedJob.notes || ''}
                                onChange={(e) => setNotesText(e.target.value)}
                                rows={4}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => updateJobNotes(savedJob.job.id, notesText)}
                                >
                                  Save Notes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => unsaveJob(savedJob.job.id)}
                        >
                          <HeartOff className="h-4 w-4 mr-1" />
                          Unsave
                        </Button>
                      </div>
                    </div>

                    {savedJob.notes && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="font-medium text-sm mb-1">Your Notes:</p>
                        <p className="text-sm text-muted-foreground">
                          {savedJob.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
