'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Eye, 
  Building2, 
  User, 
  Calendar,
  ChevronDown,
  ChevronRight,
  Globe,
  Download,
  Settings,
  Shield,
  Activity,
  BarChart3,
  FileText,
  Clock,
  Users,
  TrendingUp,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { getApiUrl } from '@/lib/config';

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

interface AuditLogEntry {
  id: string;
  action_type: string;
  action_category: string;
  description: string;
  target_user_id?: string;
  target_resource_id?: string;
  target_resource_type?: string;
  metadata: any;
  performed_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  targetUser?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface PrivacySetting {
  setting_type: string;
  setting_value: any;
  effective_from: string;
  is_active: boolean;
}

interface DataExport {
  id: string;
  export_type: string;
  export_format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path?: string;
  file_size?: number;
  download_count: number;
  expires_at?: string;
  requested_at: string;
  completed_at?: string;
}

interface TransparencyData {
  analytics: {
    profileViews: ProfileView[];
    activities: AuditLogEntry[];
    activityStats: Record<string, number>;
    dailyStats: Record<string, any>;
    totalProfileViews: number;
    totalActivities: number;
  };
  timeline: Record<string, AuditLogEntry[]>;
  privacySettings: Record<string, any>;
  exportHistory: DataExport[];
  summary: {
    totalProfileViews: number;
    totalActivities: number;
    activePrivacySettings: number;
    totalExports: number;
  };
}

interface ComprehensiveTransparencyDashboardProps {
  refreshTrigger?: number;
}

export default function ComprehensiveTransparencyDashboard({ refreshTrigger }: ComprehensiveTransparencyDashboardProps) {
  const [data, setData] = useState<TransparencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [privacySettings, setPrivacySettings] = useState<Record<string, any>>({});
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    fetchTransparencyData();
  }, [refreshTrigger, selectedTimeframe]);

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage('');
    }, 5000);
  };

  const fetchTransparencyData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(getApiUrl(`/candidate/transparency/comprehensive?days=${selectedTimeframe}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Comprehensive transparency data received:', result);
        console.log('📦 Export history in data:', result.data?.exportHistory?.length || 0, 'exports');
        setData(result.data);
        setPrivacySettings(result.data.privacySettings);
      } else {
        throw new Error('Failed to fetch transparency data');
      }
    } catch (error) {
      console.error('Error fetching transparency data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updatePrivacySetting = async (settingType: string, value: any) => {
    try {
      setUpdatingSettings(true);
      const response = await fetch(getApiUrl('/candidate/privacy-settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          settings: {
            [settingType]: value
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPrivacySettings(prev => ({
          ...prev,
          [settingType]: value
        }));
        console.log('Privacy setting updated:', result);
        // Show success feedback
        showAlert('Privacy setting updated successfully!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update privacy setting');
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      // Show error feedback
      showAlert(`Failed to update privacy setting: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const requestDataExport = async (exportType: string, format: string = 'json') => {
    try {
      const response = await fetch(getApiUrl('/candidate/data-export'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          exportType,
          exportFormat: format
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Data export requested:', result);
        showAlert('Data export requested successfully!', 'success');
        // Refresh data to show new export request
        fetchTransparencyData();
      } else {
        throw new Error('Failed to request data export');
      }
    } catch (error) {
      console.error('Error requesting data export:', error);
      showAlert('Failed to request data export', 'error');
    }
  };

  const downloadExport = async (exportId: string, format: string = 'json') => {
    try {
      console.log('🔄 Starting download for export:', exportId, 'format:', format);
      
      const response = await fetch(getApiUrl(`/candidate/transparency/export?exportId=${exportId}&format=${format}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      console.log('📡 Download response status:', response.status);
      console.log('📡 Download response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const blob = await response.blob();
        console.log('📦 Blob created, size:', blob.size, 'type:', blob.type);
        
        const url = window.URL.createObjectURL(blob);
        console.log('🔗 Object URL created:', url);
        
        const a = document.createElement('a');
        a.href = url;
        
        // Set appropriate file extension based on format
        let fileExtension = 'json';
        if (format === 'csv') fileExtension = 'csv';
        if (format === 'pdf') fileExtension = 'pdf';
        
        const filename = `transparency-data-${exportId}-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
        a.download = filename;
        console.log('📁 Download filename:', filename);
        
        document.body.appendChild(a);
        console.log('🖱️ Triggering download click...');
        a.click();
        
        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          console.log('🧹 Cleaned up download elements');
        }, 1000);
        
        showAlert(`Data export downloaded successfully as ${format.toUpperCase()}!`, 'success');
      } else {
        const errorText = await response.text();
        console.error('❌ Download failed:', response.status, errorText);
        throw new Error(`Failed to download export: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error downloading export:', error);
      showAlert('Failed to download data export', 'error');
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

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'profile_view':
        return <Eye className="h-4 w-4" />;
      case 'reference_submission':
        return <Users className="h-4 w-4" />;
      case 'reference_approval':
        return <CheckCircle className="h-4 w-4" />;
      case 'reference_visibility_change':
        return <Eye className="h-4 w-4" />;
      case 'profile_edit':
        return <FileText className="h-4 w-4" />;
      case 'privacy_setting_change':
        return <Shield className="h-4 w-4" />;
      case 'data_export':
        return <Download className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'profile_view':
        return 'bg-blue-100 text-blue-800';
      case 'reference_submission':
        return 'bg-yellow-100 text-yellow-800';
      case 'reference_approval':
        return 'bg-green-100 text-green-800';
      case 'reference_visibility_change':
        return 'bg-purple-100 text-purple-800';
      case 'profile_edit':
        return 'bg-indigo-100 text-indigo-800';
      case 'privacy_setting_change':
        return 'bg-red-100 text-red-800';
      case 'data_export':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading transparency data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground">
          Unable to load transparency data. Please try refreshing the page.
        </p>
        <Button onClick={fetchTransparencyData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const sortedDates = Object.keys(data.timeline).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transparency Dashboard</h2>
          <p className="text-muted-foreground">Complete audit trail and privacy controls</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Timeframe:</label>
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <Button 
            onClick={fetchTransparencyData} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.summary.totalProfileViews}</p>
                <p className="text-sm text-muted-foreground">Profile Views</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.summary.totalActivities}</p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.summary.activePrivacySettings}</p>
                <p className="text-sm text-muted-foreground">Privacy Settings</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{data.summary.totalExports}</p>
                <p className="text-sm text-muted-foreground">Data Exports</p>
              </div>
              <Download className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="exports">Data Exports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Profile Views */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recent Profile Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.analytics.profileViews.slice(0, 5).map((view) => (
                    <div key={view.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getViewerTypeIcon(view.viewer_type)}
                        <div>
                          <p className="font-medium">
                            {view.viewer_type === 'anonymous' ? 'Anonymous Viewer' : 
                             view.viewer ? `${view.viewer.first_name} ${view.viewer.last_name}` : 
                             view.viewer_email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {view.viewer_company || 'Unknown Company'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getViewerTypeColor(view.viewer_type)}>
                          {view.viewer_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(view.viewed_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {data.analytics.profileViews.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No profile views in the selected timeframe
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.analytics.activityStats).map(([actionType, count]) => (
                    <div key={actionType} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getActionIcon(actionType)}
                        <span className="capitalize">{actionType.replace(/_/g, ' ')}</span>
                      </div>
                      <Badge className={getActionColor(actionType)}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Complete Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedDates.slice(0, 10).map((date) => {
                  const activities = data.timeline[date];
                  const isExpanded = expandedDates.has(date);
                  
                  return (
                    <div key={date} className="border rounded-lg">
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleDateExpansion(date)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{formatDate(date)}</span>
                          <Badge variant="outline">{activities.length} activities</Badge>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="space-y-2">
                            {activities.map((activity) => (
                              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                {getActionIcon(activity.action_type)}
                                <div className="flex-1">
                                  <p className="font-medium">{activity.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={getActionColor(activity.action_type)}>
                                      {activity.action_type.replace(/_/g, ' ')}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDateTime(activity.performed_at)}
                                    </span>
                                  </div>
                                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                    <details className="mt-2">
                                      <summary className="text-xs text-muted-foreground cursor-pointer">
                                        View Details
                                      </summary>
                                      <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                                        {JSON.stringify(activity.metadata, null, 2)}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Controls Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Visibility */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Profile Visibility</h4>
                  <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                </div>
                <Switch
                  checked={privacySettings.profile_visibility?.public || false}
                  onCheckedChange={(checked) => updatePrivacySetting('profile_visibility', { public: checked })}
                  disabled={updatingSettings}
                />
              </div>

              {/* Reference Visibility */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Reference Visibility</h4>
                  <p className="text-sm text-muted-foreground">Control who can see your references</p>
                </div>
                <Switch
                  checked={privacySettings.reference_visibility?.public || false}
                  onCheckedChange={(checked) => updatePrivacySetting('reference_visibility', { public: checked })}
                  disabled={updatingSettings}
                />
              </div>

              {/* Contact Info Sharing */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Contact Information Sharing</h4>
                  <p className="text-sm text-muted-foreground">Allow employers to contact you directly</p>
                </div>
                <Switch
                  checked={privacySettings.contact_info_sharing?.enabled || false}
                  onCheckedChange={(checked) => updatePrivacySetting('contact_info_sharing', { enabled: checked })}
                  disabled={updatingSettings}
                />
              </div>

              {/* Data Retention */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Retention Period</h4>
                  <p className="text-sm text-muted-foreground">How long to keep your data</p>
                </div>
                <select 
                  value={privacySettings.data_retention_period?.days || 365}
                  onChange={(e) => updatePrivacySetting('data_retention_period', { days: parseInt(e.target.value) })}
                  className="px-3 py-1 border rounded-md text-sm"
                  disabled={updatingSettings}
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="730">2 years</option>
                  <option value="0">Indefinitely</option>
                </select>
              </div>

              {/* Anonymization Level */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Anonymization Level</h4>
                  <p className="text-sm text-muted-foreground">Level of data anonymization</p>
                </div>
                <select 
                  value={privacySettings.anonymization_level?.level || 'none'}
                  onChange={(e) => updatePrivacySetting('anonymization_level', { level: e.target.value })}
                  className="px-3 py-1 border rounded-md text-sm"
                  disabled={updatingSettings}
                >
                  <option value="none">None</option>
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                  <option value="maximum">Maximum</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Activity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.analytics.dailyStats).slice(0, 7).map(([date, stats]) => (
                    <div key={date} className="flex items-center justify-between">
                      <span className="text-sm">{formatDate(date)}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((stats.total_activities / 10) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.total_activities}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Activity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.analytics.activityStats).map(([actionType, count]) => {
                    const percentage = (count / data.summary.totalActivities) * 100;
                    return (
                      <div key={actionType} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize">{actionType.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Exports Tab */}
        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Export Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export Options */}
              <div>
                <h4 className="font-medium mb-4">Request New Export</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Export Type</label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option value="profile_data">Profile Data</option>
                      <option value="audit_log">Audit Log</option>
                      <option value="references">References</option>
                      <option value="applications">Applications</option>
                      <option value="complete_data">Complete Data</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>
                <Button className="mt-4" onClick={() => requestDataExport('complete_data', 'json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Request Export
                </Button>
              </div>

              {/* Export History */}
              <div>
                <h4 className="font-medium mb-4">Export History</h4>
                <div className="space-y-3">
                  {data.exportHistory.map((exportItem) => (
                    <div key={exportItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <div>
                          <p className="font-medium capitalize">{exportItem.export_type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {exportItem.export_format.toUpperCase()} • {formatDateTime(exportItem.requested_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            exportItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                            exportItem.status === 'failed' ? 'bg-red-100 text-red-800' :
                            exportItem.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {exportItem.status}
                        </Badge>
                        {exportItem.status === 'completed' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => downloadExport(exportItem.id, 'json')}>
                                <FileText className="h-4 w-4 mr-2" />
                                JSON Format
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadExport(exportItem.id, 'csv')}>
                                <FileText className="h-4 w-4 mr-2" />
                                CSV Format
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadExport(exportItem.id, 'pdf')}>
                                <FileText className="h-4 w-4 mr-2" />
                                PDF Format
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                  {data.exportHistory.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No export requests yet
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Toast Notifications - Fixed Bottom Right */}
      {alertMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                alertType === 'success' ? 'bg-green-500' : 
                alertType === 'error' ? 'bg-red-500' : 
                'bg-blue-500'
              }`}></div>
              <span className="text-sm">{alertMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
