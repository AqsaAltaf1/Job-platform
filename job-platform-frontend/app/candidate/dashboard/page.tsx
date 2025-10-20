'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertCircle,
  Settings,
  Bell,
  Shield,
  UserCheck,
  Plus,
  EyeOff,
  MoreHorizontal,
  Building2,
  Award,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';
import Link from 'next/link';
import TransparencyDashboard from '@/components/profile/transparency-dashboard';
import RecentActivity from '@/components/dashboard/recent-activity';

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

interface VerifiedWorkHistory {
  id: number;
  company_name: string;
  title: string;
  start_date: string;
  end_date?: string | null;
  verification_status: 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'DECLINED' | 'EXPIRED';
  verifier_name?: string | null;
  verifier_contact_email?: string | null;
  verified_at?: string | null;
  review_token?: string | null;
  review_token_expires_at?: string | null;
  responsibilities?: string | null;
}

interface Reference {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referrerPosition: string;
  referrerCompany: string;
  relationship: 'colleague' | 'manager' | 'client' | 'peer' | 'other';
  keyCompetencies: string[];
  isVisible: boolean;
  isOutdated?: boolean;
  endorsementText?: string;
  rating?: number;
  status: 'pending' | 'completed' | 'declined';
  createdAt: string;
}

interface ReferenceTemplate {
  id: string;
  name: string;
  description: string;
  message: string;
  skills: string[];
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
  const [verifiedWorkHistory, setVerifiedWorkHistory] = useState<VerifiedWorkHistory[]>([]);
  const [showAddVerifiedEmployment, setShowAddVerifiedEmployment] = useState(false);
  const [veCompany, setVeCompany] = useState('');
  const [veTitle, setVeTitle] = useState('');
  const [veStartDate, setVeStartDate] = useState('');
  const [veEndDate, setVeEndDate] = useState('');
  const [veEmploymentType, setVeEmploymentType] = useState('');
  const [veResponsibilities, setVeResponsibilities] = useState('');
  const [veVerifierEmail, setVeVerifierEmail] = useState('');
  const [veVerifierName, setVeVerifierName] = useState('');
  const [creatingVE, setCreatingVE] = useState(false);
  const [editingVE, setEditingVE] = useState<VerifiedWorkHistory | null>(null);
  const [showEditVE, setShowEditVE] = useState(false);
  const [references, setReferences] = useState<Reference[]>([]);
  const [referenceTemplates, setReferenceTemplates] = useState<ReferenceTemplate[]>([]);
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
  const [loadingWorkHistory, setLoadingWorkHistory] = useState(true);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [showRequestReferenceModal, setShowRequestReferenceModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReferenceTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [referrerEmail, setReferrerEmail] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [referrerPosition, setReferrerPosition] = useState('');
  const [referrerCompany, setReferrerCompany] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (user && user.role === 'candidate') {
      fetchApplications();
      fetchSavedJobs();
      fetchDashboardStats();
      fetchVerifiedWorkHistory();
      fetchReferences();
      fetchReferenceTemplates();
      calculateProfileCompletion();
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
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
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
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
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

  const fetchVerifiedWorkHistory = async () => {
    try {
      setLoadingWorkHistory(true);
      const response = await fetch(getApiUrl('/verified-employment'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVerifiedWorkHistory(data.data || []);
      } else {
        throw new Error('Failed to fetch verified work history');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      console.error('Error fetching verified work history:', e);
      toast.error('Failed to load work history');
    } finally {
      setLoadingWorkHistory(false);
    }
  };

  const createVerifiedEmployment = async () => {
    if (!veCompany || !veTitle || !veStartDate) {
      toast.error('Please fill in company, title, and start date');
      return;
    }
    if (veEndDate && new Date(veEndDate) < new Date(veStartDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    try {
      setCreatingVE(true);
      const response = await fetch(getApiUrl('/verified-employment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          company_name: veCompany,
          title: veTitle,
          employment_type: veEmploymentType || undefined,
          start_date: veStartDate,
          end_date: veEndDate || undefined,
          responsibilities: veResponsibilities || undefined,
          verifier_contact_email: veVerifierEmail || undefined,
          verifier_name: veVerifierName || undefined,
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create record');
      }
      toast.success('Verified employment record created');
      setShowAddVerifiedEmployment(false);
      setVeCompany('');
      setVeTitle('');
      setVeStartDate('');
      setVeEndDate('');
      setVeEmploymentType('');
      setVeResponsibilities('');
      setVeVerifierEmail('');
      setVeVerifierName('');
      fetchVerifiedWorkHistory();
    } catch (e:any) {
      console.error(e);
      toast.error(e.message || 'Failed to create record');
    } finally {
      setCreatingVE(false);
    }
  };

  const requestEmploymentReview = async (id: number) => {
    try {
      // Find the work record to get verifier email
      const workRecord = verifiedWorkHistory.find(w => w.id === id);
      if (!workRecord) {
        toast.error('Work record not found');
        return;
      }

      if (!workRecord.verifier_contact_email) {
        toast.error('Please add verifier email in the edit modal before requesting review');
        return;
      }

      const response = await fetch(getApiUrl(`/verified-employment/${id}/request`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          verifier_contact_email: workRecord.verifier_contact_email,
          verifier_name: workRecord.verifier_name
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Verification email sent to employer');
        if (data.data?.review_url) {
          toast.message('Share this link with your verifier', {
            description: data.data.review_url,
          });
        }
        fetchVerifiedWorkHistory();
      } else if (response.status === 409) {
        toast.info('A review request is already active for this employment. Please wait until it expires.');
      } else {
        throw new Error(data.error || 'Failed to request review');
      }
    } catch (e:any) {
      console.error(e);
      toast.error(e.message || 'Failed to request review');
    }
  };

  const deleteVerifiedEmployment = async (id: number) => {
    try {
      const res = await fetch(getApiUrl(`/verified-employment/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.error || 'Failed to delete record')
      }
      toast.success('Verified employment removed')
      setVerifiedWorkHistory(verifiedWorkHistory.filter(w => w.id !== id))
    } catch (e:any) {
      toast.error(e.message)
    }
  }

  const openEditVE = (work: VerifiedWorkHistory) => {
    setEditingVE(work)
    setVeCompany(work.company_name)
    setVeTitle(work.title)
    setVeStartDate(work.start_date)
    setVeEndDate(work.end_date || '')
    setVeResponsibilities(work.responsibilities || '')
    setVeVerifierEmail(work.verifier_contact_email || '')
    setVeVerifierName(work.verifier_name || '')
    setShowEditVE(true)
  }

  const saveEditVE = async () => {
    if (!editingVE) return
    if (!veCompany || !veTitle || !veStartDate) {
      toast.error('Please fill in company, title, and start date')
      return
    }
    if (veEndDate && new Date(veEndDate) < new Date(veStartDate)) {
      toast.error('End date cannot be before start date')
      return
    }
    try {
      const res = await fetch(getApiUrl(`/verified-employment/${editingVE.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          company_name: veCompany,
          title: veTitle,
          start_date: veStartDate,
          end_date: veEndDate || null,
          employment_type: veEmploymentType || undefined,
          responsibilities: veResponsibilities || undefined,
          verifier_contact_email: veVerifierEmail || undefined,
          verifier_name: veVerifierName || undefined,
        })
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data.error || 'Failed to update record')
      toast.success('Verified employment updated')
      setShowEditVE(false)
      setEditingVE(null)
      fetchVerifiedWorkHistory()
    } catch (e:any) {
      toast.error(e.message)
    }
  }

  const fetchReferences = async () => {
    try {
      setLoadingReferences(true);
      const response = await fetch(getApiUrl('/candidate/references'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferences(data.references || []);
      } else {
        // Mock data for now
        setReferences([
          {
            id: '1',
            referrerName: 'John Smith',
            referrerEmail: 'john@techcorp.com',
            referrerPosition: 'Engineering Manager',
            referrerCompany: 'Tech Corp',
            relationship: 'manager',
            keyCompetencies: ['Leadership', 'Technical Skills', 'Problem Solving'],
            isVisible: true,
            endorsementText: 'Excellent team player with strong technical skills.',
            rating: 5,
            status: 'completed',
            createdAt: '2024-01-01'
          },
          {
            id: '2',
            referrerName: 'Sarah Johnson',
            referrerEmail: 'sarah@startup.com',
            referrerPosition: 'Product Manager',
            referrerCompany: 'StartupXYZ',
            relationship: 'colleague',
            keyCompetencies: ['Communication', 'Project Management'],
            isVisible: false,
            status: 'pending',
            createdAt: '2024-01-15'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching references:', error);
      toast.error('Failed to load references');
    } finally {
      setLoadingReferences(false);
    }
  };

  const fetchReferenceTemplates = async () => {
    try {
      const response = await fetch(getApiUrl('/candidate/reference-templates'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferenceTemplates(data.templates || []);
      } else {
        // Mock templates
        setReferenceTemplates([
          {
            id: '1',
            name: 'Technical Skills',
            description: 'For technical roles and engineering positions',
            message: 'I would like to request a reference for my technical skills and engineering capabilities.',
            skills: ['Programming', 'System Design', 'Problem Solving']
          },
          {
            id: '2',
            name: 'Leadership & Management',
            description: 'For leadership and management positions',
            message: 'I would like to request a reference for my leadership and management abilities.',
            skills: ['Team Leadership', 'Project Management', 'Strategic Thinking']
          },
          {
            id: '3',
            name: 'General Professional',
            description: 'For general professional roles',
            message: 'I would like to request a reference for my professional work and collaboration skills.',
            skills: ['Communication', 'Collaboration', 'Work Ethic']
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching reference templates:', error);
    }
  };

  const calculateProfileCompletion = () => {
    if (!user?.candidateProfile) {
      setProfileCompletion(0);
      return;
    }

    const profile = user.candidateProfile;
    let completedFields = 0;
    const totalFields = 8;

    if (profile.bio) completedFields++;
    if (profile.location) completedFields++;
    if (profile.availability) completedFields++;
    if (profile.salary_expectation !== null && profile.salary_expectation !== undefined) completedFields++;
    if (profile.experience_years !== null && profile.experience_years !== undefined) completedFields++;
    if (profile.skills && profile.skills.length > 0) completedFields++;
    if (profile.experiences && profile.experiences.length > 0) completedFields++;
    if (profile.educations && profile.educations.length > 0) completedFields++;

    setProfileCompletion(Math.round((completedFields / totalFields) * 100));
  };

  const unsaveJob = async (jobId: string) => {
    try {
      const response = await fetch(getApiUrl(`/jobs/${jobId}/save`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
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

  const toggleReferenceVisibility = async (referenceId: string, isVisible: boolean) => {
    try {
      const response = await fetch(getApiUrl(`/candidate/references/${referenceId}/visibility`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({ isVisible })
      });

      if (response.ok) {
        setReferences(references.map(ref => 
          ref.id === referenceId ? { ...ref, isVisible } : ref
        ));
        toast.success(`Reference ${isVisible ? 'made visible' : 'hidden'} successfully`);
      } else {
        const errorData = await response.json();
        if (errorData.message === 'Cannot toggle visibility for pending references') {
          toast.info('Visibility can only be toggled for completed references');
        } else {
          throw new Error(errorData.message || 'Failed to update reference visibility');
        }
      }
    } catch (error) {
      console.error('Error updating reference visibility:', error);
      toast.error('Failed to update reference visibility');
    }
  };

  const removeReference = async (referenceId: string) => {
    try {
      const response = await fetch(getApiUrl(`/candidate/references/${referenceId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      if (response.ok) {
        setReferences(references.filter(ref => ref.id !== referenceId));
        toast.success('Reference removed successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove reference');
      }
    } catch (error) {
      console.error('Error removing reference:', error);
      toast.error('Failed to remove reference');
    }
  };

  const requestReferenceUpdate = async (referenceId: string) => {
    try {
      const response = await fetch(getApiUrl(`/references/${referenceId}/request-update`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      if (response.ok) {
        toast.success('Update request sent to referrer');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send update request');
      }
    } catch (error) {
      console.error('Error requesting reference update:', error);
      toast.error('Failed to send update request');
    }
  };

  const toggleReferenceOutdated = async (referenceId: string, isOutdated: boolean) => {
    try {
      const response = await fetch(getApiUrl(`/references/${referenceId}/outdated`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({ is_outdated: isOutdated })
      });

      if (response.ok) {
        setReferences(references.map(ref => 
          ref.id === referenceId ? { ...ref, isOutdated } : ref
        ));
        toast.success(`Reference marked as ${isOutdated ? 'outdated' : 'current'}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update reference status');
      }
    } catch (error) {
      console.error('Error toggling reference outdated status:', error);
      toast.error('Failed to update reference status');
    }
  };

  const sendReferenceRequest = async () => {
    if (!selectedTemplate || !referrerEmail || !referrerName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if a reference request already exists for this email
    const existingReference = references.find(ref => 
      ref.referrerEmail.toLowerCase() === referrerEmail.toLowerCase()
    );

    if (existingReference) {
      toast.error('A reference request has already been sent to this email address');
      return;
    }

    try {
      const response = await fetch(getApiUrl('/candidate/references/request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          referrerEmail,
          referrerName,
          referrerPosition,
          referrerCompany,
          templateId: selectedTemplate.id,
          customMessage: customMessage || selectedTemplate.message,
          skills: selectedTemplate.skills
        })
      });

      if (response.ok) {
        toast.success('Reference request sent successfully');
        setShowRequestReferenceModal(false);
        setReferrerEmail('');
        setReferrerName('');
        setReferrerPosition('');
        setReferrerCompany('');
        setCustomMessage('');
        setSelectedTemplate(null);
        fetchReferences(); // Refresh references list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reference request');
      }
    } catch (error: any) {
      console.error('Error sending reference request:', error);
      toast.error(error?.message || 'Failed to send reference request');
    }
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
      {/* Header with Profile Completion Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        
        {/* Profile Completion Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Profile Completion</h3>
                <p className="text-sm text-muted-foreground">
                  Complete your profile to increase your visibility to employers
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{profileCompletion}%</span>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            {profileCompletion < 100 && (
              <div className="mt-4">
                <Link href="/profile">
                  <Button size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Complete Profile
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Verified Work History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Verified Work History Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verified Work History
                </CardTitle>
                <Dialog open={showAddVerifiedEmployment} onOpenChange={setShowAddVerifiedEmployment}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Verified Employment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Verified Employment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="veCompany">Company *</Label>
                          <Input id="veCompany" value={veCompany} onChange={e=>setVeCompany(e.target.value)} placeholder="Tech Corp" />
                        </div>
                        <div>
                          <Label htmlFor="veTitle">Title *</Label>
                          <Input id="veTitle" value={veTitle} onChange={e=>setVeTitle(e.target.value)} placeholder="Senior Software Engineer" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="veStart">Start Date *</Label>
                          <Input id="veStart" type="date" value={veStartDate} onChange={e=>setVeStartDate(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="veEnd">End Date</Label>
                          <Input id="veEnd" type="date" value={veEndDate} onChange={e=>setVeEndDate(e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="veType">Employment Type</Label>
                          <Input id="veType" value={veEmploymentType} onChange={e=>setVeEmploymentType(e.target.value)} placeholder="full-time, contract..." />
                        </div>
                        <div>
                          <Label htmlFor="veVerifierEmail">Verifier Email *</Label>
                          <Input id="veVerifierEmail" type="email" value={veVerifierEmail} onChange={e=>setVeVerifierEmail(e.target.value)} placeholder="hr@company.com" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="veVerifierName">Verifier Name</Label>
                          <Input id="veVerifierName" value={veVerifierName} onChange={e=>setVeVerifierName(e.target.value)} placeholder="HR Manager" />
                        </div>
                        <div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="veResp">Responsibilities</Label>
                        <Textarea id="veResp" value={veResponsibilities} onChange={e=>setVeResponsibilities(e.target.value)} rows={3} placeholder="Brief description of your responsibilities" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={()=>setShowAddVerifiedEmployment(false)}>Cancel</Button>
                        <Button onClick={createVerifiedEmployment} disabled={creatingVE}>{creatingVE ? 'Saving...' : 'Save'}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Edit Verified Employment Modal */}
                <Dialog open={showEditVE} onOpenChange={setShowEditVE}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Verified Employment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editCompany">Company *</Label>
                          <Input id="editCompany" value={veCompany} onChange={e=>setVeCompany(e.target.value)} disabled={editingVE?.review_token ? true : false} />
                        </div>
                        <div>
                          <Label htmlFor="editTitle">Title *</Label>
                          <Input id="editTitle" value={veTitle} onChange={e=>setVeTitle(e.target.value)} disabled={editingVE?.review_token ? true : false} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editStart">Start Date *</Label>
                          <Input id="editStart" type="date" value={veStartDate} onChange={e=>setVeStartDate(e.target.value)} disabled={editingVE?.review_token ? true : false} />
                        </div>
                        <div>
                          <Label htmlFor="editEnd">End Date</Label>
                          <Input id="editEnd" type="date" value={veEndDate} onChange={e=>setVeEndDate(e.target.value)} disabled={editingVE?.review_token ? true : false} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="editResp">Responsibilities</Label>
                        <Textarea id="editResp" value={veResponsibilities} onChange={e=>setVeResponsibilities(e.target.value)} rows={3} disabled={editingVE?.review_token ? true : false} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editVerifierEmail">Verifier Email</Label>
                          <Input id="editVerifierEmail" type="email" value={veVerifierEmail} onChange={e=>setVeVerifierEmail(e.target.value)} placeholder="manager@company.com" disabled={editingVE?.review_token ? true : false} />
                        </div>
                        <div>
                          <Label htmlFor="editVerifierName">Verifier Name</Label>
                          <Input id="editVerifierName" value={veVerifierName} onChange={e=>setVeVerifierName(e.target.value)} placeholder="John Smith" disabled={editingVE?.review_token ? true : false} />
                        </div>
                      </div>
                      {editingVE && editingVE.review_token && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm font-medium">Verification email already sent</span>
                          </div>
                          <p className="text-xs text-yellow-700 mt-1">
                            A verification request has been sent to the verifier. You cannot edit this record until the verification is complete.
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={()=>setShowEditVE(false)}>Cancel</Button>
                          <Button onClick={saveEditVE} disabled={editingVE?.review_token ? true : false}>
                            Save Changes
                          </Button>
                        </div>
                        {editingVE && editingVE.verification_status === 'NOT_VERIFIED' && !editingVE.review_token && (
                          <Button 
                            variant="default" 
                            onClick={() => {
                              setShowEditVE(false);
                              requestEmploymentReview(editingVE.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Request Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingWorkHistory ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : verifiedWorkHistory.length > 0 ? (
                <div className="space-y-4">
                  {verifiedWorkHistory.map((work) => (
                    <div key={work.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">{work.company_name}</h4>
                            {work.verification_status === 'VERIFIED' ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : work.verification_status === 'DECLINED' ? (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Declined
                              </Badge>
                            ) : work.verification_status === 'PENDING' || (work.verification_status === 'NOT_VERIFIED' && work.review_token) ? (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Not Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{work.title}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {work.start_date} - {work.end_date || 'Present'}
                            </span>
                          </div>
                          {work.verification_status === 'VERIFIED' && work.verifier_name && (
                            <p className="text-xs text-green-600 mt-2">
                              Verified by {work.verifier_name}{work.verified_at ? ` on ${work.verified_at}` : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {work.verification_status === 'NOT_VERIFIED' && !work.review_token && (
                            <Button variant="outline" size="sm" onClick={() => requestEmploymentReview(work.id)}>
                              <Mail className="h-4 w-4 mr-1" />
                              Request Review
                            </Button>
                          )}
                          {work.verification_status === 'NOT_VERIFIED' && !work.review_token && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditVE(work)}
                              title="Edit"
                              aria-label="Edit verified employment"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {work.verification_status === 'NOT_VERIFIED' && work.review_token && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Cannot edit after verification email is sent">
                              <Mail className="h-4 w-4" />
                              <span>Verification email sent - Cannot edit</span>
                            </div>
                          )}
                          {work.verification_status === 'PENDING' && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Awaiting verification</span>
                            </div>
                          )}
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => deleteVerifiedEmployment(work.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Work History</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your work experience to build trust with employers
                  </p>
                  <Button onClick={() => setShowAddVerifiedEmployment(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Verified Employment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* References Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  References
                </CardTitle>
                <Dialog open={showRequestReferenceModal} onOpenChange={setShowRequestReferenceModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Request New Reference
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Request New Reference</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Template Selection */}
                      <div>
                        <Label>Reference Template</Label>
                        <Select onValueChange={(value) => {
                          const template = referenceTemplates.find(t => t.id === value);
                          setSelectedTemplate(template || null);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a template" />
                          </SelectTrigger>
                          <SelectContent>
                            {referenceTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div>
                                  <div className="font-medium">{template.name}</div>
                                  <div className="text-sm text-muted-foreground">{template.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Referrer Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="referrerName">Referrer Name *</Label>
                          <Input
                            id="referrerName"
                            value={referrerName}
                            onChange={(e) => setReferrerName(e.target.value)}
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <Label htmlFor="referrerEmail">Email Address *</Label>
                          <Input
                            id="referrerEmail"
                            type="email"
                            value={referrerEmail}
                            onChange={(e) => setReferrerEmail(e.target.value)}
                            placeholder="john@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="referrerPosition">Position</Label>
                          <Input
                            id="referrerPosition"
                            value={referrerPosition}
                            onChange={(e) => setReferrerPosition(e.target.value)}
                            placeholder="Engineering Manager"
                          />
                        </div>
                        <div>
                          <Label htmlFor="referrerCompany">Company</Label>
                          <Input
                            id="referrerCompany"
                            value={referrerCompany}
                            onChange={(e) => setReferrerCompany(e.target.value)}
                            placeholder="Tech Corp"
                          />
                        </div>
                      </div>

                      {/* Custom Message */}
                      <div>
                        <Label htmlFor="customMessage">Custom Message</Label>
                        <Textarea
                          id="customMessage"
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder={selectedTemplate?.message || "Enter your custom message..."}
                          rows={4}
                        />
                      </div>

                      {/* Skills to Review */}
                      {selectedTemplate && (
                        <div>
                          <Label>Skills to Review</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedTemplate.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowRequestReferenceModal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={sendReferenceRequest}>
                          Send Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingReferences ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : references.length > 0 ? (
                <div className="space-y-4">
                  {references.map((reference) => (
                    <div key={reference.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{reference.referrerName}</h4>
                            <Badge variant={reference.status === 'completed' ? 'default' : 'secondary'}>
                              {reference.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {reference.referrerPosition} at {reference.referrerCompany}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Relationship: {reference.relationship}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {reference.status === 'completed' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => requestReferenceUpdate(reference.id)}
                                title="Request referrer to update this reference"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center gap-1">
                                <Switch
                                  checked={reference.isOutdated || false}
                                  onCheckedChange={(checked) => toggleReferenceOutdated(reference.id, checked)}
                                  title="Mark as outdated to redact text"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {reference.isOutdated ? 'Outdated' : 'Current'}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-1">
                            {reference.status === 'completed' ? (
                              <>
                                <Switch
                                  checked={reference.isVisible}
                                  onCheckedChange={(checked) => toggleReferenceVisibility(reference.id, checked)}
                                />
                                <span className="text-sm">
                                  {reference.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </span>
                              </>
                            ) : (
                              <div className="flex items-center gap-1 opacity-50" title="Visibility can only be toggled for completed references">
                                <Switch
                                  checked={false}
                                  disabled={true}
                                />
                                <span className="text-sm">
                                  <EyeOff className="h-4 w-4" />
                                </span>
                                <span className="text-xs text-muted-foreground">Pending</span>
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => removeReference(reference.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {reference.keyCompetencies.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Key Competencies:</p>
                          <div className="flex flex-wrap gap-1">
                            {reference.keyCompetencies.map((competency) => (
                              <Badge key={competency} variant="outline" className="text-xs">
                                {competency}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {reference.endorsementText && (
                        <div className="bg-gray-50 rounded p-3">
                          {reference.isOutdated ? (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground italic">
                                "This reference has been marked as outdated and the text has been redacted."
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Contact the referrer to request an updated reference.
                              </p>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm italic">"{reference.endorsementText}"</p>
                              {reference.rating && (
                                <div className="flex items-center gap-1 mt-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < reference.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No References Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Request references from colleagues and managers to build credibility
                  </p>
                  <Button onClick={() => setShowRequestReferenceModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Your First Reference
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Profile Views</span>
                </div>
                <span className="font-semibold">{dashboardStats.profileViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Applications</span>
                </div>
                <span className="font-semibold">{dashboardStats.appliedJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">References</span>
                </div>
                <span className="font-semibold">{references.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Verified Work</span>
                </div>
                <span className="font-semibold">
                  {verifiedWorkHistory.filter(w => w.verification_status === 'VERIFIED').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="pt-6">
              <RecentActivity />
            </CardContent>
          </Card>

          {/* Transparency Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Transparency Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransparencyDashboard />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
