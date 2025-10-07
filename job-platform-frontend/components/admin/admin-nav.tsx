'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Settings,
  Home,
  Webhook,
  Package,
  RefreshCw
} from 'lucide-react';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
    description: 'Admin overview'
  },
  {
    title: 'Bias Reduction',
    href: '/admin/bias-reduction',
    icon: Shield,
    description: 'Monitor bias reduction system'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and roles'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'System analytics and reports'
  },
  {
    title: 'Webhooks',
    href: '/admin/webhooks',
    icon: Webhook,
    description: 'Monitor Stripe webhook events'
  },
  {
    title: 'Packages',
    href: '/admin/packages',
    icon: Package,
    description: 'Manage subscription packages'
  },
  {
    title: 'Stripe Sync',
    href: '/admin/packages/stripe-sync',
    icon: RefreshCw,
    description: 'Sync packages with Stripe'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg mb-4">Admin Panel</h3>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start h-auto p-3"
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
