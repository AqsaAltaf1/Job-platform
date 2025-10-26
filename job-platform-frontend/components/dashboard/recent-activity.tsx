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

  // Set up polling for live updates (every 15 seconds for better real-time updates)
  useEffect(() => {
    console.log('🔄 Setting up recent activity polling...');
    const interval = setInterval(() => {
      console.log('🔄 Polling recent activity...');
      fetchRecentActivity();
    }, 15000); // Reduced to 15 seconds for better real-time updates

    return () => {
      console.log('🔄 Clearing recent activity polling...');
      clearInterval(interval);
    };
  }, []);

  const fetchRecentActivity = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      // Fetch only notifications for the last 24 hours to avoid duplicates
      const notificationsResponse = await fetch(getApiUrl('/notifications'), {
          headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const activities: ActivityItem[] = [];

      // Process notifications (including profile views) - only last 24 hours
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        console.log('🔔 Notifications data:', notificationsData);
        if (notificationsData.success && notificationsData.notifications) {
          // Filter for last 24 hours
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          
          // Filter for relevant notification types and last 24 hours
          const recentNotifications = notificationsData.notifications
            .filter((notification: any) => {
              const notificationDate = new Date(notification.created_at);
              return notificationDate >= twentyFourHoursAgo && (
                notification.type === 'profile_view' || 
                notification.type === 'reference' ||
                notification.type === 'work_verified' ||
                notification.type === 'application_status'
              );
            })
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10); // Limit to 10 most recent

          recentNotifications.forEach((notification: any) => {
            let activityType: ActivityItem['type'] = 'profile_view';
            let title = 'Profile viewed';
            let description = notification.message;

            if (notification.type === 'reference') {
              activityType = 'reference_completed';
              title = 'Reference completed';
            } else if (notification.type === 'work_verified') {
              activityType = 'work_verified';
              title = 'Work history verified';
            } else if (notification.type === 'application_status') {
              activityType = 'application_update';
              title = 'Application updated';
            }

            activities.push({
              id: `notif_${notification.id}`,
              type: activityType,
              title,
              description,
              timestamp: notification.created_at,
              metadata: {
                viewer_name: notification.data?.viewerName,
                viewer_company: notification.data?.companyName,
                viewer_type: notification.data?.viewerType,
                job_title: notification.data?.jobTitle,
                company_name: notification.data?.companyName,
                status: notification.data?.status
              }
            });
          console.log('🔔 Recent notifications (24h):', recentNotifications);
          console.log('🔔 Activities created:', activities.length);
          console.log('🔔 Total notifications received:', notificationsData.notifications.length);
          console.log('🔔 Profile view notifications:', notificationsData.notifications.filter((n: any) => n.type === 'profile_view').length);
          });
        }
      }
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh of recent activity triggered');
    await fetchRecentActivity(true);
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
          No activity in the last 24 hours. Your recent profile views, applications, and other activities will appear here.
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
          <Badge variant="secondary" className="text-xs">
            Last 24 hours
          </Badge>
          {refreshing && (
            <Badge variant="outline" className="text-xs text-blue-600">
              Updating...
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 w-8 p-0"
          title="Refresh recent activity"
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
          <div className="pt-2 sticky bottom-0 bg-white">
            <p className="text-xs text-muted-foreground text-center">
              {activities.length} total activities
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
