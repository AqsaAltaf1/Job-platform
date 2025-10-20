'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Briefcase, 
  Award,
  Eye,
  User,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { getApiUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
  };
  references?: Array<{
    id: string;
    reviewer_name: string;
    overall_rating: number;
    work_quality_rating: number;
    communication_rating: number;
    reliability_rating: number;
    teamwork_rating: number;
    reference_text: string;
    strengths: string;
    would_recommend: boolean;
    would_hire_again: boolean;
    is_public: boolean;
    is_verified: boolean;
    created_at: string;
  }>;
  verified_employments?: Array<{
    id: string;
    company_name: string;
    title: string;
    start_date: string;
    end_date?: string;
    verification_status: string;
    verified_at?: string;
  }>;
  profile_views?: number;
  last_active?: string;
}

interface SearchFilters {
  jobType: string[];
  competencyTags: string[];
  performanceRatingRange: [number, number];
  industry: string[];
  location?: string;
  experienceYears?: [number, number];
  verifiedOnly: boolean;
}

const JOB_TYPES = [
  'Full-time',
  'Part-time', 
  'Contract',
  'Freelance',
  'Internship',
  'Remote',
  'Hybrid'
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media',
  'Government',
  'Non-profit'
];

const COMPETENCY_TAGS = [
  'Leadership',
  'Communication',
  'Problem Solving',
  'Teamwork',
  'Technical Skills',
  'Project Management',
  'Analytical Thinking',
  'Creativity',
  'Adaptability',
  'Time Management'
];

