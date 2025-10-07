'use client'

import { useAuth } from '@/lib/auth'
import { checkEmployerProfileCompletion } from '@/lib/profile-completion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function ProfileDebugPage() {
  const { user, refreshUser } = useAuth()

  const handleRefresh = async () => {
    await refreshUser()
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>No user logged in</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profileCompletion = checkEmployerProfileCompletion(user)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Profile Debug</h1>
        <p className="text-gray-600">Debug information for profile completion</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              User Data
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>First Name:</strong> {user.first_name || 'Missing'}</p>
              <p><strong>Last Name:</strong> {user.last_name || 'Missing'}</p>
              <p><strong>Phone:</strong> {user.phone || 'Missing'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Employer Profile Data */}
        <Card>
          <CardHeader>
            <CardTitle>Employer Profile Data</CardTitle>
          </CardHeader>
          <CardContent>
            {user.employerProfile ? (
              <div className="space-y-2">
                <p><strong>Company Name:</strong> {user.employerProfile.company_name || 'Missing'}</p>
                <p><strong>Company Size:</strong> {user.employerProfile.company_size || 'Missing'}</p>
                <p><strong>Company Industry:</strong> {user.employerProfile.company_industry || 'Missing'}</p>
                <p><strong>Company Description:</strong> {user.employerProfile.company_description || 'Missing'}</p>
                <p><strong>Company Website:</strong> {user.employerProfile.company_website || 'Missing'}</p>
                <p><strong>Company Location:</strong> {user.employerProfile.company_location || 'Missing'}</p>
                <p><strong>Position:</strong> {user.employerProfile.position || 'Missing'}</p>
                <p><strong>Bio:</strong> {user.employerProfile.bio || 'Missing'}</p>
                <p><strong>Location:</strong> {user.employerProfile.location || 'Missing'}</p>
                <p><strong>Website:</strong> {user.employerProfile.website || 'Missing'}</p>
              </div>
            ) : (
              <p className="text-red-600">No employer profile found</p>
            )}
          </CardContent>
        </Card>

        {/* Profile Completion Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Completion Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Is Complete:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  profileCompletion.isComplete 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profileCompletion.isComplete ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Completion:</span>
                <span className="text-lg font-bold">{profileCompletion.completionPercentage}%</span>
              </div>
              
              <div>
                <span className="font-medium">Missing Fields:</span>
                {profileCompletion.missingFields.length > 0 ? (
                  <ul className="mt-2 list-disc list-inside">
                    {profileCompletion.missingFields.map((field, index) => (
                      <li key={index} className="text-red-600">{field}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-600 mt-2">None - Profile is complete!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Raw Data */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Raw User Data (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
