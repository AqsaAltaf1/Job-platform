'use client'

import { useAuth } from '@/lib/auth'
import { checkCandidateProfileCompletion, checkEmployerProfileCompletion, getProfileCompletionMessage } from '@/lib/profile-completion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, User, Building, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ProfileCompletionGuardProps {
  children: React.ReactNode
  requiredRole?: 'candidate' | 'employer' | 'team_member'
}

export default function ProfileCompletionGuard({ children, requiredRole }: ProfileCompletionGuardProps) {
  const { user, loading, refreshUser } = useAuth()
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

  // Check if user has the required role
  if (requiredRole && user.role !== requiredRole) {
    router.push('/dashboard')
    return null
  }

  // Check profile completion based on user role
  const isCandidate = user.role === 'candidate'
  const isEmployer = user.role === 'employer' || user.role === 'team_member'
  
  let profileStatus
  if (isCandidate) {
    profileStatus = checkCandidateProfileCompletion(user)
  } else if (isEmployer) {
    profileStatus = checkEmployerProfileCompletion(user)
  } else {
    // For other roles (like super_admin), allow access
    return <>{children}</>
  }

  // If profile is complete, render children
  if (profileStatus.isComplete) {
    return <>{children}</>
  }

  // Show profile completion prompt
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isCandidate ? (
              <User className="h-6 w-6 text-primary" />
            ) : (
              <Building className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            Complete Your {isCandidate ? 'Candidate' : 'Employer'} Profile
          </CardTitle>
          <CardDescription>
            You need to complete your profile before accessing this feature
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Completion</span>
              <span>{profileStatus.completionPercentage}%</span>
            </div>
            <Progress value={profileStatus.completionPercentage} className="h-2" />
          </div>

          {/* Missing Fields */}
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Missing required fields:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {profileStatus.missingFields.map((field, index) => (
                  <li key={index} className="text-sm">{field}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/profile">
                Complete Profile
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={refreshUser}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
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
              Complete your profile to unlock all features and improve your visibility to{' '}
              {isCandidate ? 'employers' : 'candidates'}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
