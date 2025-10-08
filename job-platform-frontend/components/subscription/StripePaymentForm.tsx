'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/lib/config';
import { useAuth } from '@/lib/auth';
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: { [key: string]: boolean };
  limits: { [key: string]: number };
  is_popular: boolean;
}

interface StripePaymentFormProps {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({ plan, billingCycle, onSuccess, onCancel }: StripePaymentFormProps) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });

  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const savings = billingCycle === 'yearly' ? Math.round(((plan.price_monthly * 12) - plan.price_yearly) / (plan.price_monthly * 12) * 100) : 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Redirect to reason page instead of processing payment
    window.location.href = '/subscription/reason';
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Subscription
          </CardTitle>
          <CardDescription>
            Subscribe to {plan.display_name} - {billingCycle} billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{plan.display_name}</span>
              <Badge variant={plan.is_popular ? "default" : "secondary"}>
                {plan.is_popular ? "Popular" : "Standard"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} subscription
              </span>
              <div className="text-right">
                <span className="text-lg font-bold">${price}</span>
                <span className="text-sm text-gray-600">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
                {savings > 0 && (
                  <div className="text-xs text-green-600">
                    Save {savings}% annually
                  </div>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={customerInfo.address.line1}
                  onChange={(e) => setCustomerInfo(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, line1: e.target.value }
                  }))}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={customerInfo.address.city}
                    onChange={(e) => setCustomerInfo(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={customerInfo.address.state}
                    onChange={(e) => setCustomerInfo(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={customerInfo.address.postal_code}
                    onChange={(e) => setCustomerInfo(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, postal_code: e.target.value }
                    }))}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div className="space-y-4">
              <Label>Payment Information</Label>
              <div className="p-3 border rounded-md">
                <CardElement options={cardElementOptions} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Lock className="h-3 w-3" />
                Your payment information is secure and encrypted
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stripe || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Subscribe ${price}
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-xs">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-blue-700">
              <p className="font-medium mb-1">Secure Payment</p>
              <p>Your payment is processed securely by Stripe. We never store your card details on our servers.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main component wrapper with Stripe Elements provider
export default function StripePaymentForm(props: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}
