'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Settings,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Webhook,
  Package
} from 'lucide-react';

const adminFeatures = [
  {
    title: 'Bias Reduction System',
    description: 'Monitor and manage bias reduction across skill endorsements',
    href: '/admin/bias-reduction',
    icon: Shield,
    status: 'active',
    features: ['NLP Anonymization', 'Consistency Monitoring', 'Sentiment Normalization']
  },
  {
    title: 'User Management',
    description: 'Manage users, roles, and permissions',
    href: '/admin/users',
    icon: Users,
    status: 'coming-soon',
    features: ['User Roles', 'Permission Management', 'Activity Monitoring']
  },
  {
    title: 'Analytics Dashboard',
    description: 'System-wide analytics and reporting',
    href: '/admin/analytics',
    icon: BarChart3,
    status: 'coming-soon',
    features: ['Usage Statistics', 'Performance Metrics', 'Custom Reports']
  },
  {
    title: 'Webhook Management',
    description: 'Monitor and manage Stripe webhook events',
    href: '/admin/webhooks',
    icon: Webhook,
    status: 'active',
    features: ['Event Monitoring', 'Error Tracking', 'Retry Failed Events']
  },
  {
    title: 'Package Management',
    description: 'Create and manage subscription packages',
    href: '/admin/packages',
    icon: Package,
    status: 'active',
    features: ['Create Packages', 'Pricing Management', 'Feature Configuration']
  },
  {
    title: 'System Settings',
    description: 'Configure system-wide settings and preferences',
    href: '/admin/settings',
    icon: Settings,
    status: 'coming-soon',
    features: ['Bias Reduction Config', 'API Settings', 'Security Options']
  }
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage and monitor your job platform system
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">
              All systems running normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bias Reduction</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Processing endorsements automatically
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Features */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Admin Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminFeatures.map((feature) => {
            const Icon = feature.icon;
            const isActive = feature.status === 'active';
            
            return (
              <Card key={feature.title} className={`${isActive ? 'border-blue-200' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      className={
                        isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {isActive ? 'Active' : 'Coming Soon'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {feature.features.map((feat) => (
                          <Badge key={feat} variant="outline" className="text-xs">
                            {feat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {isActive ? (
                      <Link href={feature.href}>
                        <Button className="w-full">
                          Access Feature
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full">
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/bias-reduction">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Shield className="h-6 w-6" />
                <span>Bias Reduction</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2" disabled>
              <Users className="h-6 w-6" />
              <span>User Management</span>
            </Button>
            
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2" disabled>
              <BarChart3 className="h-6 w-6" />
              <span>Analytics</span>
            </Button>
            
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2" disabled>
              <Settings className="h-6 w-6" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">Bias Reduction System Activated</p>
                <p className="text-sm text-gray-500">All new endorsements are now being processed for bias reduction</p>
              </div>
              <span className="text-sm text-gray-400">2 hours ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">OpenAI Integration Configured</p>
                <p className="text-sm text-gray-500">Advanced NLP anonymization is now available</p>
              </div>
              <span className="text-sm text-gray-400">1 day ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium">System Update Available</p>
                <p className="text-sm text-gray-500">New bias reduction features and improvements</p>
              </div>
              <span className="text-sm text-gray-400">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
