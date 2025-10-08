'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { getApiUrl } from '@/lib/config';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface SubscriptionAnalytics {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    churnRate: string;
  };
  billing: {
    monthlySubscriptions: number;
    yearlySubscriptions: number;
  };
  planDistribution: Array<{
    plan_name: string;
    count: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    created_at: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    newPlan: {
      display_name: string;
    } | null;
  }>;
}

export default function SubscriptionAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/admin/subscription-analytics'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Load subscription analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'upgraded':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'downgraded':
        return <TrendingDown className="h-4 w-4 text-yellow-600" />;
      case 'canceled':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only super administrators can access subscription analytics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
              <p className="text-muted-foreground">Unable to load subscription analytics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const planData = analytics.planDistribution.map((item) => ({
    name: item.plan_name,
    value: parseInt(item.count)
  }));

  const billingData = [
    { name: 'Monthly', value: analytics.billing.monthlySubscriptions },
    { name: 'Yearly', value: analytics.billing.yearlySubscriptions }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Subscription Analytics</h1>
          <p className="text-muted-foreground">Monitor subscription metrics and revenue</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">All time subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.overview.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceled Subscriptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overview.canceledSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Total canceled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics.overview.churnRate}%</div>
            <p className="text-xs text-muted-foreground">Cancellation rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Active subscriptions by plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Billing Cycle Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Cycles</CardTitle>
            <CardDescription>Monthly vs Yearly subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={billingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscription Activity</CardTitle>
          <CardDescription>Latest subscription changes and events</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(activity.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{formatActionName(activity.action)}</span>
                      {activity.newPlan && (
                        <Badge variant="outline">{activity.newPlan.display_name}</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {activity.user.first_name} {activity.user.last_name} ({activity.user.email})
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 text-sm text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${analytics.billing.monthlySubscriptions * 79} {/* Assuming avg $79/month */}
              </div>
              <p className="text-sm text-muted-foreground">
                From {analytics.billing.monthlySubscriptions} monthly subscriptions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Yearly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${analytics.billing.yearlySubscriptions * 790} {/* Assuming avg $790/year */}
              </div>
              <p className="text-sm text-muted-foreground">
                From {analytics.billing.yearlySubscriptions} yearly subscriptions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
