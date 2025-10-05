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
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Package, 
  Star,
  AlertTriangle,
  CheckCircle,
  Save,
  X
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  stripe_product_id: string;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly: string;
  features: { [key: string]: boolean };
  limits: { [key: string]: number };
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminPackageManagement() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    price_monthly: '',
    price_yearly: '',
    features: {
      job_posting: true,
      basic_analytics: false,
      advanced_analytics: false,
      email_support: true,
      priority_support: false,
      candidate_tracking: true,
      team_collaboration: false,
      custom_branding: false,
      ai_matching: false,
      bulk_actions: false,
      api_access: false,
      sso: false,
      custom_integrations: false
    },
    limits: {
      job_postings: 5,
      team_members: 2,
      applications: 100,
      storage_gb: 5
    },
    is_popular: false,
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/admin/subscription-plans'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Load plans error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const response = await fetch(getApiUrl('/admin/subscription-plans'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadPlans();
        setShowCreateDialog(false);
        resetForm();
        alert('Subscription plan created successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create subscription plan');
      }
    } catch (error) {
      console.error('Create plan error:', error);
      alert('Failed to create subscription plan');
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const response = await fetch(getApiUrl(`/admin/subscription-plans/${editingPlan.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadPlans();
        setEditingPlan(null);
        resetForm();
        alert('Subscription plan updated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update subscription plan');
      }
    } catch (error) {
      console.error('Update plan error:', error);
      alert('Failed to update subscription plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const confirmed = confirm('Are you sure you want to delete this subscription plan? This will deactivate it in Stripe as well.');
    if (!confirmed) return;

    try {
      const response = await fetch(getApiUrl(`/admin/subscription-plans/${planId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadPlans();
        alert('Subscription plan deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete subscription plan');
      }
    } catch (error) {
      console.error('Delete plan error:', error);
      alert('Failed to delete subscription plan');
    }
  };

  const startEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      display_name: plan.display_name,
      description: plan.description,
      price_monthly: plan.price_monthly.toString(),
      price_yearly: plan.price_yearly.toString(),
      features: plan.features,
      limits: plan.limits,
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      sort_order: plan.sort_order
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      price_monthly: '',
      price_yearly: '',
      features: {
        job_posting: true,
        basic_analytics: false,
        advanced_analytics: false,
        email_support: true,
        priority_support: false,
        candidate_tracking: true,
        team_collaboration: false,
        custom_branding: false,
        ai_matching: false,
        bulk_actions: false,
        api_access: false,
        sso: false,
        custom_integrations: false
      },
      limits: {
        job_postings: 5,
        team_members: 2,
        applications: 100,
        storage_gb: 5
      },
      is_popular: false,
      is_active: true,
      sort_order: 0
    });
  };

  const handleFeatureChange = (feature: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };

  const handleLimitChange = (limit: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [limit]: value === '-1' ? -1 : parseInt(value) || 0
      }
    }));
  };

  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only administrators can manage subscription packages.</p>
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
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Package Management</h1>
            <p className="text-muted-foreground">Create and manage subscription plans</p>
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Subscription Package</DialogTitle>
              <DialogDescription>
                Create a new subscription plan with features and pricing
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <div>
                  <Label htmlFor="name">Plan Name (Internal)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., professional"
                  />
                </div>
                
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="e.g., Professional Plan"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Plan description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                    <Input
                      id="price_monthly"
                      type="number"
                      step="0.01"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_monthly: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price_yearly">Yearly Price ($)</Label>
                    <Input
                      id="price_yearly"
                      type="number"
                      step="0.01"
                      value={formData.price_yearly}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_yearly: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_popular">Mark as Popular</Label>
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              {/* Features and Limits */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Features</h3>
                <div className="space-y-3">
                  {Object.entries(formData.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <Label className="capitalize">{feature.replace(/_/g, ' ')}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handleFeatureChange(feature, checked)}
                      />
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium mt-6">Usage Limits</h3>
                <div className="space-y-3">
                  {Object.entries(formData.limits).map(([limit, value]) => (
                    <div key={limit}>
                      <Label className="capitalize">{limit.replace(/_/g, ' ')}</Label>
                      <Select
                        value={value.toString()}
                        onValueChange={(val) => handleLimitChange(limit, val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-1">Unlimited</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                          <SelectItem value="1000">1000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Create Package
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                <div className="flex items-center gap-2">
                  {plan.is_active ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Pricing */}
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    ${plan.price_monthly}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${plan.price_yearly}/year (Save {Math.round((1 - (plan.price_yearly / (plan.price_monthly * 12))) * 100)}%)
                  </div>
                </div>
                
                {/* Features Preview */}
                <div>
                  <h4 className="font-medium mb-2">Key Features:</h4>
                  <div className="text-sm space-y-1">
                    {Object.entries(plan.features).filter(([_, enabled]) => enabled).slice(0, 3).map(([feature]) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                    {Object.entries(plan.features).filter(([_, enabled]) => enabled).length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{Object.entries(plan.features).filter(([_, enabled]) => enabled).length - 3} more features
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Limits Preview */}
                <div>
                  <h4 className="font-medium mb-2">Limits:</h4>
                  <div className="text-sm space-y-1">
                    {Object.entries(plan.limits).slice(0, 2).map(([limit, value]) => (
                      <div key={limit} className="flex justify-between">
                        <span className="capitalize">{limit.replace(/_/g, ' ')}</span>
                        <span>{value === -1 ? 'Unlimited' : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(plan)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Stripe Info */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <div>Product ID: {plan.stripe_product_id}</div>
                  <div>Created: {new Date(plan.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingPlan && (
        <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Subscription Package</DialogTitle>
              <DialogDescription>
                Update the subscription plan details and pricing
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Same form structure as create dialog */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <div>
                  <Label>Plan Name (Read Only)</Label>
                  <Input value={formData.name} disabled />
                </div>
                
                <div>
                  <Label htmlFor="edit_display_name">Display Name</Label>
                  <Input
                    id="edit_display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_description">Description</Label>
                  <Textarea
                    id="edit_description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_price_monthly">Monthly Price ($)</Label>
                    <Input
                      id="edit_price_monthly"
                      type="number"
                      step="0.01"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_monthly: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit_price_yearly">Yearly Price ($)</Label>
                    <Input
                      id="edit_price_yearly"
                      type="number"
                      step="0.01"
                      value={formData.price_yearly}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_yearly: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Mark as Popular</Label>
                  <Switch
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Features</h3>
                <div className="space-y-3">
                  {Object.entries(formData.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <Label className="capitalize">{feature.replace(/_/g, ' ')}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handleFeatureChange(feature, checked)}
                      />
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium mt-6">Usage Limits</h3>
                <div className="space-y-3">
                  {Object.entries(formData.limits).map(([limit, value]) => (
                    <div key={limit}>
                      <Label className="capitalize">{limit.replace(/_/g, ' ')}</Label>
                      <Select
                        value={value.toString()}
                        onValueChange={(val) => handleLimitChange(limit, val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-1">Unlimited</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                          <SelectItem value="1000">1000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setEditingPlan(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleUpdatePlan} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Update Package
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
