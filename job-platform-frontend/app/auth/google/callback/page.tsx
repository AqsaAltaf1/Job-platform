'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { googleAuth } from '@/lib/google-auth';
import { useAuth } from '@/lib/auth';
import { showToast, toastMessages } from '@/lib/toast';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google authentication...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Google authentication was cancelled or failed');
          setError(`Error: ${error}`);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Invalid authentication response from Google');
          setError('Missing authorization code or state parameter');
          return;
        }

        setMessage('Exchanging authorization code for access token...');

        // Exchange code for access token
        const tokenResponse = await googleAuth.exchangeCodeForToken(code, state);
        
        if (!tokenResponse.success) {
          throw new Error(tokenResponse.error || 'Failed to exchange code for token');
        }

        setMessage('Authenticating with Google...');

        // Authenticate with Google
        const authResponse = await googleAuth.authenticateWithGoogle(tokenResponse.access_token);
        
        if (!authResponse.success) {
          throw new Error(authResponse.error || 'Failed to authenticate with Google');
        }

        // Store token and set user
        if (authResponse.token) {
          localStorage.setItem('jwt_token', authResponse.token);
        }

        if (authResponse.user) {
          setUser(authResponse.user);
        }

        setStatus('success');
        setMessage(authResponse.isNewUser ? 'Account created successfully!' : 'Login successful!');

        // Show success toast
        showToast.success(authResponse.isNewUser ? 'Account created and logged in successfully!' : 'Logged in successfully!');

        // Redirect after a short delay
        setTimeout(() => {
          const redirectPath = authResponse.user?.role === 'super_admin' ? '/admin' : '/candidate/dashboard';
          router.push(redirectPath);
        }, 2000);

      } catch (error) {
        console.error('Google authentication error:', error);
        setStatus('error');
        setMessage('Authentication failed');
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        showToast.error('Google authentication failed');
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setUser]);

  const handleRetry = () => {
    router.push('/login');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-xl font-semibold ${getStatusColor()}`}>
            Google Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              {message}
            </p>
            
            {status === 'loading' && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-500">This may take a few seconds...</p>
              </div>
            )}

            {status === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {status === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Redirecting you to your dashboard...
                </AlertDescription>
              </Alert>
            )}
          </div>

          {status === 'error' && (
            <div className="flex justify-center">
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                You will be redirected automatically in a few seconds.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


