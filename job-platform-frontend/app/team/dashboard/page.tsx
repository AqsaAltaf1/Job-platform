'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Users, 
  UserPlus, 
  Eye, 
  BarChart3, 
  Settings, 
  Shield,
  Mail,
  Phone,
  Crown
} from 'lucide-react';
import type { TeamMember, TeamPermissions } from '@/lib/types';

export default function TeamDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && user?.role !== 'team_member') {
      router.push('/profile');
      return;
    }
    
    if (user?.role === 'team_member') {
      loadTeamMemberProfile();
    }
  }, [user, loading, router]);

  const loadTeamMemberProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/team/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setTeamMember(data.teamMember);
      }
    } catch (error) {
      console.error('Failed to load team member profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const getPermissionIcon = (permission: keyof TeamPermissions) => {
    const icons = {
      can_post_jobs: <UserPlus className="h-4 w-4" />,
      can_view_applications: <Eye className="h-4 w-4" />,
      can_interview_candidates: <Users className="h-4 w-4" />,
      can_manage_team: <Shield className="h-4 w-4" />,
      can_access_analytics: <BarChart3 className="h-4 w-4" />,
      can_manage_company_profile: <Settings className="h-4 w-4" />,
    };
    return icons[permission];
  };

  const getPermissionLabel = (permission: keyof TeamPermissions) => {
    const labels = {
      can_post_jobs: 'Post Jobs',
      can_view_applications: 'View Applications',
      can_interview_candidates: 'Interview Candidates',
      can_manage_team: 'Manage Team',
      can_access_analytics: 'Access Analytics',
      can_manage_company_profile: 'Manage Company Profile',
    };
    return labels[permission];
  };

  const getRoleColor = (role: string) => {
    const colors = {
      primary_owner: 'bg-purple-100 text-purple-800',
      hr_manager: 'bg-blue-100 text-blue-800',
      recruiter: 'bg-green-100 text-green-800',
      interviewer: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      primary_owner: <Crown className="h-4 w-4" />,
      hr_manager: <Shield className="h-4 w-4" />,
      recruiter: <UserPlus className="h-4 w-4" />,
      interviewer: <Users className="h-4 w-4" />,
      admin: <Settings className="h-4 w-4" />,
    };
    return icons[role as keyof typeof icons] || <Users className="h-4 w-4" />;
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Alert variant="destructive">
              <AlertDescription>
                Team member profile not found. Please contact your administrator.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-semibold text-blue-600">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{user?.first_name} {user?.last_name}</h3>
                  <Badge className={getRoleColor(teamMember.role)}>
                    {getRoleIcon(teamMember.role)}
                    {teamMember.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{teamMember.employerProfile?.company_name || 'Company'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user?.email}</span>
                  </div>
                  {teamMember.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{teamMember.phone}</span>
                    </div>
                  )}
                  {teamMember.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{teamMember.department}</span>
                    </div>
                  )}
                  {teamMember.job_title && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{teamMember.job_title}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Permissions
                </CardTitle>
                <CardDescription>
                  What you can do in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(teamMember.permissions).map(([permission, hasPermission]) => (
                    <div key={permission} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPermissionIcon(permission as keyof TeamPermissions)}
                        <span className="text-sm">{getPermissionLabel(permission as keyof TeamPermissions)}</span>
                      </div>
                      <Badge variant={hasPermission ? "default" : "secondary"}>
                        {hasPermission ? "Allowed" : "Restricted"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              {teamMember.permissions.can_post_jobs && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Post Jobs
                    </CardTitle>
                    <CardDescription>Create and manage job postings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => router.push('/jobs/create')}>
                      Create New Job
                    </Button>
                  </CardContent>
                </Card>
              )}

              {teamMember.permissions.can_view_applications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Applications
                    </CardTitle>
                    <CardDescription>Review candidate applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => router.push('/applications')}>
                      View Applications
                    </Button>
                  </CardContent>
                </Card>
              )}

              {teamMember.permissions.can_manage_team && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Team Management
                    </CardTitle>
                    <CardDescription>Manage team members and permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => router.push('/team/manage')}>
                      Manage Team
                    </Button>
                  </CardContent>
                </Card>
              )}

              {teamMember.permissions.can_access_analytics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analytics
                    </CardTitle>
                    <CardDescription>View hiring analytics and reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => router.push('/analytics')}>
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity to show</p>
                  <p className="text-sm">Your actions will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Users, 
  UserPlus, 
  Eye, 
  BarChart3, 
  Settings, 
  Shield,
  Mail,
  Phone,
  Crown
} from 'lucide-react';
import type { TeamMember, TeamPermissions } from '@/lib/types';

