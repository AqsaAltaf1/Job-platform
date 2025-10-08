'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, Briefcase, ArrowLeft, ExternalLink, Users } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { checkSubscriptionStatus } from '@/lib/subscription-check'
import { toast } from 'sonner'

interface Job {
  id: string
  title: string
  description: string
  location: string
  job_type: string
  experience_level: string
  salary_min: number
  salary_max: number
  salary_currency: string
  skills_required: string[]
  application_deadline: string
  created_at: string
  employerProfile: {
    id: string
    company_name: string
    company_logo_url: string
  }
}

interface Company {
  id: string
  company_name: string
  company_logo_url: string
  company_industry: string
  company_size: string
  location: string
}

export default function CompanyJobsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)

  useEffect(() => {
    if (params.id) {
      loadCompanyAndJobs()
    }
  }, [params.id, currentPage])

  const loadCompanyAndJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load company info
      const companyResponse = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/companies/${params.id}`)
      const companyData = await companyResponse.json()
      
      if (companyData.success) {
        setCompany(companyData.company)
      }

      // Load jobs for this company
      const jobsResponse = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/jobs?employer_id=${params.id}&page=${currentPage}&limit=12`)
      const jobsData = await jobsResponse.json()
      
      if (jobsData.success) {
        setJobs(jobsData.jobs)
        setTotalPages(jobsData.pagination?.total_pages || 1)
        setTotalJobs(jobsData.pagination?.total_jobs || jobsData.jobs.length)
      } else {
        setError(jobsData.error || 'Failed to load jobs')
      }
    } catch (error) {
      console.error('Failed to load company jobs:', error)
      setError('Failed to load company jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (jobId: string) => {
    if (!user) {
      toast.error('Please log in to apply for jobs')
      router.push('/login')
      return
    }

    const { canApplyJobs } = checkSubscriptionStatus(user)
    
    if (!canApplyJobs) {
      toast.error('You need an active subscription to apply for jobs')
      router.push('/pricing')
      return
    }

    router.push(`/jobs/${jobId}/apply`)
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Salary not specified'
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `${currency} ${min.toLocaleString()}+`
    if (max) return `Up to ${currency} ${max.toLocaleString()}`
    return 'Salary not specified'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
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
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/companies')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {company.company_logo_url ? (
                    <img 
                      src={company.company_logo_url} 
                      alt={company.company_name} 
                      className="w-8 h-8 object-contain rounded" 
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {company.company_name ? company.company_name.substring(0, 2).toUpperCase() : 'CO'}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{company.company_name}</h1>
                  <p className="text-sm text-gray-600">{totalJobs} job{totalJobs !== 1 ? 's' : ''} available</p>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/companies/${company.id}`}>
                View Company Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Available</h2>
            <p className="text-gray-600 mb-6">
              {company.company_name} doesn't have any active job postings at the moment.
            </p>
            <Button onClick={() => router.push('/companies')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
          </div>
        ) : (
          <>
            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {jobs.map((job, index) => (
                <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                  <CardContent className="p-6">
                    {/* Company Logo/Initials */}
                    <div className="flex items-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mr-3">
                        {job.employerProfile.company_logo_url ? (
                          <img src={job.employerProfile.company_logo_url} alt={job.employerProfile.company_name} className="w-8 h-8 object-contain rounded" />
                        ) : (
                          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {job.employerProfile.company_name ? job.employerProfile.company_name.substring(0, 2).toUpperCase() : 'CO'}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">{company.company_industry || 'General'}</span>
                    </div>
                    
                    {/* Job Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 group-hover:scale-105 transition-transform duration-300">
                      <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                        {job.title}
                      </Link>
                    </h3>
                    
                    {/* Location & Type */}
                    <div className="flex items-center text-gray-500 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                      <MapPin className="h-4 w-4 mr-1 group-hover:text-primary transition-colors duration-300" />
                      <span className="text-sm mr-4">{job.location || 'Remote'}</span>
                      <Briefcase className="h-4 w-4 mr-1 group-hover:text-primary transition-colors duration-300" />
                      <span className="text-sm">{job.job_type}</span>
                    </div>

                    {/* Salary */}
                    <div className="flex items-center text-gray-500 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                      <DollarSign className="h-4 w-4 mr-1 group-hover:text-primary transition-colors duration-300" />
                      <span className="text-sm">{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
                      {job.description}
                    </p>

                    {/* Skills */}
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.skills_required.slice(0, 3).map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.skills_required.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="group-hover:scale-105 transition-transform duration-300">
                        <div className="text-xs text-gray-400 mb-1">
                          Posted {formatDate(job.created_at)}
                        </div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                          {job.experience_level}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                        asChild
                      >
                        <Link href={`/jobs/${job.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleApply(job.id)}
                      >
                        Apply Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-full border-gray-200 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="rounded-full border-gray-200 hover:bg-gray-50"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-full border-gray-200 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
