'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Star, 
  TrendingUp, 
  Users, 
  Award, 
  Target, 
  Brain,
  MessageSquare,
  Heart,
  Zap,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface RatingAnalytics {
  totalRatings: number;
  averageOverallRating: number;
  ratingDistribution: {
    technical_skills: number;
    communication_skills: number;
    problem_solving: number;
    cultural_fit: number;
    experience_qualifications: number;
    leadership_potential: number;
  };
  recommendationBreakdown: {
    strongly_recommend: number;
    recommend: number;
    neutral: number;
    do_not_recommend: number;
  };
  ratingsByType: {
    resume_review: number;
    phone_screen: number;
    technical_interview: number;
    behavioral_interview: number;
    final_interview: number;
  };
  topPerformers: any[];
  ratingTrends: any[];
}

const criteriaConfig = [
  { key: 'technical_skills', label: 'Technical Skills', icon: Zap, color: '#3b82f6' },
  { key: 'communication_skills', label: 'Communication', icon: MessageSquare, color: '#10b981' },
  { key: 'problem_solving', label: 'Problem Solving', icon: Brain, color: '#f59e0b' },
  { key: 'cultural_fit', label: 'Cultural Fit', icon: Heart, color: '#ef4444' },
  { key: 'experience_qualifications', label: 'Experience', icon: Award, color: '#8b5cf6' },
  { key: 'leadership_potential', label: 'Leadership', icon: Users, color: '#06b6d4' }
];

const recommendationColors = {
  strongly_recommend: '#10b981',
  recommend: '#3b82f6',
  neutral: '#f59e0b',
  do_not_recommend: '#ef4444'
};

export default function RatingAnalytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<RatingAnalytics | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'employer' && user.role !== 'team_member') {
        router.push('/jobs');
        return;
      }
      loadAnalytics();
    }
  }, [user, loading, timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/employer/rating-analytics?timeframe=${timeframe}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load rating analytics');
    } finally {
      setLoadingData(false);
    }
  };

  const getRadarData = () => {
    if (!analytics) return [];
    
    return criteriaConfig.map(criteria => ({
      criteria: criteria.label,
      value: parseFloat(analytics.ratingDistribution[criteria.key as keyof typeof analytics.ratingDistribution]) || 0,
      fullMark: 10
    }));
  };

  const getRecommendationData = () => {
    if (!analytics) return [];
    
    return Object.entries(analytics.recommendationBreakdown).map(([key, value]) => ({
      name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      color: recommendationColors[key as keyof typeof recommendationColors]
    }));
  };

  const getRatingTypeData = () => {
    if (!analytics) return [];
    
    return Object.entries(analytics.ratingsByType).map(([key, value]) => ({
      name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: value
    }));
  };

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'employer' && user.role !== 'team_member')) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Access denied. This page is only available for employers and team members.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Rating Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into candidate evaluation and rating patterns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAnalytics}>
              <Activity className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Ratings</p>
                    <p className="text-2xl font-bold">{analytics.totalRatings}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold">{analytics.averageOverallRating}/10</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recommended</p>
                    <p className="text-2xl font-bold">
                      {analytics.recommendationBreakdown.strongly_recommend + analytics.recommendationBreakdown.recommend}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Evaluation Types</p>
                    <p className="text-2xl font-bold">
                      {Object.keys(analytics.ratingsByType).filter(key => analytics.ratingsByType[key as keyof typeof analytics.ratingsByType] > 0).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="criteria">Criteria Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="types">Rating Types</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Skills Assessment Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="criteria" />
                          <PolarRadiusAxis angle={0} domain={[0, 10]} />
                          <Radar
                            name="Rating"
                            dataKey="value"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendation Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Recommendation Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getRecommendationData()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {getRecommendationData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="criteria" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {criteriaConfig.map(criteria => {
                  const Icon = criteria.icon;
                  const score = analytics.ratingDistribution[criteria.key as keyof typeof analytics.ratingDistribution];
                  const percentage = (score / 10) * 100;
                  
                  return (
                    <Card key={criteria.key}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${criteria.color}20` }}>
                            <Icon className="h-4 w-4" style={{ color: criteria.color }} />
                          </div>
                          <CardTitle className="text-lg">{criteria.label}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{score}/10</span>
                            <Badge variant="outline" style={{ borderColor: criteria.color, color: criteria.color }}>
                              {percentage.toFixed(0)}%
                            </Badge>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendation Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.recommendationBreakdown).map(([key, value]) => {
                        const color = recommendationColors[key as keyof typeof recommendationColors];
                        const percentage = analytics.totalRatings > 0 ? (value / analytics.totalRatings) * 100 : 0;
                        
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                              <span className="text-sm font-medium">
                                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                              <Badge variant="outline">{value}</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rating Quality Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Strong Candidates</p>
                        <p className="text-xs text-green-600 mt-1">
                          {analytics.recommendationBreakdown.strongly_recommend + analytics.recommendationBreakdown.recommend} candidates received positive recommendations
                        </p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Average Rating</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Overall candidate quality is {analytics.averageOverallRating >= 7 ? 'high' : analytics.averageOverallRating >= 5 ? 'moderate' : 'low'} with {analytics.averageOverallRating}/10 average
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium text-purple-800">Evaluation Coverage</p>
                        <p className="text-xs text-purple-600 mt-1">
                          {analytics.totalRatings} total evaluations across {Object.keys(analytics.ratingsByType).filter(key => analytics.ratingsByType[key as keyof typeof analytics.ratingsByType] > 0).length} interview types
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="types" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Ratings by Interview Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getRatingTypeData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
