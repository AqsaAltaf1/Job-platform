'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  UserCheck, 
  Briefcase, 
  FileText, 
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  RefreshCw
} from 'lucide-react';
import { getApiUrl } from '@/lib/config';
import { toast } from 'sonner';

interface ActivityItem {
  id: string;
  type: 'profile_view' | 'reference_completed' | 'application_update' | 'work_verified' | 'work_declined' | 'new_application';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    viewer_name?: string;
    viewer_company?: string;
    viewer_type?: string;
    reference_name?: string;
    job_title?: string;
    company_name?: string;
    status?: string;
    title?: string;
    verifier_name?: string;
  };
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      // Fetch real activity data from multiple sources
      const [profileViewsResponse, applicationsResponse, referencesResponse, workHistoryResponse] = await Promise.allSettled([
        // Fetch profile views
        fetch(getApiUrl('/references/transparency-data'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        }),
        // Fetch recent applications
        fetch(getApiUrl('/candidate/applications'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        }),
        // Fetch references
        fetch(getApiUrl('/candidate/references'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        }),
        // Fetch work history
        fetch(getApiUrl('/verified-employment'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        })
      ]);

      const activities: ActivityItem[] = [];

      // Process profile views
      if (profileViewsResponse.status === 'fulfilled' && profileViewsResponse.value.ok) {
        const profileViewsData = await profileViewsResponse.value.json();
        if (profileViewsData.success && profileViewsData.data.recent_views) {
          profileViewsData.data.recent_views.slice(0, 3).forEach((view: any) => {
            activities.push({
              id: `view_${view.id}`,
              type: 'profile_view',
              title: 'Profile viewed',
              description: view.viewer_type === 'anonymous' 
                ? 'Your profile was viewed by an anonymous user'
                : `Your profile was viewed by ${view.viewer?.first_name || 'an employer'}`,
              timestamp: view.viewed_at,
              metadata: {
                viewer_name: view.viewer?.first_name,
                viewer_company: view.viewer_company,
                viewer_type: view.viewer_type
              }
            });
          });
        }
      }

      // Process applications
      if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.ok) {
        const applicationsData = await applicationsResponse.value.json();
        if (applicationsData.success && applicationsData.data) {
          applicationsData.data.slice(0, 3).forEach((app: any) => {
            activities.push({
              id: `app_${app.id}`,
              type: 'application_update',
              title: 'Application status updated',
              description: `Your application for ${app.job?.title || 'a position'} at ${app.job?.company_name || 'a company'} is ${app.status}`,
              timestamp: app.updated_at || app.created_at,
              metadata: {
                job_title: app.job?.title,
                company_name: app.job?.company_name,
                status: app.status
              }
            });
          });
        }
      }

      // Process references
      if (referencesResponse.status === 'fulfilled' && referencesResponse.value.ok) {
        const referencesData = await referencesResponse.value.json();
        if (referencesData.success && referencesData.data) {
          referencesData.data.slice(0, 2).forEach((ref: any) => {
            if (ref.status === 'completed') {
              activities.push({
                id: `ref_${ref.id}`,
                type: 'reference_completed',
                title: 'Reference completed',
                description: `${ref.reviewer_name} completed your reference request`,
                timestamp: ref.created_at,
                metadata: {
                  reference_name: ref.reviewer_name
                }
              });
            }
          });
        }
      }

      // Process work history verification
      if (workHistoryResponse.status === 'fulfilled' && workHistoryResponse.value.ok) {
        const workHistoryData = await workHistoryResponse.value.json();
        if (workHistoryData.success && workHistoryData.data) {
          workHistoryData.data.slice(0, 3).forEach((work: any) => {
            if (work.verification_status === 'VERIFIED') {
              activities.push({
                id: `work_verified_${work.id}`,
                type: 'work_verified',
                title: 'Work history verified',
                description: `Your employment at ${work.company_name} as ${work.title} was verified`,
                timestamp: work.verified_at || work.updated_at,
                metadata: {
                  company_name: work.company_name,
                  title: work.title,
                  verifier_name: work.verifier_name
                }
              });
            } else if (work.verification_status === 'DECLINED') {
              activities.push({
                id: `work_declined_${work.id}`,
                type: 'work_declined',
                title: 'Work history declined',
                description: `Verification for ${work.company_name} as ${work.title} was declined`,
                timestamp: work.updated_at,
                metadata: {
                  company_name: work.company_name,
                  title: work.title,
                  verifier_name: work.verifier_name
                }
              });
            }
          });
        }
      }

      // Sort activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast.error('Failed to load recent activity');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRecentActivity(true);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'profile_view':
        return <Eye className="h-4 w-4" />;
      case 'reference_completed':
        return <UserCheck className="h-4 w-4" />;
      case 'application_update':
        return <Briefcase className="h-4 w-4" />;
      case 'work_verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'work_declined':
        return <XCircle className="h-4 w-4" />;
      case 'new_application':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'profile_view':
        return 'bg-blue-500';
      case 'reference_completed':
        return 'bg-green-500';
      case 'application_update':
        return 'bg-yellow-500';
      case 'work_verified':
        return 'bg-green-500';
      case 'work_declined':
        return 'bg-red-500';
      case 'new_application':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'profile_view':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">View</Badge>;
      case 'reference_completed':
        return <Badge variant="outline" className="text-green-600 border-green-200">Reference</Badge>;
      case 'application_update':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Application</Badge>;
      case 'work_verified':
        return <Badge variant="outline" className="text-green-600 border-green-200">Verified</Badge>;
      case 'work_declined':
        return <Badge variant="outline" className="text-red-600 border-red-200">Declined</Badge>;
      case 'new_application':
        return <Badge variant="outline" className="text-indigo-600 border-indigo-200">Applied</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
        <p className="text-muted-foreground">
          Your recent activity will appear here as you interact with the platform.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Recent Activity</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Activities list */}
      <div className={`space-y-3 ${activities.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
        {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2 flex-shrink-0`}></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium truncate">{activity.title}</p>
              {getActivityBadge(activity.type)}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(activity.timestamp)}
            </div>
          </div>
        </div>
        ))}
        
        {activities.length > 5 && (
          <div className="pt-2 border-t sticky bottom-0 bg-white">
            <p className="text-xs text-muted-foreground text-center">
              {activities.length} total activities
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
