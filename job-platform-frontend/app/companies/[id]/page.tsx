'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Globe, Calendar, Building2, Mail, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  company_name: string
  company_description: string
  company_industry: string
  company_size: string
  company_location: string
  headquarters_location: string
  company_website: string
  company_logo_url: string
  careers_page_url: string
  remote_policy: string
  active_jobs_count: number
  total_jobs_count: number
  recent_jobs_count: number
  location: string
  created_at: string
  user: {
    id: string
    email: string
    created_at: string
  }
}

export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadCompany()
    }
  }, [params.id])

  const loadCompany = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`http://localhost:5000/api/companies/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setCompany(data.company)
      } else {
        setError(data.error || 'Failed to load company')
      }
    } catch (error) {
      console.error('Failed to load company:', error)
      setError('Failed to load company')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The company you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/companies')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/companies')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href={`/companies/${company.id}/jobs`}>
                  View All Jobs ({company.active_jobs_count})
                </Link>
              </Button>
              {company.company_website && (
                <Button asChild>
                  <Link href={company.company_website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                    {company.company_logo_url ? (
                      <img 
                        src={company.company_logo_url} 
                        alt={company.company_name} 
                        className="w-16 h-16 object-contain rounded-lg" 
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                        {company.company_name ? company.company_name.substring(0, 2).toUpperCase() : 'CO'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.company_name}</h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{company.company_size || 'Size not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{company.company_industry || 'General'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {company.company_industry || 'General'}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {company.active_jobs_count} Active Jobs
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Description */}
            {company.company_description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {company.company_name}</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {company.company_description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Company Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Industry</label>
                      <p className="text-gray-900">{company.company_industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company Size</label>
                      <p className="text-gray-900">{company.company_size || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900">{company.location}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Remote Policy</label>
                      <p className="text-gray-900">{company.remote_policy || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Founded</label>
                      <p className="text-gray-900">
                        {new Date(company.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Jobs Posted</label>
                      <p className="text-gray-900">{company.total_jobs_count}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href={`/companies/${company.id}/jobs`}>
                      View All Jobs ({company.active_jobs_count})
                    </Link>
                  </Button>
                  {company.company_website && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={company.company_website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </Link>
                    </Button>
                  )}
                  {company.careers_page_url && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={company.careers_page_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Careers Page
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Jobs</span>
                    <span className="font-semibold text-blue-600">{company.active_jobs_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Jobs</span>
                    <span className="font-semibold text-gray-900">{company.total_jobs_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Recent Jobs (30 days)</span>
                    <span className="font-semibold text-green-600">{company.recent_jobs_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Company Size</span>
                    <span className="font-semibold text-gray-900">{company.company_size || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {company.company_website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <Link 
                        href={company.company_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {company.company_website}
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">{company.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">{company.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
