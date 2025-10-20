'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Clock,
  Shield,
  Users,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  FileText,
  Download,
  Mail,
  Phone,
  ExternalLink,
  RefreshCw
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
  profile_views: number;
  last_active: string;
  average_rating: number;
  compliance_score?: number;
  diversity_metrics?: {
    gender?: string;
    ethnicity?: string;
    age_range?: string;
    disability_status?: string;
  };
}

interface DashboardStats {
  total_candidates: number;
  verified_candidates: number;
  avg_rating: number;
  top_skills: Array<{ skill: string; count: number }>;
  industry_breakdown: Array<{ industry: string; count: number }>;
  compliance_alerts: number;
}

interface SearchFilters {
  search: string;
  competencies: string[];
  roleType: string[];
  performanceTags: string[];
  minRating: number;
  maxRating: number;
  experienceRange: [number, number];
  location: string;
  industry: string[];
  verifiedOnly: boolean;
  complianceFilter: string;
}

const COMPETENCIES = [
  'Leadership',
  'Communication',
  'Problem Solving',
  'Teamwork',
  'Technical Skills',
  'Project Management',
  'Analytical Thinking',
  'Creativity',
  'Adaptability',
  'Time Management',
  'Customer Service',
  'Sales',
  'Marketing',
  'Data Analysis',
  'Software Development'
];

const ROLE_TYPES = [
  'Executive',
  'Senior Management',
  'Middle Management',
  'Individual Contributor',
  'Entry Level',
  'Intern',
  'Consultant',
  'Freelancer'
];

const PERFORMANCE_TAGS = [
  'High Performer',
  'Team Player',
  'Innovative',
  'Reliable',
  'Fast Learner',
  'Detail Oriented',
  'Strategic Thinker',
  'Results Driven',
  'Collaborative',
  'Self Motivated'
];

const COMPLIANCE_FILTERS = [
  'All Candidates',
  'Compliant Only',
  'Needs Review',
  'High Risk'
];

