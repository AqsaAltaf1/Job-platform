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
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target, 
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface AnalyticsData {
  overview: {
    totalApplications: number;
    totalHired: number;
    averageTimeToHire: number;
    conversionRate: number;
    totalJobViews: number;
    totalJobs: number;
    activeJobs: number;
    costPerHire: number;
  };
  applicationTrends: Array<{
    date: string;
    applications: number;
    hired: number;
    rejected: number;
  }>;
  jobPerformance: Array<{
    jobTitle: string;
    applications: number;
    views: number;
    conversionRate: number;
    avgTimeToHire: number;
  }>;
  sourceAnalytics: Array<{
    source: string;
    applications: number;
    hired: number;
    conversionRate: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  hiringFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  departmentStats: Array<{
    department: string;
    openPositions: number;
    applications: number;
    hired: number;
  }>;
  salaryAnalytics: Array<{
    range: string;
    applications: number;
    avgTimeToHire: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('applications');

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'employer' && user.role !== 'team_member') {
        router.push('/jobs');
        return;
      }
      loadAnalytics();
    }
  }, [user, loading, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/employer/analytics?days=${dateRange}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.analytics);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `hiring-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Analytics data exported successfully');
  };

  if (loading || loadingAnalytics) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'employer' && user.role !== 'team_member')) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Access denied. This dashboard is only available for employers and team members.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No analytics data available. Start hiring to see insights!
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
            <h1 className="text-3xl font-bold mb-2">Hiring Analytics</h1>
            <p className="text-muted-foreground">
              Track your recruitment performance and optimize your hiring process
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalApplications}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+12% from last period</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hired Candidates</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalHired}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+8% from last period</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time to Hire</p>
                <p className="text-2xl font-bold">{analyticsData.overview.averageTimeToHire} days</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">-2 days improved</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+1.2% from last period</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Hiring Funnel
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Job Performance
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Departments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.applicationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="applications" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="hired" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiring Funnel Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analyticsData.hiringFunnel.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{stage.count} candidates</span>
                        <Badge variant="secondary">{stage.percentage}%</Badge>
                      </div>
                    </div>
                    <Progress value={stage.percentage} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.jobPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="jobTitle" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                  <Bar dataKey="views" fill="#82ca9d" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.sourceAnalytics}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="applications"
                      label={({ source, applications }) => `${source}: ${applications}`}
                    >
                      {analyticsData.sourceAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.sourceAnalytics.map((source) => (
                    <div key={source.source} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{source.source}</p>
                        <p className="text-sm text-muted-foreground">
                          {source.applications} applications • {source.hired} hired
                        </p>
                      </div>
                      <Badge variant={source.conversionRate > 15 ? "default" : "secondary"}>
                        {source.conversionRate}% conversion
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Hiring Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.departmentStats.map((dept) => (
                  <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{dept.department}</h4>
                      <p className="text-sm text-muted-foreground">
                        {dept.openPositions} open positions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{dept.applications} applications</p>
                      <p className="text-sm text-muted-foreground">{dept.hired} hired</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
