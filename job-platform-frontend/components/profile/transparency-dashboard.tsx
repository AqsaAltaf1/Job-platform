'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  FileText, 
  Star, 
  Award, 
  Briefcase,
  GraduationCap,
  CheckCircle,
  XCircle,
  Info,
  Settings,
  Download,
  Share2
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { getApiUrl } from '@/lib/config'

interface TransparencyData {
  profileVisibility: {
    isPublic: boolean
    showContactInfo: boolean
    showSalary: boolean
    showLocation: boolean
    showAvailability: boolean
  }
  sharedData: {
    basicInfo: boolean
    skills: boolean
    experience: boolean
    education: boolean
    projects: boolean
    endorsements: boolean
    ratings: boolean
  }
  dataAccess: {
    employers: number
    applications: number
    profileViews: number
    lastViewed: string
  }
  privacySettings: {
    allowEndorsements: boolean
    allowRatings: boolean
    allowContact: boolean
    showInSearch: boolean
  }
}

export default function TransparencyDashboard() {
  const { user } = useAuth()
  const [transparencyData, setTransparencyData] = useState<TransparencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTransparencyData()
    }
  }, [user])

  const fetchTransparencyData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/candidate/transparency-data'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTransparencyData(data.data)
      } else {
        // Mock data for now
        setTransparencyData({
          profileVisibility: {
            isPublic: true,
            showContactInfo: true,
            showSalary: false,
            showLocation: true,
            showAvailability: true
          },
          sharedData: {
            basicInfo: true,
            skills: true,
            experience: true,
            education: true,
            projects: true,
            endorsements: true,
            ratings: true
          },
          dataAccess: {
            employers: 12,
            applications: 8,
            profileViews: 45,
            lastViewed: new Date().toISOString()
          },
          privacySettings: {
            allowEndorsements: true,
            allowRatings: true,
            allowContact: true,
            showInSearch: true
          }
        })
      }
    } catch (error) {
      console.error('Error fetching transparency data:', error)
      showToast.error('Failed to load transparency data')
    } finally {
      setLoading(false)
    }
  }

  const updatePrivacySetting = async (setting: string, value: boolean) => {
    try {
      setUpdating(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/candidate/update-privacy'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ setting, value })
      })

      if (response.ok) {
        showToast.success('Privacy setting updated successfully')
        fetchTransparencyData()
      } else {
        showToast.error('Failed to update privacy setting')
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error)
      showToast.error('Failed to update privacy setting')
    } finally {
      setUpdating(false)
    }
  }

  const downloadDataReport = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/candidate/data-export'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'my-profile-data.json'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showToast.success('Data report downloaded successfully')
      } else {
        showToast.error('Failed to download data report')
      }
    } catch (error) {
      console.error('Error downloading data report:', error)
      showToast.error('Failed to download data report')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!transparencyData) {
    return (
      <Alert>
        <AlertDescription>Failed to load transparency data</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transparency Dashboard</h2>
          <p className="text-gray-600 mt-1">
            See exactly what data is shared and who has access to your profile
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadDataReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Data Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="access">Data Access</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transparencyData.dataAccess.profileViews}</div>
                <p className="text-xs text-muted-foreground">
                  Total views this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transparencyData.dataAccess.employers}</div>
                <p className="text-xs text-muted-foreground">
                  Employers with access
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transparencyData.dataAccess.applications}</div>
                <p className="text-xs text-muted-foreground">
                  Active applications
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Data Sharing Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Sharing Overview
              </CardTitle>
              <CardDescription>
                What information is currently shared with employers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(transparencyData.sharedData).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    {value ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your profile activity and data access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Profile viewed by employer</p>
                      <p className="text-xs text-gray-500">TechCorp Inc. - 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">View</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Application submitted</p>
                      <p className="text-xs text-gray-500">Senior Developer at StartupXYZ - 1 day ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Application</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">New endorsement received</p>
                      <p className="text-xs text-gray-500">React.js from John Smith - 3 days ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Endorsement</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visibility Tab */}
        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Visibility Settings</CardTitle>
              <CardDescription>
                Control what information is visible to employers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Public Profile</div>
                    <div className="text-sm text-gray-500">
                      Make your profile visible to all employers
                    </div>
                  </div>
                  <Switch
                    checked={transparencyData.profileVisibility.isPublic}
                    onCheckedChange={(checked) => updatePrivacySetting('isPublic', checked)}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Contact Information</div>
                    <div className="text-sm text-gray-500">
                      Show email and phone number
                    </div>
                  </div>
                  <Switch
                    checked={transparencyData.profileVisibility.showContactInfo}
                    onCheckedChange={(checked) => updatePrivacySetting('showContactInfo', checked)}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Salary Expectations</div>
                    <div className="text-sm text-gray-500">
                      Show expected salary range
                    </div>
                  </div>
                  <Switch
                    checked={transparencyData.profileVisibility.showSalary}
                    onCheckedChange={(checked) => updatePrivacySetting('showSalary', checked)}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-sm text-gray-500">
                      Show current location
                    </div>
                  </div>
                  <Switch
                    checked={transparencyData.profileVisibility.showLocation}
                    onCheckedChange={(checked) => updatePrivacySetting('showLocation', checked)}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Availability</div>
                    <div className="text-sm text-gray-500">
                      Show availability status
                    </div>
                  </div>
                  <Switch
                    checked={transparencyData.profileVisibility.showAvailability}
                    onCheckedChange={(checked) => updatePrivacySetting('showAvailability', checked)}
                    disabled={updating}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Access Tab */}
        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Access Log</CardTitle>
              <CardDescription>
                Track who has accessed your profile data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">TechCorp Inc.</p>
                      <p className="text-xs text-gray-500">Viewed profile and skills</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">2 hours ago</p>
                    <Badge variant="outline">View</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">StartupXYZ</p>
                      <p className="text-xs text-gray-500">Downloaded full profile for application</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">1 day ago</p>
                    <Badge variant="outline">Download</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">InnovateLabs</p>
                      <p className="text-xs text-gray-500">Viewed endorsements and ratings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">3 days ago</p>
                    <Badge variant="outline">View</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Controls</CardTitle>
              <CardDescription>
                Manage your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Allow Endorsements</div>
                    <div className="text-sm text-gray-500">
                      Let others endorse your skills
                    </div>
                  </div>
                  <Switch
                    checked={transparencyData.privacySettings.allowEndorsements}
                    onCheckedChange={(checked) => updatePrivacySetting('allowEndorsements', checked)}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Allow Ratings</div>
                    <div className="text-sm text-gray-500">
                      Let employers rate your applications
                    </div>
                  </div>
                  <Switch
                    checked={transparencyData.privacySettings.allowRatings}
                    onCheckedChange={(checked) => updatePrivacySetting('allowRatings', checked)}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Allow Direct Contact</div>
                    <div className="text-sm text-gray-500">
                      Let employers contact you directly
                    </div>
                  </div>
                  <Switch
                    checked={transparencyData.privacySettings.allowContact}
                    onCheckedChange={(checked) => updatePrivacySetting('allowContact', checked)}
                    disabled={updating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Show in Search Results</div>
                    <div className="text-sm text-gray-500">
                      Make your profile discoverable in candidate search
                    </div>
                  </div>
                  <Switch
                    checked={transparencyData.privacySettings.showInSearch}
                    onCheckedChange={(checked) => updatePrivacySetting('showInSearch', checked)}
                    disabled={updating}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Your data is protected:</strong> We use industry-standard encryption and never share your data with third parties without your explicit consent. You can request a complete data export or deletion at any time.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
