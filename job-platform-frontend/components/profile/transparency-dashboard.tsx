'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Building2, 
  User, 
  Calendar,
  ChevronDown,
  ChevronRight,
  Globe
} from 'lucide-react';
import { getApiUrl } from '@/lib/config';
import { toast } from 'sonner';

interface ProfileView {
  id: number;
  viewer_id?: string;
  viewer_type: 'employer' | 'recruiter' | 'anonymous' | 'candidate';
  viewer_email?: string;
  viewer_company?: string;
  viewed_at: string;
  viewer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TransparencyData {
  total_views: number;
  views_by_date: Record<string, ProfileView[]>;
  recent_views: ProfileView[];
}

export default function TransparencyDashboard() {
  const [data, setData] = useState<TransparencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTransparencyData();
  }, []);

  const fetchTransparencyData = async () => {
    try {
      const response = await fetch(getApiUrl('/references/transparency-data'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        throw new Error('Failed to fetch transparency data');
      }
    } catch (error) {
      console.error('Error fetching transparency data:', error);
      toast.error('Failed to load profile view data');
    } finally {
      setLoading(false);
    }
  };

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const getViewerTypeIcon = (type: string) => {
    switch (type) {
      case 'employer':
        return <Building2 className="h-4 w-4" />;
      case 'recruiter':
        return <User className="h-4 w-4" />;
      case 'anonymous':
        return <Globe className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getViewerTypeColor = (type: string) => {
    switch (type) {
      case 'employer':
        return 'bg-blue-100 text-blue-800';
      case 'recruiter':
        return 'bg-green-100 text-green-800';
      case 'anonymous':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data || data.total_views === 0) {
    return (
      <div className="text-center py-6">
        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Profile Views Yet</h3>
        <p className="text-muted-foreground">
          Your profile views will appear here once employers start viewing your profile.
        </p>
      </div>
    );
  }

  const sortedDates = Object.keys(data.views_by_date).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{data.total_views}</p>
          <p className="text-sm text-muted-foreground">Total Profile Views</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {data.recent_views.length} Recent
        </Badge>
      </div>

      {/* Views by Date */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Views by Date</h4>
        {sortedDates.slice(0, 7).map((date) => {
          const views = data.views_by_date[date];
          const isExpanded = expandedDates.has(date);
          
          return (
            <div key={date} className="border rounded-lg">
              <button
                onClick={() => toggleDateExpansion(date)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">{formatDate(date)}</p>
                    <p className="text-sm text-muted-foreground">
                      {views.length} view{views.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{views.length}</Badge>
              </button>
              
              {isExpanded && (
                <div className="border-t bg-gray-50/50">
                  {views.map((view) => (
                    <div key={view.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getViewerTypeIcon(view.viewer_type)}
                        <div>
                          <p className="font-medium text-sm">
                            {view.viewer_type === 'anonymous' ? 'Anonymous Viewer' : 
                             view.viewer ? `${view.viewer.first_name} ${view.viewer.last_name}` :
                             view.viewer_email || 'Unknown Viewer'}
                          </p>
                          {view.viewer_company && (
                            <p className="text-xs text-muted-foreground">
                              {view.viewer_company}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getViewerTypeColor(view.viewer_type)}`}
                        >
                          {view.viewer_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(view.viewed_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Views Summary */}
      {data.recent_views.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Recent Views</h4>
          <div className="space-y-2">
            {data.recent_views.slice(0, 5).map((view) => (
              <div key={view.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getViewerTypeIcon(view.viewer_type)}
                  <span>
                    {view.viewer_type === 'anonymous' ? 'Anonymous' :
                     view.viewer ? `${view.viewer.first_name} ${view.viewer.last_name}` :
                     view.viewer_email || 'Unknown'}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {formatTime(view.viewed_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}