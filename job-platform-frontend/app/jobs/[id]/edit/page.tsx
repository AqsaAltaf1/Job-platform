'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  Users,
  Building,
  X,
  Plus,
  Save,
  Eye,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { getApiUrl } from '@/lib/config';
import Link from 'next/link';

interface EditJobPageProps {
  params: {
    id: string;
  };
}

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  job_type: string;
  work_arrangement: string;
  experience_level: string;
  location: string;
  department: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  salary_period: string;
  skills_required: string[];
  benefits: string;
  application_deadline: string;
  status: string;
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    job_type: 'full_time',
    work_arrangement: 'on_site',
    experience_level: 'mid_level',
    location: '',
    department: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    salary_period: 'yearly',
    skills_required: [],
    benefits: '',
    application_deadline: '',
    status: 'draft'
  });

  useEffect(() => {
    if (!user) return;
    
    if (user.role !== 'employer' && user.role !== 'team_member') {
      router.push('/jobs');
      return;
    }

    loadJob();
  }, [user, params.id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(getApiUrl(`/jobs/${params.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const job = data.job;
        setFormData({
          title: job.title || '',
          description: job.description || '',
          requirements: job.requirements || '',
          responsibilities: job.responsibilities || '',
          job_type: job.job_type || 'full_time',
          work_arrangement: job.work_arrangement || 'on_site',
          experience_level: job.experience_level || 'mid_level',
          location: job.location || '',
          department: job.department || '',
          salary_min: job.salary_min ? job.salary_min.toString() : '',
          salary_max: job.salary_max ? job.salary_max.toString() : '',
          salary_currency: job.salary_currency || 'USD',
          salary_period: job.salary_period || 'yearly',
          skills_required: job.skills_required || [],
          benefits: job.benefits || '',
          application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().split('T')[0] : '',
          status: job.status || 'draft'
        });
      } else {
        showToast.error('Job not found or you do not have permission to edit it');
        router.push('/jobs/manage');
      }
    } catch (error) {
      console.error('Load job error:', error);
      showToast.error('Failed to load job');
      router.push('/jobs/manage');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    // Validate salary fields
    if (field === 'salary_min' || field === 'salary_max') {
      const numValue = parseFloat(value);
      const maxSalary = 99999999.99; // Maximum value for DECIMAL(10,2)
      
      if (value && (isNaN(numValue) || numValue < 0 || numValue > maxSalary)) {
        showToast(`Salary must be between 0 and ${maxSalary.toLocaleString()}`, 'error');
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_required.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async (newStatus?: string) => {
    try {
      setSaving(true);

      // Basic validation
      if (!formData.title.trim()) {
        showToast.error('Job title is required');
        return;
      }
      if (!formData.description.trim()) {
        showToast.error('Job description is required');
        return;
      }

      const token = localStorage.getItem('jwt_token');
      const submitData = {
        ...formData,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        application_deadline: formData.application_deadline || null,
        status: newStatus || formData.status
      };

      const response = await fetch(getApiUrl(`/jobs/${params.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (data.success) {
        showToast.success('Job updated successfully!');
        router.push('/jobs/manage');
      } else {
        showToast.error(data.error || 'Failed to update job');
      }
    } catch (error) {
      console.error('Update job error:', error);
      showToast.error('Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(getApiUrl(`/jobs/${params.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        showToast.success('Job deleted successfully!');
        router.push('/jobs/manage');
      } else {
        showToast.error(data.error || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Delete job error:', error);
      showToast.error('Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  if (!user || (user.role !== 'employer' && user.role !== 'team_member')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            You need to be logged in as an employer to edit jobs.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/jobs/manage">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/jobs/${params.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Job
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-gray-600 mt-2">Update your job listing details</p>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update the essential details about the position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Customer Success">Customer Success</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                      <SelectItem value="Business Development">Business Development</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="New York, NY">New York, NY</SelectItem>
                      <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                      <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
                      <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                      <SelectItem value="Boston, MA">Boston, MA</SelectItem>
                      <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
                      <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                      <SelectItem value="Denver, CO">Denver, CO</SelectItem>
                      <SelectItem value="Miami, FL">Miami, FL</SelectItem>
                      <SelectItem value="Atlanta, GA">Atlanta, GA</SelectItem>
                      <SelectItem value="London, UK">London, UK</SelectItem>
                      <SelectItem value="Berlin, Germany">Berlin, Germany</SelectItem>
                      <SelectItem value="Paris, France">Paris, France</SelectItem>
                      <SelectItem value="Toronto, Canada">Toronto, Canada</SelectItem>
                      <SelectItem value="Sydney, Australia">Sydney, Australia</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="Tokyo, Japan">Tokyo, Japan</SelectItem>
                      <SelectItem value="Mumbai, India">Mumbai, India</SelectItem>
                      <SelectItem value="Dubai, UAE">Dubai, UAE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="job_type">Job Type</Label>
                  <Select value={formData.job_type} onValueChange={(value) => handleInputChange('job_type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="work_arrangement">Work Arrangement</Label>
                  <Select value={formData.work_arrangement} onValueChange={(value) => handleInputChange('work_arrangement', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_site">On-site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry_level">Entry Level</SelectItem>
                      <SelectItem value="mid_level">Mid Level</SelectItem>
                      <SelectItem value="senior_level">Senior Level</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="application_deadline">Application Deadline</Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Update detailed information about the role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="responsibilities">Key Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  placeholder="• Lead development of new features&#10;• Collaborate with cross-functional teams&#10;• Mentor junior developers"
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="• 5+ years of software development experience&#10;• Proficiency in React and Node.js&#10;• Strong problem-solving skills"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Textarea
                  id="benefits"
                  placeholder="• Competitive salary and equity&#10;• Health, dental, and vision insurance&#10;• Flexible work arrangements&#10;• Professional development budget"
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Information
              </CardTitle>
              <CardDescription>
                Update the compensation range (optional but recommended)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="salary_min">Minimum Salary</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    placeholder="50000"
                    value={formData.salary_min}
                    onChange={(e) => handleInputChange('salary_min', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="salary_max">Maximum Salary</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    placeholder="80000"
                    value={formData.salary_max}
                    onChange={(e) => handleInputChange('salary_max', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="salary_currency">Currency</Label>
                  <Select value={formData.salary_currency} onValueChange={(value) => handleInputChange('salary_currency', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                      <SelectItem value="HKD">HKD - Hong Kong Dollar</SelectItem>
                      <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                      <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                      <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
                      <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                      <SelectItem value="KRW">KRW - South Korean Won</SelectItem>
                      <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                      <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                      <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                      <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="salary_period">Period</Label>
                  <Select value={formData.salary_period} onValueChange={(value) => handleInputChange('salary_period', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Required */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
              <CardDescription>
                Update the key skills and technologies required for this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. React, Node.js, Python"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_required.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-between">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete Job'}
            </Button>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/jobs/manage')}
                disabled={saving || deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSave('draft')}
                disabled={saving || deleting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button 
                onClick={() => handleSave('active')}
                disabled={saving || deleting}
              >
                <Eye className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save & Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
