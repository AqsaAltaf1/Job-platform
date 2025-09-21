'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { showToast } from '@/lib/toast';

interface ProcessingMetrics {
  total_processed: number;
  success_rate: number;
  average_processing_time: number;
  anonymization_rate: number;
  sentiment_normalization_rate: number;
}

interface ConsistencyMetrics {
  total_reviewers: number;
  consistent_reviewers: number;
  inconsistent_reviewers: number;
  average_consistency_score: number;
  reviewers_with_issues: number;
}

interface BiasReductionMetrics {
  processing: ProcessingMetrics;
  consistency: ConsistencyMetrics;
  trends: {
    daily_processing: Array<{ date: string; count: number; success_rate: number }>;
    consistency_scores: Array<{ date: string; score: number }>;
  };
}

export default function BiasReductionAnalytics() {
  const [metrics, setMetrics] = useState<BiasReductionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bias-reduction/analytics?period=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      } else {
        showToast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      showToast.error('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <BarChart3 className="h-4 w-4 text-gray-600" />;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Analytics data will appear here once bias reduction processing begins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bias Reduction Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Processing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.processing.total_processed}</div>
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
            <div className="text-2xl font-bold">{metrics.processing.success_rate.toFixed(1)}%</div>
            <Progress value={metrics.processing.success_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.processing.average_processing_time.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              Per endorsement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anonymization Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.processing.anonymization_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Successfully anonymized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Consistency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviewers</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.consistency.total_reviewers}</div>
            <p className="text-xs text-muted-foreground">
              Active reviewers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistent Reviewers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.consistency.consistent_reviewers}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.consistency.consistent_reviewers / metrics.consistency.total_reviewers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inconsistent Reviewers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.consistency.inconsistent_reviewers}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Consistency Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(metrics.consistency.average_consistency_score)}`}>
              {metrics.consistency.average_consistency_score.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Processing Performance</CardTitle>
            <CardDescription>Bias reduction processing metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Anonymization Success</span>
                <span className={getPerformanceColor(metrics.processing.anonymization_rate)}>
                  {metrics.processing.anonymization_rate.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.processing.anonymization_rate} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sentiment Normalization</span>
                <span className={getPerformanceColor(metrics.processing.sentiment_normalization_rate)}>
                  {metrics.processing.sentiment_normalization_rate.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.processing.sentiment_normalization_rate} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Success Rate</span>
                <span className={getPerformanceColor(metrics.processing.success_rate)}>
                  {metrics.processing.success_rate.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.processing.success_rate} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reviewer Consistency</CardTitle>
            <CardDescription>Reviewer rating consistency metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Consistency Score</span>
                <span className={getPerformanceColor(metrics.consistency.average_consistency_score)}>
                  {metrics.consistency.average_consistency_score.toFixed(1)}/100
                </span>
              </div>
              <Progress value={metrics.consistency.average_consistency_score} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Consistent Reviewers</span>
                <span className="text-green-600">
                  {metrics.consistency.consistent_reviewers}/{metrics.consistency.total_reviewers}
                </span>
              </div>
              <Progress 
                value={(metrics.consistency.consistent_reviewers / metrics.consistency.total_reviewers) * 100} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reviewers with Issues</span>
                <span className="text-red-600">
                  {metrics.consistency.reviewers_with_issues}
                </span>
              </div>
              <Progress 
                value={(metrics.consistency.reviewers_with_issues / metrics.consistency.total_reviewers) * 100}
                className="[&>div]:bg-red-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Trends</CardTitle>
          <CardDescription>Daily processing volume and success rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
