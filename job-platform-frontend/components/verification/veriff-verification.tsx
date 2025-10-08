"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
// import veriffService from '@/lib/veriff-service'; // Not needed - using direct approach
import { useAuth } from '@/lib/auth';

interface VeriffVerificationProps {
  onVerificationComplete?: (status: string) => void;
}

export function VeriffVerification({ onVerificationComplete }: VeriffVerificationProps) {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: 'US'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Pre-fill user data if available
    if (user) {
      setUserData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
      }));
    }

    // Load current verification status
    loadVerificationStatus();
  }, [user]);

  const loadVerificationStatus = async () => {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/verification/user-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVerificationStatus(result.verification);
        }
      }
    } catch (error) {
      console.error('Failed to load verification status:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!userData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!userData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!userData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(userData.dateOfBirth)) {
      setError('Date of birth must be in YYYY-MM-DD format');
      return false;
    }

    // Validate date is not in the future
    const birthDate = new Date(userData.dateOfBirth);
    const today = new Date();
    if (birthDate > today) {
      setError('Date of birth cannot be in the future');
      return false;
    }

    return true;
  };

  const handleStartVerification = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use the exact same approach as the working test page
      console.log('Starting verification with exact test page approach...');
      
      // Check if window exists
      if (typeof window === 'undefined') {
        setError('Verification can only be started in the browser');
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Window exists');
      
      // Check if Veriff SDK is loaded
      if (typeof (window as any).Veriff === 'undefined') {
        setError('Veriff SDK not loaded. Please refresh the page and try again.');
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Veriff SDK loaded');
      console.log('Veriff type:', typeof (window as any).Veriff);
      
      // Check API key
      const apiKey = process.env.NEXT_PUBLIC_VERIFF_API_KEY;
      console.log('API Key:', apiKey ? '✅ Loaded' : '❌ Not loaded');
      
      // Initialize Veriff - exact same as test page
      const veriff = (window as any).Veriff({
        host: 'https://stationapi.veriff.com',
        apiKey: apiKey || '',
        parentId: 'veriff-root',
        onSession: (err: any, response: any) => {
          if (err) {
            console.error('❌ Session error:', err);
            setError('Session creation failed: ' + JSON.stringify(err));
            setIsLoading(false);
            return;
          }
          
          console.log('✅ Session created:', response);
          console.log('🔗 Verification URL:', response.verification.url);
          
          // Open the verification URL - exact same as test page
          const verificationWindow = window.open(
            response.verification.url, 
            'veriff-verification', 
            'width=800,height=600,scrollbars=yes,resizable=yes'
          );
          
          if (!verificationWindow) {
            console.error('❌ Popup blocked!');
            setError('Popup blocked! Please allow popups for this site and try again.');
            setIsLoading(false);
          } else {
            console.log('✅ Verification window opened successfully');
            setIsVerifying(true);
            setIsLoading(false);
          }
        },
        onFinished: (err: any, response: any) => {
          if (err) {
            console.error('❌ Verification error:', err);
            setError('Verification failed: ' + JSON.stringify(err));
          } else {
            console.log('✅ Verification finished:', response);
            // Reload verification status
            loadVerificationStatus();
            if (onVerificationComplete) {
              onVerificationComplete(response.status);
            }
          }
          setIsVerifying(false);
        },
      });
      
      console.log('✅ Veriff initialized successfully');
      
      // Mount - exact same as test page
      veriff.mount({
        formLabel: {
          vendorData: 'test-user-123'
        }
      });
      
      console.log('✅ Veriff mounted successfully');
      
    } catch (error) {
      console.error('❌ Error:', error);
      setError('An unexpected error occurred: ' + error);
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'DECLINED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500">Verified</Badge>;
      case 'DECLINED':
        return <Badge variant="destructive">Declined</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  if (verificationStatus?.isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Identity Verified
          </CardTitle>
          <CardDescription>
            Your identity has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            {getStatusBadge(verificationStatus.status)}
          </div>
          {verificationStatus.date && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verified on:</span>
              <span className="text-sm text-muted-foreground">
                {new Date(verificationStatus.date).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isVerifying) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Verification in Progress
          </CardTitle>
          <CardDescription>
            Please complete the verification process in the popup window
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              If the verification window didn't open, please check your browser's popup blocker settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Identity Verification
        </CardTitle>
        <CardDescription>
          Verify your identity using Veriff to access all platform features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={userData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={userData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={userData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            required
            className="h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <select
            id="country"
            value={userData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full h-12 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="ES">Spain</option>
            <option value="IT">Italy</option>
            <option value="NL">Netherlands</option>
            <option value="SE">Sweden</option>
            <option value="PK">Pakistan</option>
            <option value="IN">India</option>
            <option value="BD">Bangladesh</option>
            <option value="SG">Singapore</option>
            <option value="MY">Malaysia</option>
            <option value="AE">United Arab Emirates</option>
            <option value="SA">Saudi Arabia</option>
          </select>
        </div>

        <Button 
          onClick={handleStartVerification}
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-blue-900 hover:bg-blue-800 text-white"
        >
          {isLoading ? 'Starting Verification...' : 'Start Identity Verification'}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By starting verification, you agree to our terms of service and privacy policy.
            Your information will be securely processed by Veriff.
          </p>
        </div>

        {/* Veriff widget mount point */}
        <div id="veriff-root"></div>
      </CardContent>
    </Card>
  );
}
