'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/config';
import StripePaymentForm from '@/components/subscription/StripePaymentForm';
import { 
  Check, 
  Star, 
  Zap, 
  Users, 
  BarChart3, 
  Shield, 
  Crown,
  Sparkles,
  CreditCard,
  ExternalLink
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: { [key: string]: boolean };
  limits: { [key: string]: number };
  is_popular: boolean;
  sort_order: number;
}

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'checkout' | 'direct'>('checkout');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    loadPlans();
    if (user) {
      loadCurrentSubscription();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const response = await fetch(getApiUrl('/subscription/plans'));
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

  const loadCurrentSubscription = async () => {
    try {
      const response = await fetch(getApiUrl('/subscription/current'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Load current subscription error:', error);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setSelectedPlan(plan);

    if (paymentMethod === 'direct') {
      setShowPaymentForm(true);
    } else {
      // Use Stripe Checkout
      try {
        const response = await fetch(getApiUrl('/subscription/checkout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            plan_id: plan.id,
            billing_cycle: billingCycle
          })
        });

        if (response.ok) {
          const data = await response.json();
          window.location.href = data.url;
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Failed to create checkout session');
        }
      } catch (error) {
        console.error('Subscribe error:', error);
        alert('Failed to start subscription process');
      }
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    loadCurrentSubscription();
    window.location.href = '/subscription/success';
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handleChangePlan = async (planId: string) => {
    if (!currentSubscription) return;

    try {
      const response = await fetch(getApiUrl('/subscription/change'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription_id: currentSubscription.id,
          new_plan_id: planId,
          billing_cycle: billingCycle
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to change subscription');
      }
    } catch (error) {
      console.error('Change plan error:', error);
      alert('Failed to change subscription plan');
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  const getMonthlyPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.price_yearly / 12 : plan.price_monthly;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price_monthly * 12;
    const savings = monthlyTotal - plan.price_yearly;
    return Math.round((savings / monthlyTotal) * 100);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'starter':
        return <Zap className="h-6 w-6 text-blue-600" />;
      case 'professional':
        return <Star className="h-6 w-6 text-purple-600" />;
      case 'enterprise':
        return <Crown className="h-6 w-6 text-yellow-600" />;
      default:
        return <Users className="h-6 w-6 text-gray-600" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'ai_matching':
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      case 'advanced_analytics':
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'sso':
        return <Shield className="h-4 w-4 text-green-600" />;
      default:
        return <Check className="h-4 w-4 text-green-600" />;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.subscription_plan_id === planId;
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (!user) return 'Get Started';
    if (isCurrentPlan(plan.id)) return 'Current Plan';
    if (currentSubscription) return 'Change Plan';
    return 'Subscribe';
  };

  const getButtonAction = (plan: SubscriptionPlan) => {
    if (isCurrentPlan(plan.id)) return () => {};
    if (currentSubscription) return () => handleChangePlan(plan.id);
    return () => handleSubscribe(plan);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Scale your hiring with the right plan for your team
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <span className={`text-sm ${billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <Badge variant="secondary" className="ml-2">
              Save up to 17%
            </Badge>
          )}
        </div>

        {/* Payment Method Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant={paymentMethod === 'checkout' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPaymentMethod('checkout')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Stripe Checkout
          </Button>
          <Button
            variant={paymentMethod === 'direct' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPaymentMethod('direct')}
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Direct Payment
          </Button>
        </div>
      </div>

      {/* Current Subscription Alert */}
      {currentSubscription && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">
                You're currently on the {currentSubscription.subscriptionPlan?.display_name} plan
              </p>
              <p className="text-sm text-blue-700">
                Your subscription {currentSubscription.cancel_at_period_end ? 'will end' : 'renews'} on{' '}
                {new Date(currentSubscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.is_popular ? 'border-purple-500 shadow-lg scale-105' : ''} ${
              isCurrentPlan(plan.id) ? 'border-green-500 bg-green-50' : ''
            }`}
          >
            {plan.is_popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-4 right-4">
                <Badge className="bg-green-600 text-white px-3 py-1">
                  Current
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {getPlanIcon(plan.name)}
              </div>
              <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              
              <div className="mt-4">
                <div className="text-4xl font-bold">
                  ${getMonthlyPrice(plan).toFixed(0)}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="text-sm text-muted-foreground">
                    Billed annually (${getPrice(plan).toFixed(0)}/year)
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                      Save {getSavings(plan)}%
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* Features */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium">Features included:</h4>
                {Object.entries(plan.features).map(([feature, included]) => 
                  included && (
                    <div key={feature} className="flex items-center gap-2">
                      {getFeatureIcon(feature)}
                      <span className="text-sm capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Limits */}
              <div className="space-y-2 mb-6 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">Usage Limits:</h4>
                {Object.entries(plan.limits).map(([limit, value]) => (
                  <div key={limit} className="flex justify-between text-sm">
                    <span className="capitalize">{limit.replace(/_/g, ' ')}</span>
                    <span className="font-medium">
                      {value === -1 ? 'Unlimited' : value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <Button
                onClick={getButtonAction(plan)}
                disabled={isCurrentPlan(plan.id)}
                className={`w-full ${
                  plan.is_popular 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : isCurrentPlan(plan.id)
                    ? 'bg-primary hover:bg-primary/90'
                    : ''
                }`}
                variant={isCurrentPlan(plan.id) ? 'default' : plan.is_popular ? 'default' : 'outline'}
              >
                {getButtonText(plan)}
              </Button>

              {!user && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Sign up required
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards (Visa, MasterCard, American Express) and support secure payments through Stripe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, all plans come with a 14-day free trial. No credit card required to start your trial.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Absolutely. You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Direct Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <StripePaymentForm
              plan={selectedPlan}
              billingCycle={billingCycle}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
