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
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchCandidateProfile();
    }
  }, [params.id]);

  const fetchCandidateProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/employer/candidates/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidate profile');
      }

      const data = await response.json();
      if (data.success) {
        setCandidate(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch candidate profile');
      }
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
      toast.error('Failed to load candidate profile');
      router.push('/employer/search');
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'DECLINED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Candidate not found</h3>
            <p className="text-gray-600 mb-4">The candidate profile you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/employer/search')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/employer/search')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {candidate.profile_picture ? (
                  <img
                    src={candidate.profile_picture}
                    alt={`${candidate.first_name} ${candidate.last_name}`}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-500" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {candidate.first_name} {candidate.last_name}
                </h1>
                <p className="text-xl text-gray-600">
                  {candidate.candidate_profile?.current_title}
                </p>
                <p className="text-gray-500">
                  {candidate.candidate_profile?.current_company}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="font-medium">{candidate.profile_views}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">References</span>
                  <span className="font-medium">{candidate.references?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified Work</span>
                  <span className="font-medium">
                    {candidate.verified_employments?.filter(emp => emp.verification_status === 'VERIFIED').length || 0}
                  </span>
                </div>
                
                {candidate.average_rating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Rating</span>
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        {getRatingStars(candidate.average_rating)}
                      </div>
                      <span className="font-medium">{candidate.average_rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{candidate.email}</span>
                </div>
                
                {candidate.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Last active: {formatDate(candidate.last_active)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {candidate.candidate_profile?.skills && candidate.candidate_profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.candidate_profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Bio */}
                {candidate.candidate_profile?.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {candidate.candidate_profile.bio}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Experience Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Experience Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Experience</span>
                        <p className="font-medium">
                          {candidate.candidate_profile?.experience_years || 0} years
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Industry</span>
                        <p className="font-medium">
                          {candidate.candidate_profile?.industry || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Job Type</span>
                        <p className="font-medium">
                          {candidate.candidate_profile?.job_type_preference || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Current Role</span>
                        <p className="font-medium">
                          {candidate.candidate_profile?.current_title || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="references" className="space-y-6">
                {candidate.references && candidate.references.length > 0 ? (
                  candidate.references.map((reference) => (
                    <Card key={reference.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{reference.reviewer_name}</CardTitle>
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
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {reference.relationship_description && (
                          <div>
                            <h4 className="font-medium mb-2">Relationship</h4>
                            <p className="text-sm text-gray-700">{reference.relationship_description}</p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium mb-2">Reference</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {reference.reference_text}
                          </p>
                        </div>

                        {reference.strengths && (
                          <div>
                            <h4 className="font-medium mb-2">Strengths</h4>
                            <p className="text-sm text-gray-700">{reference.strengths}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Detailed Ratings</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Work Quality</span>
                                <div className="flex items-center">
                                  {getRatingStars(reference.work_quality_rating)}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Communication</span>
                                <div className="flex items-center">
                                  {getRatingStars(reference.communication_rating)}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Reliability</span>
                                <div className="flex items-center">
                                  {getRatingStars(reference.reliability_rating)}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Teamwork</span>
                                <div className="flex items-center">
                                  {getRatingStars(reference.teamwork_rating)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Recommendations</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                {reference.would_recommend ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                )}
                                <span>Would recommend</span>
                              </div>
                              <div className="flex items-center">
                                {reference.would_hire_again ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                )}
                                <span>Would hire again</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No References Yet</h3>
                      <p className="text-gray-600">This candidate hasn't received any references yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                {candidate.verified_employments && candidate.verified_employments.length > 0 ? (
                  candidate.verified_employments.map((employment) => (
                    <Card key={employment.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{employment.title}</CardTitle>
                            <p className="text-sm text-gray-600">{employment.company_name}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(employment.start_date)} - {employment.end_date ? formatDate(employment.end_date) : 'Present'}
                            </p>
                          </div>
                          {getVerificationBadge(employment.verification_status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {employment.employment_type && (
                          <div>
                            <span className="text-sm text-gray-600">Employment Type: </span>
                            <span className="text-sm font-medium">{employment.employment_type}</span>
                          </div>
                        )}
                        
                        {employment.responsibilities && (
                          <div>
                            <h4 className="font-medium mb-2">Responsibilities</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {employment.responsibilities}
                            </p>
                          </div>
                        )}
                        
                        {employment.verification_status === 'VERIFIED' && employment.verified_at && (
                          <div className="text-sm text-gray-600">
                            <span>Verified on {formatDate(employment.verified_at)}</span>
                            {employment.verifier_name && (
                              <span> by {employment.verifier_name}</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Verified Experience</h3>
                      <p className="text-gray-600">This candidate hasn't added any verified work experience yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                {candidate.candidate_profile?.portfolio_items && candidate.candidate_profile.portfolio_items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidate.candidate_profile.portfolio_items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          {item.thumbnail_url && (
                            <div className="mb-3">
                              <img
                                src={item.thumbnail_url}
                                alt={item.title}
                                className="w-full h-32 object-cover rounded"
                              />
                            </div>
                          )}
                          <h4 className="font-medium mb-2">{item.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Project
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Portfolio Items</h3>
                      <p className="text-gray-600">This candidate hasn't added any portfolio items yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
