'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/config';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Shield, 
  Crown, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Save,
  X,
  Search
} from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  admin_level: 'super_admin' | 'admin' | 'moderator';
  permissions: {
    manage_users: boolean;
    manage_subscriptions: boolean;
    manage_packages: boolean;
    view_analytics: boolean;
    manage_system: boolean;
  };
  status: 'active' | 'inactive' | 'suspended';
  last_login: string | null;
  notes: string | null;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
  };
  creator: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export default function AdminUserManagement() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    user_id: '',
    admin_level: 'admin' as 'super_admin' | 'admin' | 'moderator',
    permissions: {
      manage_users: true,
      manage_subscriptions: true,
      manage_packages: true,
      view_analytics: true,
      manage_system: false
    },
    status: 'active' as 'active' | 'inactive' | 'suspended',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadAdmins();
      loadUsers();
    }
  }, [user]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/admin/users'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Load admins error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(getApiUrl('/users'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const response = await fetch(getApiUrl('/admin/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadAdmins();
        setShowCreateDialog(false);
        resetForm();
        alert('Admin user created successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create admin user');
      }
    } catch (error) {
      console.error('Create admin error:', error);
      alert('Failed to create admin user');
    }
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;

    try {
      const response = await fetch(getApiUrl(`/admin/users/${editingAdmin.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadAdmins();
        setEditingAdmin(null);
        resetForm();
        alert('Admin user updated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update admin user');
      }
    } catch (error) {
      console.error('Update admin error:', error);
      alert('Failed to update admin user');
    }
  };

  const startEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      user_id: admin.user_id,
      admin_level: admin.admin_level,
      permissions: admin.permissions,
      status: admin.status,
      notes: admin.notes || ''
    });
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      admin_level: 'admin',
      permissions: {
        manage_users: true,
        manage_subscriptions: true,
        manage_packages: true,
        view_analytics: true,
        manage_system: false
      },
      status: 'active',
      notes: ''
    });
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const getAdminLevelIcon = (level: string) => {
    switch (level) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'moderator':
        return <Settings className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.admin_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = users.filter(u => 
    !admins.some(admin => admin.user_id === u.id) && u.role !== 'candidate'
  );

  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only administrators can manage admin users.</p>
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Admin User Management</h1>
            <p className="text-muted-foreground">Manage administrator accounts and permissions</p>
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Admin User</DialogTitle>
              <DialogDescription>
                Grant admin privileges to an existing user
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User Selection */}
              <div>
                <Label htmlFor="user_id">Select User</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to make admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Admin Level */}
              <div>
                <Label htmlFor="admin_level">Admin Level</Label>
                <Select
                  value={formData.admin_level}
                  onValueChange={(value: 'super_admin' | 'admin' | 'moderator') => 
                    setFormData(prev => ({ ...prev, admin_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {user.role === 'super_admin' && (
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Permissions */}
              <div>
                <Label className="text-base font-medium">Permissions</Label>
                <div className="space-y-3 mt-3">
                  {Object.entries(formData.permissions).map(([permission, enabled]) => (
                    <div key={permission} className="flex items-center justify-between">
                      <Label className="capitalize">{permission.replace(/_/g, ' ')}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                        disabled={formData.admin_level === 'super_admin' && permission === 'manage_system'}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this admin user..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAdmin} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Create Admin
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search admin users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Admins List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins.map((admin) => (
          <Card key={admin.id} className={`${admin.status !== 'active' ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAdminLevelIcon(admin.admin_level)}
                  <CardTitle className="text-lg">
                    {admin.user.first_name} {admin.user.last_name}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(admin.status)}
                  <Badge className={getStatusColor(admin.status)}>
                    {admin.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>{admin.user.email}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Admin Level */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level:</span>
                    <Badge variant="outline" className="capitalize">
                      {admin.admin_level.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                {/* Permissions Preview */}
                <div>
                  <span className="text-sm font-medium">Permissions:</span>
                  <div className="mt-2 space-y-1">
                    {Object.entries(admin.permissions).filter(([_, enabled]) => enabled).slice(0, 3).map(([permission]) => (
                      <div key={permission} className="text-xs flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="capitalize">{permission.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                    {Object.entries(admin.permissions).filter(([_, enabled]) => enabled).length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{Object.entries(admin.permissions).filter(([_, enabled]) => enabled).length - 3} more permissions
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Last Login */}
                <div className="text-xs text-muted-foreground">
                  <div>Last login: {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}</div>
                  <div>Created: {new Date(admin.created_at).toLocaleDateString()}</div>
                  {admin.creator && (
                    <div>By: {admin.creator.first_name} {admin.creator.last_name}</div>
                  )}
                </div>
                
                {/* Notes */}
                {admin.notes && (
                  <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded">
                    {admin.notes}
                  </div>
                )}
                
                {/* Actions */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(admin)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Admin Users Found</h2>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No admin users match your search criteria.' : 'No admin users have been created yet.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create First Admin
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingAdmin && (
        <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Admin User</DialogTitle>
              <DialogDescription>
                Update admin privileges and permissions for {editingAdmin.user.first_name} {editingAdmin.user.last_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User Info (Read Only) */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <div><strong>Name:</strong> {editingAdmin.user.first_name} {editingAdmin.user.last_name}</div>
                  <div><strong>Email:</strong> {editingAdmin.user.email}</div>
                  <div><strong>User ID:</strong> {editingAdmin.user_id}</div>
                </div>
              </div>
              
              {/* Admin Level */}
              <div>
                <Label htmlFor="edit_admin_level">Admin Level</Label>
                <Select
                  value={formData.admin_level}
                  onValueChange={(value: 'super_admin' | 'admin' | 'moderator') => 
                    setFormData(prev => ({ ...prev, admin_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {user.role === 'super_admin' && (
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Status */}
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Permissions */}
              <div>
                <Label className="text-base font-medium">Permissions</Label>
                <div className="space-y-3 mt-3">
                  {Object.entries(formData.permissions).map(([permission, enabled]) => (
                    <div key={permission} className="flex items-center justify-between">
                      <Label className="capitalize">{permission.replace(/_/g, ' ')}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                        disabled={formData.admin_level === 'super_admin' && permission === 'manage_system'}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this admin user..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setEditingAdmin(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleUpdateAdmin} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Update Admin
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