export default function EmployerSearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [hoveredCandidate, setHoveredCandidate] = useState<Candidate | null>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    jobType: [],
    competencyTags: [],
    performanceRatingRange: [1, 5],
    industry: [],
    location: '',
    experienceYears: [0, 20],
    verifiedOnly: false
  });

  useEffect(() => {
    // Check authentication and role
    if (!authLoading) {
      if (!user) {
        // User not logged in, redirect to login
        router.push('/login');
        return;
      }
      
      if (user.role !== 'employer' && (user.role as any) !== 'team_member') {
        // User doesn't have employer access, redirect to appropriate dashboard
        if (user.role === 'candidate') {
          router.push('/candidate/dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }
      
      // User is authenticated and has employer access, fetch data
      fetchCandidates();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    applyFilters();
  }, [candidates, filters, searchQuery]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/employer/candidates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      if (data.success) {
        setCandidates(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.first_name.toLowerCase().includes(query) ||
        candidate.last_name.toLowerCase().includes(query) ||
        candidate.candidate_profile?.current_title?.toLowerCase().includes(query) ||
        candidate.candidate_profile?.current_company?.toLowerCase().includes(query) ||
        candidate.candidate_profile?.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Job type filter
    if (filters.jobType.length > 0) {
      filtered = filtered.filter(candidate => 
        filters.jobType.includes(candidate.candidate_profile?.job_type_preference || '')
      );
    }

    // Industry filter
    if (filters.industry.length > 0) {
      filtered = filtered.filter(candidate => 
        filters.industry.includes(candidate.candidate_profile?.industry || '')
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(candidate => 
        candidate.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Experience years filter
    filtered = filtered.filter(candidate => {
      const experience = candidate.candidate_profile?.experience_years || 0;
      return experience >= filters.experienceYears![0] && experience <= filters.experienceYears![1];
    });

    // Performance rating filter
    filtered = filtered.filter(candidate => {
      if (!candidate.references || candidate.references.length === 0) return true;
      const avgRating = candidate.references.reduce((sum, ref) => sum + ref.overall_rating, 0) / candidate.references.length;
      return avgRating >= filters.performanceRatingRange[0] && avgRating <= filters.performanceRatingRange[1];
    });

    // Verified only filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(candidate => 
        candidate.references?.some(ref => ref.is_verified) ||
        candidate.verified_employments?.some(emp => emp.verification_status === 'VERIFIED')
      );
    }

    setFilteredCandidates(filtered);
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleArrayFilter = (filterType: 'jobType' | 'competencyTags' | 'industry', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      jobType: [],
      competencyTags: [],
      performanceRatingRange: [1, 5],
      industry: [],
      location: '',
      experienceYears: [0, 20],
      verifiedOnly: false
    });
    setSearchQuery('');
  };

  const getAverageRating = (candidate: Candidate) => {
    if (!candidate.references || candidate.references.length === 0) return 0;
    const sum = candidate.references.reduce((acc, ref) => acc + ref.overall_rating, 0);
    return sum / candidate.references.length;
  };

  const getVerifiedBadges = (candidate: Candidate) => {
    const badges = [];
    if (candidate.references?.some(ref => ref.is_verified)) {
      badges.push({ type: 'reference', count: candidate.references.filter(ref => ref.is_verified).length });
    }
    if (candidate.verified_employments?.some(emp => emp.verification_status === 'VERIFIED')) {
      badges.push({ type: 'employment', count: candidate.verified_employments.filter(emp => emp.verification_status === 'VERIFIED').length });
    }
    return badges;
  };

  const getTopEndorsements = (candidate: Candidate) => {
    if (!candidate.references || candidate.references.length === 0) return [];
    
    const allStrengths = candidate.references
      .flatMap(ref => ref.strengths?.split(',').map(s => s.trim()) || [])
      .filter(Boolean);
    
    const strengthCounts = allStrengths.reduce((acc, strength) => {
      acc[strength] = (acc[strength] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(strengthCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([strength, count]) => ({ strength, count }));
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if user doesn't have access
  if (!user || (user.role !== 'employer' && (user.role as any) !== 'team_member')) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Top Candidates</h1>
          <p className="text-gray-600">Search and filter candidates with verified references and work history</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by name, title, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </CardHeader>
              
              {showFilters && (
                <CardContent className="space-y-6">
                  {/* Job Type */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Job Type</Label>
                    <div className="space-y-2">
                      {JOB_TYPES.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`job-${type}`}
                            checked={filters.jobType.includes(type)}
                            onCheckedChange={() => toggleArrayFilter('jobType', type)}
                          />
                          <Label htmlFor={`job-${type}`} className="text-sm">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Industry</Label>
                    <div className="space-y-2">
                      {INDUSTRIES.map(industry => (
                        <div key={industry} className="flex items-center space-x-2">
                          <Checkbox
                            id={`industry-${industry}`}
                            checked={filters.industry.includes(industry)}
                            onCheckedChange={() => toggleArrayFilter('industry', industry)}
                          />
                          <Label htmlFor={`industry-${industry}`} className="text-sm">{industry}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Rating */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Performance Rating: {filters.performanceRatingRange[0]} - {filters.performanceRatingRange[1]}
                    </Label>
                    <Slider
                      value={filters.performanceRatingRange}
                      onValueChange={(value) => handleFilterChange('performanceRatingRange', value)}
                      max={5}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Experience Years */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Experience: {filters.experienceYears![0]} - {filters.experienceYears![1]} years
                    </Label>
                    <Slider
                      value={filters.experienceYears!}
                      onValueChange={(value) => handleFilterChange('experienceYears', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium mb-2 block">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, State, Country"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </div>

                  {/* Verified Only */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified-only"
                      checked={filters.verifiedOnly}
                      onCheckedChange={(checked) => handleFilterChange('verifiedOnly', checked)}
                    />
                    <Label htmlFor="verified-only" className="text-sm">Verified candidates only</Label>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {filteredCandidates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCandidates.map((candidate) => {
                  const avgRating = getAverageRating(candidate);
                  const verifiedBadges = getVerifiedBadges(candidate);
                  const topEndorsements = getTopEndorsements(candidate);
                  
                  return (
                    <Card
                      key={candidate.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onMouseEnter={() => setHoveredCandidate(candidate)}
                      onMouseLeave={() => setHoveredCandidate(null)}
                      onClick={() => window.location.href = `/candidates/${candidate.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              {candidate.profile_picture ? (
                                <img
                                  src={candidate.profile_picture}
                                  alt={`${candidate.first_name} ${candidate.last_name}`}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-6 w-6 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {candidate.first_name} {candidate.last_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {candidate.candidate_profile?.current_title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {candidate.candidate_profile?.current_company}
                              </p>
                            </div>
                          </div>
                          
                          {/* Verified Badges */}
                          <div className="flex flex-col space-y-1">
                            {verifiedBadges.map((badge, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className={`text-xs ${
                                  badge.type === 'reference' 
                                    ? 'text-green-600 border-green-200' 
                                    : 'text-blue-600 border-blue-200'
                                }`}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {badge.type === 'reference' ? 'Ref' : 'Work'} ({badge.count})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Rating */}
                        {avgRating > 0 && (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(avgRating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {avgRating.toFixed(1)} ({candidate.references?.length || 0} reviews)
                            </span>
                          </div>
                        )}

                        {/* Location */}
                        {candidate.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {candidate.location}
                          </div>
                        )}

                        {/* Experience */}
                        {candidate.candidate_profile?.experience_years && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {candidate.candidate_profile.experience_years} years experience
                          </div>
                        )}

                        {/* Top Skills */}
                        {candidate.candidate_profile?.skills && candidate.candidate_profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {candidate.candidate_profile.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.candidate_profile.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{candidate.candidate_profile.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Hover Preview */}
                        {hoveredCandidate?.id === candidate.id && topEndorsements.length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                            <h4 className="text-sm font-medium mb-2">Top Endorsements:</h4>
                            <div className="space-y-1">
                              {topEndorsements.map((endorsement, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-700">{endorsement.strength}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {endorsement.count}×
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
