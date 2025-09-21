'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  BarChart3,
  Eye,
  Settings
} from 'lucide-react';
import { showToast } from '@/lib/toast';

interface BiasReductionAnalytics {
  summary: {
    total_processed: number;
    success_rate: number;
    average_consistency_score: number;
    inconsistent_reviewers: number;
    total_reviewers: number;
  };
  processing_logs: Array<{
    id: string;
    processing_type: string;
    processing_status: string;
    processing_time_ms: number;
    created_at: string;
  }>;
  consistency_analytics: Array<{
    id: string;
    reviewer_email: string;
    total_reviews: number;
    consistency_score: number;
    is_consistent: boolean;
    issues_detected: string[];
  }>;
}

interface ReviewerConsistencyReport {
  total_reviewers: number;
  consistent_reviewers: number;
  inconsistent_reviewers: number;
  average_consistency_score: number;
  reviewers: Array<{
    reviewer_email: string;
    total_reviews: number;
    average_rating: number;
    consistency_score: number;
    is_consistent: boolean;
    issues_detected: string[];
  }>;
}

export default function BiasReductionDashboard() {
  const [analytics, setAnalytics] = useState<BiasReductionAnalytics | null>(null);
  const [consistencyReport, setConsistencyReport] = useState<ReviewerConsistencyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/bias-reduction/analytics?period=daily&limit=30', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast.error('Failed to load analytics data');
    }
  };

  const fetchConsistencyReport = async () => {
    try {
      const response = await fetch('/api/bias-reduction/consistency-report?minReviews=3', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConsistencyReport(data.data);
      }
    } catch (error) {
      console.error('Error fetching consistency report:', error);
      showToast.error('Failed to load consistency report');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchConsistencyReport()]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    showToast.success('Data refreshed successfully');
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading bias reduction analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Bias Reduction Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage bias reduction across skill endorsements
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.total_processed}</div>
              <p className="text-xs text-muted-foreground">
                Endorsements processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.success_rate.toFixed(1)}%</div>
              <Progress value={analytics.summary.success_rate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Consistency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getConsistencyColor(analytics.summary.average_consistency_score)}`}>
                {analytics.summary.average_consistency_score.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 100
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inconsistent Reviewers</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analytics.summary.inconsistent_reviewers}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of {analytics.summary.total_reviewers} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consistency">Reviewer Consistency</TabsTrigger>
          <TabsTrigger value="processing">Processing Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>NLP Anonymization</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sentiment Normalization</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Consistency Monitoring</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Automatic Processing</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.processing_logs?.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="text-sm font-medium">{log.processing_type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(log.processing_status)}>
                      {log.processing_status}
                    </Badge>
                  </div>
                )) || (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Reviewer Consistency Report
              </CardTitle>
              <CardDescription>
                Monitor reviewer rating patterns and consistency scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consistencyReport ? (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {consistencyReport.consistent_reviewers}
                      </div>
                      <div className="text-sm text-green-600">Consistent Reviewers</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {consistencyReport.inconsistent_reviewers}
                      </div>
                      <div className="text-sm text-red-600">Inconsistent Reviewers</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {consistencyReport.average_consistency_score.toFixed(1)}
                      </div>
                      <div className="text-sm text-blue-600">Avg Consistency Score</div>
                    </div>
                  </div>

                  {/* Reviewers Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Reviewer</th>
                          <th className="text-left p-2">Reviews</th>
                          <th className="text-left p-2">Avg Rating</th>
                          <th className="text-left p-2">Consistency</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consistencyReport.reviewers.map((reviewer) => (
                          <tr key={reviewer.reviewer_email} className="border-b">
                            <td className="p-2">
                              <div className="font-medium">{reviewer.reviewer_email}</div>
                            </td>
                            <td className="p-2">{reviewer.total_reviews}</td>
                            <td className="p-2">{reviewer.average_rating?.toFixed(1) || 'N/A'}</td>
                            <td className="p-2">
                              <span className={getConsistencyColor(reviewer.consistency_score || 0)}>
                                {reviewer.consistency_score || 0}
                              </span>
                            </td>
                            <td className="p-2">
                              {reviewer.is_consistent ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Consistent
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inconsistent
                                </Badge>
                              )}
                            </td>
                            <td className="p-2">
                              {reviewer.issues_detected?.length > 0 ? (
                                <div className="text-xs text-red-600">
                                  {reviewer.issues_detected.join(', ')}
                                </div>
                              ) : (
                                <span className="text-xs text-green-600">None</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No consistency data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Processing Logs
              </CardTitle>
              <CardDescription>
                Recent bias reduction processing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.processing_logs && analytics.processing_logs.length > 0 ? (
                <div className="space-y-2">
                  {analytics.processing_logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.processing_type}</span>
                          <Badge className={getStatusColor(log.processing_status)}>
                            {log.processing_status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(log.created_at).toLocaleString()} • 
                          Processing time: {log.processing_time_ms}ms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No processing logs available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Bias Reduction Settings
              </CardTitle>
              <CardDescription>
                Configure bias reduction system parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Bias reduction is automatically applied to all new endorsements. 
                  The system uses OpenAI's GPT-3.5-turbo model for text processing.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Automatic Processing</h4>
                    <p className="text-sm text-gray-500">Process all new endorsements automatically</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Consistency Monitoring</h4>
                    <p className="text-sm text-gray-500">Monitor reviewer rating patterns</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Fallback Processing</h4>
                    <p className="text-sm text-gray-500">Use regex-based anonymization when OpenAI is unavailable</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
