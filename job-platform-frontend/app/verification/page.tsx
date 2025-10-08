'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function VerificationPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVerificationStarted, setIsVerificationStarted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect employers to profile page - they don't need Veriff verification
  useEffect(() => {
    if (user?.role === 'employer') {
      router.push('/profile');
    }
  }, [user, router]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startVerification = async () => {
    addLog('Starting Identity Verification...');
    
    // Check if user is loaded
    if (!user) {
      addLog('❌ User not loaded yet, please wait...');
      return;
    }
    
    addLog(`👤 User loaded: ${user.email} (ID: ${user.id})`);
    
    // Check if window exists
    if (typeof window === 'undefined') {
      addLog('❌ Window is undefined (SSR)');
      return;
    }
    
    addLog('✅ Window exists');
    
    // Check if Veriff SDK is loaded
    if (typeof (window as any).Veriff === 'undefined') {
      addLog('❌ Veriff SDK not loaded');
      addLog('Available window properties: ' + Object.keys(window).filter(k => k.toLowerCase().includes('veriff')).join(', '));
      return;
    }
    
    addLog('✅ Veriff SDK loaded');
    addLog('Veriff type: ' + typeof (window as any).Veriff);
    
    // Check API key
    const apiKey = process.env.NEXT_PUBLIC_VERIFF_API_KEY;
    addLog('API Key: ' + (apiKey ? '✅ Loaded' : '❌ Not loaded'));
    
    // Create session with pre-filled data via backend API
    try {
      addLog('🔄 Creating session with user data via backend...');
      
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        addLog('❌ No auth token found');
        return;
      }
      
      const vendorData = user?.id ? user.id.toString() : 'test-user';
      const userCountry = user?.candidateProfile?.country || 'US';
      const userDateOfBirth = user?.candidateProfile?.date_of_birth || '1990-01-01';
      
      addLog(`🆔 Using vendor data: ${vendorData}`);
      addLog(`👤 Using user name: ${user?.first_name} ${user?.last_name}`);
      addLog(`🌍 Using country: ${userCountry}${!user?.candidateProfile?.country ? ' (default)' : ''}`);
      addLog(`📅 Using date of birth: ${userDateOfBirth}${!user?.candidateProfile?.date_of_birth ? ' (default)' : ''}`);
      
      const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/verification/create-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: user?.first_name || 'Test',
          lastName: user?.last_name || 'User',
          dateOfBirth: userDateOfBirth,
          country: userCountry
        }),
      });
      
      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        addLog('❌ Failed to create session via backend: ' + errorText);
        return;
      }
      
      const sessionData = await sessionResponse.json();
      addLog('✅ Backend session created');
      addLog('📋 Session data: ' + JSON.stringify(sessionData));
      
      if (sessionData.success && sessionData.sessionUrl) {
        // Open the pre-configured session URL directly
        addLog('🔗 Opening verification URL: ' + sessionData.sessionUrl);
        
        const verificationWindow = window.open(
          sessionData.sessionUrl, 
          'veriff-verification', 
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );
        
        if (!verificationWindow) {
          addLog('❌ Popup blocked! Please allow popups for this site.');
        } else {
          addLog('✅ Verification window opened successfully with pre-filled data');
          setIsVerificationStarted(true);
          
          // Monitor when the verification window is closed
          const checkClosed = setInterval(() => {
            if (verificationWindow.closed) {
              clearInterval(checkClosed);
              addLog('🔄 Verification window closed - redirecting to profile...');
              
              // Wait a moment then redirect to profile with a success message
              setTimeout(() => {
                router.push('/profile?verification=submitted');
              }, 2000);
            }
          }, 1000);
        }
      } else {
        addLog('❌ Invalid session data received: ' + JSON.stringify(sessionData));
      }
      
    } catch (error) {
      addLog('❌ Error initializing Veriff: ' + error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Show loading message for employers while redirecting
  if (user?.role === 'employer') {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <h1 className="text-3xl font-bold mb-4 text-gray-800">Redirecting...</h1>
              <p className="text-gray-600">Employers don't need identity verification. Redirecting to your profile...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
              Identity Verification
            </h1>
            <p className="text-gray-600 text-center mb-4">
              Verify your identity using Veriff to access all platform features
            </p>
            
            {/* User Info Section */}
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Verification for:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{user.first_name} {user.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-6 text-center">
              <button
                onClick={startVerification}
                disabled={!user}
                className={`px-8 py-3 rounded-xl font-semibold text-lg mr-4 ${
                  !user 
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                    : 'bg-blue-900 hover:bg-blue-800 text-white'
                }`}
              >
                {!user ? 'Loading User...' : 'Start Identity Verification'}
              </button>
              <button
                onClick={clearLogs}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl"
              >
                Clear Logs
              </button>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Verification Container:</h2>
              <div id="veriff-root" className="border-2 border-dashed border-gray-300 p-4 min-h-[200px] rounded-lg">
                <p className="text-gray-500 text-center">Veriff widget will appear here if working</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Debug Logs:</h2>
              <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Click "Start Identity Verification" to begin.</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1 font-mono text-sm">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