export default function TeamDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && user?.role !== 'team_member') {
      router.push('/profile');
      return;
    }
    
    if (user?.role === 'team_member') {
      loadTeamMemberProfile();
    }
  }, [user, loading, router]);

  const loadTeamMemberProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/team/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setTeamMember(data.teamMember);
      }
    } catch (error) {
      console.error('Failed to load team member profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const getPermissionIcon = (permission: keyof TeamPermissions) => {
    const icons = {
      can_post_jobs: <UserPlus className="h-4 w-4" />,
      can_view_applications: <Eye className="h-4 w-4" />,
      can_interview_candidates: <Users className="h-4 w-4" />,
      can_manage_team: <Shield className="h-4 w-4" />,
      can_access_analytics: <BarChart3 className="h-4 w-4" />,
      can_manage_company_profile: <Settings className="h-4 w-4" />,
    };
    return icons[permission];
  };

  const getPermissionLabel = (permission: keyof TeamPermissions) => {
    const labels = {
      can_post_jobs: 'Post Jobs',
      can_view_applications: 'View Applications',
      can_interview_candidates: 'Interview Candidates',
      can_manage_team: 'Manage Team',
      can_access_analytics: 'Access Analytics',
      can_manage_company_profile: 'Manage Company Profile',
    };
    return labels[permission];
  };

  const getRoleColor = (role: string) => {
    const colors = {
      primary_owner: 'bg-purple-100 text-purple-800',
      hr_manager: 'bg-blue-100 text-blue-800',
      recruiter: 'bg-green-100 text-green-800',
      interviewer: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      primary_owner: <Crown className="h-4 w-4" />,
      hr_manager: <Shield className="h-4 w-4" />,
      recruiter: <UserPlus className="h-4 w-4" />,
      interviewer: <Users className="h-4 w-4" />,
      admin: <Settings className="h-4 w-4" />,
    };
    return icons[role as keyof typeof icons] || <Users className="h-4 w-4" />;
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Alert variant="destructive">
              <AlertDescription>
                Team member profile not found. Please contact your administrator.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-semibold text-blue-600">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{user?.first_name} {user?.last_name}</h3>
                  <Badge className={getRoleColor(teamMember.role)}>
                    {getRoleIcon(teamMember.role)}
                    {teamMember.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{teamMember.employerProfile?.company_name || 'Company'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user?.email}</span>
                  </div>
                  {teamMember.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{teamMember.phone}</span>
                    </div>
                  )}
                  {teamMember.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{teamMember.department}</span>
                    </div>
                  )}
                  {teamMember.job_title && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{teamMember.job_title}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Permissions
                </CardTitle>
                <CardDescription>
                  What you can do in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(teamMember.permissions).map(([permission, hasPermission]) => (
                    <div key={permission} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPermissionIcon(permission as keyof TeamPermissions)}
                        <span className="text-sm">{getPermissionLabel(permission as keyof TeamPermissions)}</span>
                      </div>
                      <Badge variant={hasPermission ? "default" : "secondary"}>
                        {hasPermission ? "Allowed" : "Restricted"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              {teamMember.permissions.can_post_jobs && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Post Jobs
                    </CardTitle>
                    <CardDescription>Create and manage job postings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => router.push('/jobs/create')}>
                      Create New Job
                    </Button>
                  </CardContent>
                </Card>
              )}

              {teamMember.permissions.can_view_applications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Applications
                    </CardTitle>
                    <CardDescription>Review candidate applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => router.push('/applications')}>
                      View Applications
                    </Button>
                  </CardContent>
                </Card>
              )}

              {teamMember.permissions.can_manage_team && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Team Management
                    </CardTitle>
                    <CardDescription>Manage team members and permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => router.push('/team/manage')}>
                      Manage Team
                    </Button>
                  </CardContent>
                </Card>
              )}

              {teamMember.permissions.can_access_analytics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analytics
                    </CardTitle>
                    <CardDescription>View hiring analytics and reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => router.push('/analytics')}>
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity to show</p>
                  <p className="text-sm">Your actions will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
