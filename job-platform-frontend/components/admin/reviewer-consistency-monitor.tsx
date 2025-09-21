'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { showToast } from '@/lib/toast';

interface ReviewerConsistency {
  reviewer_email: string;
  total_reviews: number;
  average_rating: number;
  consistency_score: number;
  is_consistent: boolean;
  issues_detected: string[];
  last_analyzed_at: string;
}

interface ConsistencyReport {
  total_reviewers: number;
  consistent_reviewers: number;
  inconsistent_reviewers: number;
  average_consistency_score: number;
  reviewers: ReviewerConsistency[];
}

export default function ReviewerConsistencyMonitor() {
  const [report, setReport] = useState<ConsistencyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minReviews, setMinReviews] = useState(3);
  const [sortBy, setSortBy] = useState<'consistency' | 'reviews' | 'rating'>('consistency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchConsistencyReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bias-reduction/consistency-report?minReviews=${minReviews}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReport(data.data);
      } else {
        showToast.error('Failed to load consistency report');
      }
    } catch (error) {
      console.error('Error fetching consistency report:', error);
      showToast.error('Error loading consistency report');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSpecificReviewer = async (reviewerEmail: string) => {
    try {
      const response = await fetch(`/api/bias-reduction/reviewer/${encodeURIComponent(reviewerEmail)}/consistency`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        showToast.success(`Analyzed ${reviewerEmail}`);
        fetchConsistencyReport(); // Refresh the report
      } else {
        showToast.error('Failed to analyze reviewer');
      }
    } catch (error) {
      console.error('Error analyzing reviewer:', error);
      showToast.error('Error analyzing reviewer');
    }
  };

  useEffect(() => {
    fetchConsistencyReport();
  }, [minReviews]);

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConsistencyBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredReviewers = report?.reviewers
    .filter(reviewer => 
      reviewer.reviewer_email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'consistency':
          aValue = a.consistency_score || 0;
          bValue = b.consistency_score || 0;
          break;
        case 'reviews':
          aValue = a.total_reviews;
          bValue = b.total_reviews;
          break;
        case 'rating':
          aValue = a.average_rating || 0;
          bValue = b.average_rating || 0;
          break;
        default:
          aValue = a.consistency_score || 0;
          bValue = b.consistency_score || 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading consistency report...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Reviewer Consistency Monitor
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor reviewer rating patterns and consistency scores
          </p>
        </div>
        <Button onClick={fetchConsistencyReport} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviewers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.total_reviewers}</div>
              <p className="text-xs text-muted-foreground">
                Active reviewers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consistent</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{report.consistent_reviewers}</div>
              <p className="text-xs text-muted-foreground">
                {((report.consistent_reviewers / report.total_reviewers) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inconsistent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{report.inconsistent_reviewers}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Consistency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getConsistencyColor(report.average_consistency_score)}`}>
                {report.average_consistency_score.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 100
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reviewers by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min reviews"
                value={minReviews}
                onChange={(e) => setMinReviews(parseInt(e.target.value) || 0)}
                className="w-32"
              />
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy as any);
                  setSortOrder(newSortOrder as any);
                }}
                className="px-3 py-2 border rounded-md"
              >
                <option value="consistency-desc">Consistency (High to Low)</option>
                <option value="consistency-asc">Consistency (Low to High)</option>
                <option value="reviews-desc">Reviews (High to Low)</option>
                <option value="reviews-asc">Reviews (Low to High)</option>
                <option value="rating-desc">Rating (High to Low)</option>
                <option value="rating-asc">Rating (Low to High)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviewers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviewer Details</CardTitle>
          <CardDescription>
            {filteredReviewers.length} reviewers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReviewers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Reviewer</th>
                    <th className="text-left p-3 font-medium">Reviews</th>
                    <th className="text-left p-3 font-medium">Avg Rating</th>
                    <th className="text-left p-3 font-medium">Consistency</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Issues</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviewers.map((reviewer) => (
                    <tr key={reviewer.reviewer_email} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{reviewer.reviewer_email}</div>
                        <div className="text-sm text-gray-500">
                          Last analyzed: {new Date(reviewer.last_analyzed_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{reviewer.total_reviews}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {getRatingStars(reviewer.average_rating || 0)}
                          <span className="ml-2 text-sm">
                            {reviewer.average_rating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getConsistencyBadgeColor(reviewer.consistency_score || 0)}>
                          {reviewer.consistency_score || 0}
                        </Badge>
                      </td>
                      <td className="p-3">
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
                      <td className="p-3">
                        {reviewer.issues_detected?.length > 0 ? (
                          <div className="space-y-1">
                            {reviewer.issues_detected.map((issue, index) => (
                              <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                {issue}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-green-600">None</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => analyzeSpecificReviewer(reviewer.reviewer_email)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Analyze
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviewers Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'No reviewers meet the current criteria'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts for Inconsistent Reviewers */}
      {report && report.inconsistent_reviewers > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{report.inconsistent_reviewers} reviewers</strong> have been flagged for inconsistent rating patterns. 
            Consider reviewing their feedback and providing guidance on rating standards.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
