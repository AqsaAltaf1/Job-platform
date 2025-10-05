'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/config';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  FileText, 
  Database, 
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  History
} from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  subscriptionPlan: {
    id: string;
    display_name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    features: { [key: string]: boolean };
    limits: { [key: string]: number };
  };
  usage: {
    jobPostings: { used: number; limit: number };
    teamMembers: { used: number; limit: number };
    applications: { used: number; limit: number };
  };
}

interface HistoryItem {
  id: string;
  action: string;
  description: string;
  amount: number | null;
  currency: string;
  created_at: string;
  oldPlan: { display_name: string } | null;
  newPlan: { display_name: string } | null;
}

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load current subscription
      const subResponse = await fetch(getApiUrl('/subscription/current'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
      }

      // Load subscription history
      const historyResponse = await fetch(getApiUrl('/subscription/history'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
      }

    } catch (error) {
      console.error('Load subscription data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = confirm(
      'Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.'
    );

    if (!confirmed) return;

    try {
      setActionLoading('cancel');
      
      const response = await fetch(getApiUrl(`/subscription/${subscription.id}/cancel`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cancel_at_period_end: true })
      });

      if (response.ok) {
        await loadSubscriptionData();
        alert('Subscription canceled successfully. You will continue to have access until the end of your billing period.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      alert('Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;

    try {
      setActionLoading('resume');
      
      const response = await fetch(getApiUrl(`/subscription/${subscription.id}/resume`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadSubscriptionData();
        alert('Subscription resumed successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to resume subscription');
      }
    } catch (error) {
      console.error('Resume subscription error:', error);
      alert('Failed to resume subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-500';
      case 'paused':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'trialing':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to manage your subscription.</p>
              <Button onClick={() => window.location.href = '/login'}>
                Log In
              </Button>
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

  if (!subscription) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
              <p className="text-muted-foreground mb-4">You don't have an active subscription yet.</p>
              <Button onClick={() => window.location.href = '/subscription/plans'}>
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your subscription and billing</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{subscription.subscriptionPlan.display_name}</h3>
                  <p className="text-muted-foreground mb-4">{subscription.subscriptionPlan.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusIcon(subscription.status)}
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({subscription.billing_cycle})
                    </span>
                  </div>

                  <div className="text-3xl font-bold">
                    ${subscription.billing_cycle === 'yearly' 
                      ? (subscription.subscriptionPlan.price_yearly / 12).toFixed(0)
                      : subscription.subscriptionPlan.price_monthly.toFixed(0)
                    }
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                  {subscription.billing_cycle === 'yearly' && (
                    <p className="text-sm text-muted-foreground">
                      Billed annually (${subscription.subscriptionPlan.price_yearly}/year)
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Billing Period</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(subscription.current_period_start).toLocaleDateString()} - {' '}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>

                  {subscription.cancel_at_period_end && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Cancellation Scheduled</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}. 
                        You'll continue to have access until then.
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        You can resume your subscription at any time before this date.
                      </p>
                    </div>
                  )}

                  {subscription.status === 'past_due' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">Payment Issue</span>
                      </div>
                      <p className="text-sm text-red-700">
                        Your subscription payment failed. Please update your payment method to avoid service interruption.
                      </p>
                    </div>
                  )}

                  {subscription.status === 'canceled' && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-800">Subscription Canceled</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Your subscription was canceled on {subscription.canceled_at ? new Date(subscription.canceled_at).toLocaleDateString() : 'recently'}.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={() => window.location.href = '/subscription/plans'}
                  variant="outline"
                  disabled={subscription.status === 'canceled'}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {subscription.status === 'canceled' ? 'Resubscribe' : 'Change Plan'}
                </Button>

                {subscription.status === 'canceled' ? (
                  <Button 
                    onClick={() => window.location.href = '/subscription/plans'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Subscribe Again
                  </Button>
                ) : subscription.cancel_at_period_end ? (
                  <Button 
                    onClick={handleResumeSubscription}
                    disabled={actionLoading === 'resume'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === 'resume' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Resume Subscription
                  </Button>
                ) : subscription.status === 'past_due' ? (
                  <Button 
                    onClick={() => window.open(`https://billing.stripe.com/p/login/test_your_login_link`, '_blank')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                    variant="destructive"
                  >
                    {actionLoading === 'cancel' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Usage & Limits
              </CardTitle>
              <CardDescription>
                Track your current usage against your plan limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Job Postings */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Job Postings</span>
                    </div>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(subscription.usage.jobPostings.used, subscription.usage.jobPostings.limit))}`}>
                      {subscription.usage.jobPostings.used} / {subscription.usage.jobPostings.limit === -1 ? '∞' : subscription.usage.jobPostings.limit}
                    </span>
                  </div>
                  {subscription.usage.jobPostings.limit !== -1 && (
                    <Progress 
                      value={getUsagePercentage(subscription.usage.jobPostings.used, subscription.usage.jobPostings.limit)} 
                      className="h-2"
                    />
                  )}
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Team Members</span>
                    </div>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(subscription.usage.teamMembers.used, subscription.usage.teamMembers.limit))}`}>
                      {subscription.usage.teamMembers.used} / {subscription.usage.teamMembers.limit === -1 ? '∞' : subscription.usage.teamMembers.limit}
                    </span>
                  </div>
                  {subscription.usage.teamMembers.limit !== -1 && (
                    <Progress 
                      value={getUsagePercentage(subscription.usage.teamMembers.used, subscription.usage.teamMembers.limit)} 
                      className="h-2"
                    />
                  )}
                </div>

                {/* Applications */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Applications Received</span>
                    </div>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(subscription.usage.applications.used, subscription.usage.applications.limit))}`}>
                      {subscription.usage.applications.used} / {subscription.usage.applications.limit === -1 ? '∞' : subscription.usage.applications.limit}
                    </span>
                  </div>
                  {subscription.usage.applications.limit !== -1 && (
                    <Progress 
                      value={getUsagePercentage(subscription.usage.applications.used, subscription.usage.applications.limit)} 
                      className="h-2"
                    />
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Need more?</strong> Upgrade your plan to get higher limits and access to premium features.
                </p>
                <Button 
                  onClick={() => window.location.href = '/subscription/plans'}
                  size="sm"
                  className="mt-2"
                >
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600" />
                Subscription History
              </CardTitle>
              <CardDescription>
                View all subscription changes and billing events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{formatActionName(item.action)}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        {item.oldPlan && item.newPlan && (
                          <span>
                            {item.oldPlan.display_name} → {item.newPlan.display_name}
                          </span>
                        )}
                        
                        {item.amount && (
                          <span className="font-medium">
                            ${item.amount.toFixed(2)} {item.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No subscription history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
