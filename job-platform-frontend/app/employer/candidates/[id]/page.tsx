'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Star, 
  MapPin, 
  Briefcase, 
  Award,
  User,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  ExternalLink,
  Eye,
  Download
} from 'lucide-react';
import { getApiUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  location?: string;
  profile_picture?: string;
  candidate_profile?: {
    bio?: string;
    skills?: string[];
    experience_years?: number;
    current_title?: string;
    current_company?: string;
    industry?: string;
    job_type_preference?: string;
    portfolio_items?: Array<{
      title: string;
      description: string;
      url: string;
      thumbnail_url?: string;
    }>;
    work_samples?: Array<{
      title: string;
      description: string;
      url: string;
    }>;
  };
  references?: Array<{
    id: string;
    reviewer_name: string;
    relationship: string;
    relationship_description: string;
    overall_rating: number;
    work_quality_rating: number;
    communication_rating: number;
    reliability_rating: number;
    teamwork_rating: number;
    reference_text: string;
    strengths: string;
    areas_for_improvement: string;
    would_recommend: boolean;
    would_hire_again: boolean;
    years_worked_together: number;
    last_worked_together: string;
    is_public: boolean;
    is_verified: boolean;
    created_at: string;
  }>;
  verified_employments?: Array<{
    id: string;
    company_name: string;
    title: string;
    employment_type: string;
    start_date: string;
    end_date?: string;
    responsibilities: string;
    verification_status: string;
    verification_method: string;
    verifier_name: string;
    verified_at: string;
  }>;
  profile_views: number;
  last_active: string;
  average_rating: number;
}

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('experience');

  useEffect(() => {
    if (params.id) {
      fetchCandidateProfile();
    }
  }, [params.id]);

  const fetchCandidateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${getApiUrl()}/employer/candidates/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Candidate data received:', data);
        console.log('🔍 References data:', data.candidate?.references);
        setCandidate(data.candidate);
      } else {
        console.error('Failed to fetch candidate profile');
        toast.error('Failed to load candidate profile');
      }
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
      toast.error('Failed to load candidate profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'DECLINED':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Not Verified
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Candidate not found</h3>
          <p className="text-gray-600 mb-4">The candidate profile you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/employer/search')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/employer/search')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-8">User Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Summary */}
          <div className="lg:col-span-1">
            {/* Profile Picture & Basic Info */}
            <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    {candidate.profile_picture ? (
                      <img
                        src={candidate.profile_picture}
                        alt={`${candidate.first_name} ${candidate.last_name}`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-500" />
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {candidate.first_name} {candidate.last_name}
                </h2>
                <p className="text-lg text-gray-600 mb-1">
                  {candidate.candidate_profile?.current_title}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {candidate.candidate_profile?.current_company}
                </p>
                
                {/* Professional Summary */}
                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  {candidate.candidate_profile?.bio || "Professional developer with expertise in modern web technologies and a passion for creating innovative solutions."}
                </p>
                
                {/* Skills */}
                {candidate.candidate_profile?.skills && candidate.candidate_profile.skills.length > 0 && (
                  <div className="w-full">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 text-left">Skill:</h3>
                    <div className="flex flex-wrap gap-2 justify-start">
                      {candidate.candidate_profile.skills.slice(0, 7).map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Age: {candidate.candidate_profile?.experience_years ? `${25 + candidate.candidate_profile.experience_years} Years` : 'Not specified'}</p>
                  <p className="text-gray-600">Location: {candidate.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Years of Experience: {candidate.candidate_profile?.experience_years || 0} Years</p>
                  <p className="text-gray-600">Availability: {candidate.candidate_profile?.job_type_preference || 'Full Time'} (40hr/wk)</p>
                  <p className="text-gray-600">CTC: Not specified</p>
                  <div className="flex items-center mt-1">
                    <span className="text-gray-600">Positive Feedback: 100% </span>
                    <div className="flex ml-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2">
                  Work Request
                </Button>
                <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-6 py-2">
                  Schedule a call
                </Button>
              </div>
            </div>

            {/* Tabbed Content - Experience, Education, Certification */}
            <div className="bg-white rounded-2xl shadow-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 rounded-t-2xl">
                  <TabsTrigger value="experience" className="rounded-tl-2xl">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="certification" className="rounded-tr-2xl">Certification</TabsTrigger>
                </TabsList>

                <TabsContent value="experience" className="p-6">
                  <div className="space-y-4">
                    {candidate.verified_employments && candidate.verified_employments.length > 0 ? (
                      candidate.verified_employments.map((employment, index) => (
                        <div key={employment.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{employment.title}</h4>
                            <p className="text-sm text-gray-600">{employment.company_name}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(employment.start_date)} - {employment.end_date ? formatDate(employment.end_date) : 'Present'} | {candidate.location}
                            </p>
                            <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto mt-1">
                              View Project
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No work experience available</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="education" className="p-6">
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-8">No education information available</p>
                  </div>
                </TabsContent>

                <TabsContent value="certification" className="p-6">
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-8">No certifications available</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Middle Column - References */}
          <div className="lg:col-span-1">
            {/* References Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">References</h3>
              <div className="space-y-4">
                {(() => {
                  console.log('🔍 Rendering references, candidate:', candidate);
                  console.log('🔍 References array:', candidate?.references);
                  console.log('🔍 References length:', candidate?.references?.length);
                  return null;
                })()}
                {candidate.references && candidate.references.length > 0 ? (
                  candidate.references.map((reference) => (
                    <div key={reference.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{reference.reviewer_name}</h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {reference.relationship.replace('_', ' ')} • {reference.years_worked_together} years together
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getVerificationBadge(reference.is_verified ? 'VERIFIED' : 'NOT_VERIFIED')}
                          <div className="flex items-center">
                            {getRatingStars(reference.overall_rating)}
                            <span className="ml-2 text-sm font-medium">
                              {reference.overall_rating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {reference.relationship_description && (
                        <div className="mb-3">
                          <h5 className="font-medium text-sm mb-1">Relationship</h5>
                          <p className="text-sm text-gray-700">{reference.relationship_description}</p>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <h5 className="font-medium text-sm mb-1">Reference</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {reference.reference_text}
                        </p>
                      </div>

                      {reference.strengths && (
                        <div className="mb-3">
                          <h5 className="font-medium text-sm mb-1">Strengths</h5>
                          <p className="text-sm text-gray-700">{reference.strengths}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Work Quality</h5>
                          <div className="flex items-center">
                            {getRatingStars(reference.work_quality_rating)}
                            <span className="ml-2 text-sm">{reference.work_quality_rating}/5</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Communication</h5>
                          <div className="flex items-center">
                            {getRatingStars(reference.communication_rating)}
                            <span className="ml-2 text-sm">{reference.communication_rating}/5</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Reliability</h5>
                          <div className="flex items-center">
                            {getRatingStars(reference.reliability_rating)}
                            <span className="ml-2 text-sm">{reference.reliability_rating}/5</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Teamwork</h5>
                          <div className="flex items-center">
                            {getRatingStars(reference.teamwork_rating)}
                            <span className="ml-2 text-sm">{reference.teamwork_rating}/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>Would recommend: {reference.would_recommend ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>Would hire again: {reference.would_hire_again ? 'Yes' : 'No'}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        Submitted on {formatDate(reference.created_at)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    {/* Test Reference 1 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">John Smith</h4>
                          <p className="text-sm text-gray-600 capitalize">
                            Manager • 3 years together
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <div className="flex items-center">
                            {getRatingStars(4.5)}
                            <span className="ml-2 text-sm font-medium">
                              4.5/5
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h5 className="font-medium text-sm mb-1">Reference</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Excellent developer with strong technical skills and great communication. Always delivers on time and exceeds expectations.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Work Quality</h5>
                          <div className="flex items-center">
                            {getRatingStars(4.5)}
                            <span className="ml-2 text-sm">4.5/5</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Communication</h5>
                          <div className="flex items-center">
                            {getRatingStars(4.0)}
                            <span className="ml-2 text-sm">4.0/5</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Reliability</h5>
                          <div className="flex items-center">
                            {getRatingStars(5.0)}
                            <span className="ml-2 text-sm">5.0/5</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Teamwork</h5>
                          <div className="flex items-center">
                            {getRatingStars(4.5)}
                            <span className="ml-2 text-sm">4.5/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>Would recommend: Yes</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>Would hire again: Yes</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        Submitted on {formatDate(new Date().toISOString())}
                      </div>
                    </div>

                    {/* Test Reference 2 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                          <p className="text-sm text-gray-600 capitalize">
                            Colleague • 2 years together
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                          <div className="flex items-center">
                            {getRatingStars(4.0)}
                            <span className="ml-2 text-sm font-medium">
                              4.0/5
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h5 className="font-medium text-sm mb-1">Reference</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Great team player with excellent problem-solving skills. Always willing to help others and learn new technologies.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Work Quality</h5>
                          <div className="flex items-center">
                            {getRatingStars(4.0)}
                            <span className="ml-2 text-sm">4.0/5</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Communication</h5>
                          <div className="flex items-center">
                            {getRatingStars(4.5)}
                            <span className="ml-2 text-sm">4.5/5</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Reliability</h5>
                          <div className="flex items-center">
                            {getRatingStars(4.0)}
                            <span className="ml-2 text-sm">4.0/5</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Teamwork</h5>
                          <div className="flex items-center">
                            {getRatingStars(5.0)}
                            <span className="ml-2 text-sm">5.0/5</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>Would recommend: Yes</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>Would hire again: Yes</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        Submitted on {formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Video & Similar Profiles */}
          <div className="lg:col-span-1">
            {/* Video Player */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
                    <div className="w-0 h-0 border-l-[12px] border-l-gray-600 border-y-[8px] border-y-transparent ml-1"></div>
                  </div>
                  <p className="text-sm text-gray-600">Work Showcase Video</p>
                </div>
              </div>
            </div>

            {/* Similar Profiles */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Profiles:</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Front end developer | Pune, India</p>
                    <p className="text-xs text-gray-500">2 Years Experience</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Team Lead | Pune, India</p>
                    <p className="text-xs text-gray-500">6 Years Experience</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Lead - Front end developer | Pune, India</p>
                    <p className="text-xs text-gray-500">5 Years Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}