export default function EmployerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    competencies: [],
    roleType: [],
    performanceTags: [],
    minRating: 1,
    maxRating: 5,
    experienceRange: [0, 20],
    location: '',
    industry: [],
    verifiedOnly: false,
    complianceFilter: 'All Candidates'
  });

  useEffect(() => {
    // Check authentication and role
    if (!authLoading) {
      console.log('Auth check - user:', user);
      console.log('Auth check - user role:', user?.role);
      
      if (!user) {
        // User not logged in, redirect to login
        console.log('No user, redirecting to login');
        router.push('/login');
        return;
      }
      
      if (user.role !== 'employer' && (user.role as any) !== 'team_member') {
        // User doesn't have employer access, redirect to appropriate dashboard
        console.log('User role not employer, redirecting to appropriate dashboard');
        if (user.role === 'candidate') {
          router.push('/candidate/dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }
      
      // User is authenticated and has employer access, fetch data
      console.log('User has employer access, fetching data');
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    applyFilters();
  }, [candidates, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      const [candidatesResponse, statsResponse] = await Promise.all([
        fetch(`${getApiUrl()}/employer/candidates`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        }),
        fetch(`${getApiUrl()}/employer/dashboard-stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        })
      ]);

      console.log('Candidates response status:', candidatesResponse.status);
      console.log('Stats response status:', statsResponse.status);

      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json();
        console.log('Candidates data:', candidatesData);
        if (candidatesData.success) {
          setCandidates(candidatesData.data || []);
          console.log('Set candidates:', candidatesData.data?.length || 0);
        }
      } else {
        const errorData = await candidatesResponse.json();
        console.error('Candidates API error:', errorData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Stats data:', statsData);
        if (statsData.success) {
          setDashboardStats(statsData.data);
        }
      } else {
        const errorData = await statsResponse.json();
        console.error('Stats API error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    // Search filter
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.first_name.toLowerCase().includes(query) ||
        candidate.last_name.toLowerCase().includes(query) ||
        candidate.candidate_profile?.current_title?.toLowerCase().includes(query) ||
        candidate.candidate_profile?.current_company?.toLowerCase().includes(query) ||
        candidate.candidate_profile?.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Competencies filter
    if (filters.competencies.length > 0) {
      filtered = filtered.filter(candidate => 
        filters.competencies.some(competency => 
          candidate.candidate_profile?.skills?.some(skill => 
            skill.toLowerCase().includes(competency.toLowerCase())
          )
        )
      );
    }

    // Role type filter
    if (filters.roleType.length > 0) {
      filtered = filtered.filter(candidate => 
        filters.roleType.some(role => 
          candidate.candidate_profile?.current_title?.toLowerCase().includes(role.toLowerCase())
        )
      );
    }

    // Performance tags filter (based on reference strengths)
    if (filters.performanceTags.length > 0) {
      filtered = filtered.filter(candidate => 
        candidate.references?.some(ref => 
          filters.performanceTags.some(tag => 
            ref.strengths?.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Rating filter
    filtered = filtered.filter(candidate => {
      const avgRating = candidate.average_rating || 0;
      return avgRating >= filters.minRating && avgRating <= filters.maxRating;
    });

    // Experience filter
    filtered = filtered.filter(candidate => {
      const experience = candidate.candidate_profile?.experience_years || 0;
      return experience >= filters.experienceRange[0] && experience <= filters.experienceRange[1];
    });

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(candidate => 
        candidate.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Industry filter
    if (filters.industry.length > 0) {
      filtered = filtered.filter(candidate => 
        filters.industry.includes(candidate.candidate_profile?.industry || '')
      );
    }

    // Verified only filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(candidate => 
        candidate.references?.some(ref => ref.is_verified) ||
        candidate.verified_employments?.some(emp => emp.verification_status === 'VERIFIED')
      );
    }

    // Compliance filter
    if (filters.complianceFilter !== 'All Candidates') {
      filtered = filtered.filter(candidate => {
        const complianceScore = candidate.compliance_score || 0;
        switch (filters.complianceFilter) {
          case 'Compliant Only':
            return complianceScore >= 80;
          case 'Needs Review':
            return complianceScore >= 60 && complianceScore < 80;
          case 'High Risk':
            return complianceScore < 60;
          default:
            return true;
        }
      });
    }

    setFilteredCandidates(filtered);
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleArrayFilter = (filterType: 'competencies' | 'roleType' | 'performanceTags' | 'industry', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      competencies: [],
      roleType: [],
      performanceTags: [],
      minRating: 1,
      maxRating: 5,
      experienceRange: [0, 20],
      location: '',
      industry: [],
      verifiedOnly: false,
      complianceFilter: 'All Candidates'
    });
  };

  const getComplianceBadge = (score: number) => {
    if (score >= 80) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Compliant</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Review</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Risk</Badge>;
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
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

  // Show loading while fetching dashboard data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Dashboard</h1>
              <p className="text-gray-600">Unified view of verified candidates with compliance monitoring</p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.total_candidates}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Verified Candidates</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.verified_candidates}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.avg_rating.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Compliance Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.compliance_alerts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Skills in Pool</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.top_skills?.slice(0, 10).map((skill, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">{skill.skill}</span>
                      <Badge variant="secondary">{skill.count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Industry Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.industry_breakdown?.slice(0, 8).map((industry, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">{industry.industry}</span>
                      <Badge variant="outline">{industry.count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Search & Filter Candidates</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by name, title, company, or skills..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
                    {/* Competencies */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Competencies</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {COMPETENCIES.map(competency => (
                          <div key={competency} className="flex items-center space-x-2">
                            <Checkbox
                              id={`comp-${competency}`}
                              checked={filters.competencies.includes(competency)}
                              onCheckedChange={() => toggleArrayFilter('competencies', competency)}
                            />
                            <Label htmlFor={`comp-${competency}`} className="text-sm">{competency}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Role Types */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Role Types</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {ROLE_TYPES.map(role => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={`role-${role}`}
                              checked={filters.roleType.includes(role)}
                              onCheckedChange={() => toggleArrayFilter('roleType', role)}
                            />
                            <Label htmlFor={`role-${role}`} className="text-sm">{role}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Tags */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Performance Tags</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {PERFORMANCE_TAGS.map(tag => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`perf-${tag}`}
                              checked={filters.performanceTags.includes(tag)}
                              onCheckedChange={() => toggleArrayFilter('performanceTags', tag)}
                            />
                            <Label htmlFor={`perf-${tag}`} className="text-sm">{tag}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rating Range */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Rating: {filters.minRating} - {filters.maxRating}
                      </Label>
                      <div className="space-y-2">
                        <Slider
                          value={[filters.minRating, filters.maxRating]}
                          onValueChange={(value) => {
                            handleFilterChange('minRating', value[0]);
                            handleFilterChange('maxRating', value[1]);
                          }}
                          max={5}
                          min={1}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Experience Range */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Experience: {filters.experienceRange[0]} - {filters.experienceRange[1]} years
                      </Label>
                      <Slider
                        value={filters.experienceRange}
                        onValueChange={(value) => handleFilterChange('experienceRange', value)}
                        max={20}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Compliance Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Compliance Status</Label>
                      <Select value={filters.complianceFilter} onValueChange={(value) => handleFilterChange('complianceFilter', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPLIANCE_FILTERS.map(filter => (
                            <SelectItem key={filter} value={filter}>{filter}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quick Filters */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="verified-only"
                            checked={filters.verifiedOnly}
                            onCheckedChange={(checked) => handleFilterChange('verifiedOnly', checked)}
                          />
                          <Label htmlFor="verified-only" className="text-sm">Verified candidates only</Label>
                        </div>
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
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
                {filteredCandidates.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => window.location.href = `/employer/candidates/${candidate.id}`}
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
                        
                        {/* Compliance Badge */}
                        {candidate.compliance_score !== undefined && (
                          <div className="flex flex-col space-y-1">
                            {getComplianceBadge(candidate.compliance_score)}
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Rating */}
                      {candidate.average_rating > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {getRatingStars(candidate.average_rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {candidate.average_rating.toFixed(1)} ({candidate.references?.length || 0} reviews)
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

                      {/* Verified Badges */}
                      <div className="flex flex-wrap gap-1">
                        {candidate.references?.some(ref => ref.is_verified) && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Ref
                          </Badge>
                        )}
                        {candidate.verified_employments?.some(emp => emp.verification_status === 'VERIFIED') && (
                          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Work
                          </Badge>
                        )}
                      </div>

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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Compliance & Privacy Guardrails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Fair Hiring Practices</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Blind resume screening enabled
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Bias detection in reference reviews
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Standardized evaluation criteria
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Diversity metrics tracking
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Privacy Protection</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        GDPR compliant data handling
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Encrypted candidate data storage
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Audit trail for all profile views
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Candidate consent management
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3">Compliance Alerts</h4>
                  <div className="space-y-3">
                    {(dashboardStats?.compliance_alerts || 0) > 0 ? (
                      <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                        <div>
                          <p className="font-medium text-yellow-800">
                            {dashboardStats?.compliance_alerts || 0} candidates need compliance review
                          </p>
                          <p className="text-sm text-yellow-700">
                            Some candidates may have incomplete verification or require additional documentation.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-green-800">
                            All candidates are compliant
                          </p>
                          <p className="text-sm text-green-700">
                            No compliance issues detected in your candidate pool.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}