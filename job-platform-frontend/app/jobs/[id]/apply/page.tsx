'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ProfileCompletionGuard from '@/components/auth/profile-completion-guard';
import SubscriptionGuard from '@/components/auth/subscription-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Building,
  Clock,
  Send,
  ArrowLeft
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { getApiUrl } from '@/lib/config';
import Link from 'next/link';

interface JobApplicationProps {
  params: {
    id: string;
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  job_type: string;
  work_arrangement: string;
  experience_level: string;
  location: string;
  department: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  employerProfile: {
    id: string;
    company_name: string;
    company_logo_url: string;
    company_size: string;
    headquarters_location: string;
  };
}

interface ApplicationFormData {
  cover_letter: string;
  expected_salary: string;
  availability_date: string;
  resume_url: string;
  portfolio_url: string;
}

export default function JobApplicationPage({ params }: JobApplicationProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    cover_letter: '',
    expected_salary: '',
    availability_date: '',
    resume_url: '',
    portfolio_url: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'candidate') {
      showToast.error('Only candidates can apply for jobs');
      router.push('/jobs');
      return;
    }

    loadJob();
  }, [user, params.id]);

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

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cover_letter.trim()) {
      showToast.error('Cover letter is required');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('jwt_token');
      
      const submitData = {
        ...formData,
        expected_salary: formData.expected_salary ? parseFloat(formData.expected_salary) : null,
        availability_date: formData.availability_date || null
      };

      const response = await fetch(getApiUrl(`/jobs/${params.id}/apply`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (data.success) {
        showToast.success('Application submitted successfully!');
        router.push('/profile?tab=applications');
      } else {
        showToast.error(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Submit application error:', error);
      showToast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
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
        <Alert>
          <AlertDescription>Job not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user || user.role !== 'candidate') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            You must be logged in as a candidate to apply for jobs.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `Up to ${currency} ${max.toLocaleString()}`;
  };

  return (
    <ProfileCompletionGuard requiredRole="candidate">
      <SubscriptionGuard requiredFeature="apply_jobs">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button variant="ghost" asChild className="mb-4">
                <Link href={`/jobs/${params.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Job Details
                </Link>
              </Button>
            </div>

        {/* Job Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                {job.employerProfile.company_logo_url ? (
                  <img 
                    src={job.employerProfile.company_logo_url} 
                    alt={job.employerProfile.company_name}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <Building className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <p className="text-lg text-gray-600 mb-4">{job.employerProfile.company_name}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location || 'Remote'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.job_type.replace('_', ' ')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {job.work_arrangement.replace('_', ' ')}
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Apply for this Position</CardTitle>
            <CardDescription>
              Fill out the form below to submit your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Letter */}
              <div>
                <Label htmlFor="cover_letter">Cover Letter *</Label>
                <Textarea
                  id="cover_letter"
                  placeholder="Tell us why you're interested in this role and what makes you a great fit..."
                  value={formData.cover_letter}
                  onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                  className="mt-1 min-h-[150px]"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Highlight your relevant experience and enthusiasm for the role
                </p>
              </div>

              {/* Resume URL */}
              <div>
                <Label htmlFor="resume_url">Resume/CV URL</Label>
                <Input
                  id="resume_url"
                  type="url"
                  placeholder="https://example.com/my-resume.pdf"
                  value={formData.resume_url}
                  onChange={(e) => handleInputChange('resume_url', e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Link to your resume on Google Drive, Dropbox, or personal website
                </p>
              </div>

              {/* Portfolio URL */}
              <div>
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  type="url"
                  placeholder="https://myportfolio.com"
                  value={formData.portfolio_url}
                  onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Link to your portfolio, GitHub, or relevant work samples
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expected Salary */}
                <div>
                  <Label htmlFor="expected_salary">Expected Salary ({job.salary_currency})</Label>
                  <Input
                    id="expected_salary"
                    type="number"
                    placeholder="75000"
                    value={formData.expected_salary}
                    onChange={(e) => handleInputChange('expected_salary', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your salary expectation (optional)
                  </p>
                </div>

                {/* Availability Date */}
                <div>
                  <Label htmlFor="availability_date">Available Start Date</Label>
                  <Input
                    id="availability_date"
                    type="date"
                    value={formData.availability_date}
                    onChange={(e) => handleInputChange('availability_date', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    When can you start? (optional)
                  </p>
                </div>
              </div>

              {/* Application Note */}
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Before applying:</strong> Make sure your profile is complete with your experience, 
                  education, and skills. Employers will review your full profile along with your application.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/jobs/${params.id}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
      </SubscriptionGuard>
    </ProfileCompletionGuard>
  );
}
