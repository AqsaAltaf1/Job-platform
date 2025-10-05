'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/lib/config';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  CreditCard,
  Star
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function SubscriptionSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (sessionId) {
      processCheckout();
    } else {
      setStatus('error');
      setMessage('No session ID provided');
    }
  }, [sessionId]);

  const processCheckout = async () => {
    try {
      const response = await fetch(getApiUrl(`/subscription/success?session_id=${sessionId}`));
      
      if (response.ok) {
        setStatus('success');
        setMessage('Your subscription has been activated successfully!');
      } else {
        const errorData = await response.json();
        setStatus('error');
        setMessage(errorData.error || 'Failed to process subscription');
      }
    } catch (error) {
      console.error('Process checkout error:', error);
      setStatus('error');
      setMessage('An error occurred while processing your subscription');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-16 w-16 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Processing Your Subscription...';
      case 'success':
        return 'Welcome to Your New Plan!';
      case 'error':
        return 'Subscription Error';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card className={`${getStatusColor()} border-2`}>
          <CardContent className="pt-12 pb-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                {getStatusIcon()}
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{getTitle()}</h1>
              <p className="text-lg text-muted-foreground mb-8">{message}</p>

              {status === 'success' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-medium">Secure Billing</h3>
                      <p className="text-sm text-muted-foreground">Your payment is secure and encrypted</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <h3 className="font-medium">Premium Features</h3>
                      <p className="text-sm text-muted-foreground">Access to all plan features</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-medium">Instant Access</h3>
                      <p className="text-sm text-muted-foreground">Start using your plan immediately</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => window.location.href = '/subscription/manage'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                    
                    <Button 
                      onClick={() => window.location.href = '/employer/dashboard'}
                      variant="outline"
                    >
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 mb-4">
                      Don't worry! If your payment went through, your subscription will be activated shortly. 
                      If you continue to experience issues, please contact our support team.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => window.location.href = '/subscription/plans'}
                      variant="outline"
                    >
                      Back to Plans
                    </Button>
                    
                    <Button 
                      onClick={() => window.location.href = '/subscription/manage'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Check Subscription Status
                    </Button>
                  </div>
                </div>
              )}

              {status === 'loading' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Please wait while we set up your subscription and activate your plan features.
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-pulse text-sm text-blue-600">
                      This usually takes just a few seconds...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {status === 'success' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>Get the most out of your new subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Start Posting Jobs</h4>
                    <p className="text-sm text-muted-foreground">Create your first job posting and start attracting candidates</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Invite Team Members</h4>
                    <p className="text-sm text-muted-foreground">Add your team and set up permissions for collaborative hiring</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Explore AI Features</h4>
                    <p className="text-sm text-muted-foreground">Use our AI-powered candidate matching and analytics tools</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
