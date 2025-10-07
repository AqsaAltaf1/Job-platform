'use client'

import { useAuth } from '@/lib/auth'
import { checkSubscriptionStatus, getSubscriptionMessage, redirectToPricing } from '@/lib/subscription-check'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Crown, CreditCard, Users, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SubscriptionGuardProps {
  children: React.ReactNode
  requiredFeature: 'post_jobs' | 'apply_jobs'
}

export default function SubscriptionGuard({ children, requiredFeature }: SubscriptionGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const subscriptionStatus = checkSubscriptionStatus(user)
  
  // Check if user has access to the required feature
  const hasAccess = requiredFeature === 'post_jobs' 
    ? subscriptionStatus.canPostJobs 
    : subscriptionStatus.canApplyJobs

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>
  }

  // Show subscription required prompt
  const isPostingJobs = requiredFeature === 'post_jobs'
  const userRole = user.role === 'candidate' ? 'candidate' : 'employer'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isPostingJobs ? 'Post Jobs' : 'Apply for Jobs'}
          </CardTitle>
          <CardDescription>
            You need an active subscription to {isPostingJobs ? 'post jobs' : 'apply for jobs'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Status */}
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              <strong>Subscription Status:</strong> {getSubscriptionMessage(subscriptionStatus, userRole)}
            </AlertDescription>
          </Alert>

          {/* Feature Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isPostingJobs ? (
              <>
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Post Unlimited Jobs</h4>
                    <p className="text-sm text-blue-700">Create and manage job postings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Access Candidate Database</h4>
                    <p className="text-sm text-blue-700">Browse and contact qualified candidates</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Apply to Jobs</h4>
                    <p className="text-sm text-green-700">Submit applications to job postings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Enhanced Visibility</h4>
                    <p className="text-sm text-green-700">Get noticed by top employers</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/pricing">
                View Pricing Plans
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Choose a subscription plan that fits your needs and unlock all platform features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
