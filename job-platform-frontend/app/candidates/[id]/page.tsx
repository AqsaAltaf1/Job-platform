'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Award,
  Star,
  Clock,
  ExternalLink,
  Download,
  Eye,
  Users,
  Building,
  ArrowLeft,
  DollarSign,
  User,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  location?: string
  availability?: string
  bio?: string
  profile_picture_url?: string
  profile_picture?: string
  experience_years?: number
  salary_expectation?: number
  skills?: string[]
  created_at: string
  candidateProfile?: {
    id: string
    bio?: string
    location?: string
    availability?: string
    experience_years?: number
    salary_expectation?: number
    skills?: string[]
    website?: string
    linkedin_url?: string
    github_url?: string
    resume_url?: string
    portfolio_url?: string
    portfolio_items?: Array<{
      title: string
      description: string
      url: string
      thumbnail_url?: string
    }>
    work_samples?: Array<{
      title: string
      description: string
      url: string
    }>
  }
  experiences?: Array<{
    id: string
    title: string
    company_name: string
    start_date: string
    end_date?: string
    location?: string
    description?: string
    employment_type?: string
    current?: boolean
    achievements?: string
  }>
  educations?: Array<{
    id: string
    institution: string
    degree: string
    field_of_study?: string
    graduation_year?: number
    gpa?: number
  }>
  projects?: Array<{
    id: string
    name: string
    description?: string
    technologies?: string[]
    url?: string
    github_url?: string
    start_date?: string
    end_date?: string
    achievements?: string
  }>
  references?: Array<{
    id: string
    reviewer_name: string
    relationship: string
    relationship_description: string
    overall_rating: number
    work_quality_rating: number
    communication_rating: number
    reliability_rating: number
    teamwork_rating: number
    reference_text: string
    strengths: string
    areas_for_improvement: string
    would_recommend: boolean
    would_hire_again: boolean
    years_worked_together: number
    last_worked_together: string
    is_public: boolean
    is_verified: boolean
    created_at: string
  }>
  verified_employments?: Array<{
    id: string
    company_name: string
    title: string
    employment_type: string
    start_date: string
    end_date?: string
    responsibilities: string
    verification_status: string
    verification_method: string
    verifier_name: string
    verified_at: string
  }>
  ratings?: Array<{
    id: string
    rating: number
    review?: string
    reviewer_name?: string
    created_at: string
  }>
}

export default function CandidateProfileViewPage() {
  const params = useParams()
  const router = useRouter()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadCandidate()
    }
  }, [params.id])

  const loadCandidate = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('jwt_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/employer/candidates/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      
      if (data.success) {
        console.log('Candidate profile data:', data.data)
        setCandidate(data.data)
      } else {
        console.error('Failed to load candidate:', data)
        setError(data.error || 'Failed to load candidate')
      }
    } catch (error) {
      console.error('Failed to load candidate:', error)
      setError('Failed to load candidate')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
    
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
      return `${start} - ${end}`
    } else {
      return `${start} - Present`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate profile...</p>
        </div>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidate Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The candidate you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/candidates')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
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
              onClick={() => router.push('/candidates')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
            <div className="flex gap-3">
              {candidate.candidateProfile?.resume_url && (
                <Button variant="outline" asChild>
                  <Link href={candidate.candidateProfile.resume_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Link>
                </Button>
              )}
              <Button asChild>
                <Link href={`/jobs?candidate=${candidate.id}`}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  View Matching Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <Avatar className="w-20 h-20">
                    {(candidate.profile_picture || candidate.profile_picture_url) ? (
                      <img 
                        src={candidate.profile_picture || candidate.profile_picture_url} 
                        alt={`${candidate.first_name} ${candidate.last_name}`} 
                        className="w-20 h-20 object-cover rounded-full" 
                      />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {getInitials(candidate.first_name, candidate.last_name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {candidate.first_name} {candidate.last_name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{candidate.location || candidate.candidateProfile?.location || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{candidate.candidate_profile?.availability || candidate.candidateProfile?.availability || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{candidate.candidate_profile?.experience_years || candidate.candidateProfile?.experience_years || 0} years experience</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {candidate.candidate_profile?.availability || candidate.candidateProfile?.availability || 'Not specified'}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {candidate.candidate_profile?.experience_years || candidate.candidateProfile?.experience_years || 0} years exp
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            {(candidate.candidate_profile?.bio || candidate.candidateProfile?.bio) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {candidate.candidate_profile?.bio || candidate.candidateProfile?.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {((candidate.candidate_profile?.skills && candidate.candidate_profile.skills.length > 0) || (candidate.candidateProfile?.skills && candidate.candidateProfile.skills.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.candidate_profile?.skills || candidate.candidateProfile?.skills || []).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {candidate.experiences && candidate.experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {candidate.experiences.map((experience) => (
                    <div key={experience.id} className="border-l-2 border-blue-200 pl-4">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {experience.title || 'Position not specified'}
                      </h3>
                      <p className="text-blue-600 font-medium">
                        {experience.company_name || 'Company not specified'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDateRange(experience.start_date, experience.end_date)}
                        {experience.location && ` • ${experience.location}`}
                      </p>
                      {experience.description && (
                        <p className="text-gray-700 text-sm">
                          {experience.description}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {candidate.educations && candidate.educations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.educations.map((education) => (
                    <div key={education.id} className="border-l-2 border-green-200 pl-4">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {education.degree || 'Degree not specified'}
                      </h3>
                      <p className="text-green-600 font-medium">
                        {education.institution || 'Institution not specified'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {education.field_of_study && `${education.field_of_study} • `}
                        {education.graduation_year && `Graduated ${education.graduation_year}`}
                        {education.gpa && ` • GPA: ${education.gpa}`}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {candidate.projects && candidate.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-gray-700 text-sm mt-1">
                              {project.description}
                            </p>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {project.start_date && (
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDateRange(project.start_date, project.end_date)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {project.url && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={project.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Project
                              </Link>
                            </Button>
                          )}
                          {project.github_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={project.github_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {candidate.candidateProfile?.portfolio_items && candidate.candidateProfile.portfolio_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.candidateProfile.portfolio_items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-gray-700 text-sm mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Work Samples */}
            {candidate.candidateProfile?.work_samples && candidate.candidateProfile.work_samples.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Work Samples
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.candidateProfile.work_samples.map((sample, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {sample.title}
                          </h3>
                          {sample.description && (
                            <p className="text-gray-700 text-sm mt-1">
                              {sample.description}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={sample.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* References */}
            {candidate.references && candidate.references.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Professional References
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {candidate.references.map((reference) => (
                    <div key={reference.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {reference.reviewer_name}
                          </h3>
                          <p className="text-blue-600 font-medium">
                            {reference.relationship} • {reference.relationship_description}
                          </p>
                          <p className="text-sm text-gray-500">
                            Worked together for {reference.years_worked_together} years
                            {reference.last_worked_together && ` • Last worked: ${reference.last_worked_together}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < reference.overall_rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {reference.overall_rating}/5
                          </span>
                        </div>
                      </div>
                      
                      {reference.reference_text && (
                        <div className="mb-4">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            "{reference.reference_text}"
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Work Quality</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < reference.work_quality_rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">
                              {reference.work_quality_rating}/5
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Communication</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < reference.communication_rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">
                              {reference.communication_rating}/5
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Reliability</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < reference.reliability_rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">
                              {reference.reliability_rating}/5
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Teamwork</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < reference.teamwork_rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">
                              {reference.teamwork_rating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {reference.strengths && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Strengths:</p>
                          <p className="text-sm text-gray-600">{reference.strengths}</p>
                        </div>
                      )}
                      
                      {reference.areas_for_improvement && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Areas for Improvement:</p>
                          <p className="text-sm text-gray-600">{reference.areas_for_improvement}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">
                            {reference.would_recommend ? 'Would recommend' : 'Would not recommend'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">
                            {reference.would_hire_again ? 'Would hire again' : 'Would not hire again'}
                          </span>
                        </div>
                      </div>
                      
                      {reference.is_verified && (
                        <div className="mt-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 font-medium">Verified Reference</span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Verified Employment */}
            {candidate.verified_employments && candidate.verified_employments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Verified Employment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.verified_employments.map((employment) => (
                    <div key={employment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {employment.title}
                          </h3>
                          <p className="text-blue-600 font-medium">
                            {employment.company_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateRange(employment.start_date, employment.end_date)}
                            {employment.employment_type && ` • ${employment.employment_type}`}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      
                      {employment.responsibilities && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Responsibilities:</p>
                          <p className="text-sm text-gray-600">{employment.responsibilities}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        <p>Verified by: {employment.verifier_name}</p>
                        <p>Method: {employment.verification_method}</p>
                        <p>Verified on: {formatDate(employment.verified_at)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Reviews & Ratings */}
            {candidate.ratings && candidate.ratings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Reviews & Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.ratings.map((rating) => (
                    <div key={rating.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {rating.rating}/5
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(rating.created_at)}
                        </span>
                      </div>
                      {rating.reviewer_name && (
                        <p className="text-sm text-gray-600 mb-2">
                          By: {rating.reviewer_name}
                        </p>
                      )}
                      {rating.review && (
                        <p className="text-gray-700 text-sm">
                          {rating.review}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.email && candidate.email !== '[Contact Restricted]' ? (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">{candidate.email}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 text-sm italic">Contact information restricted</span>
                  </div>
                )}
                
                {candidate.phone && candidate.phone !== '[Contact Restricted]' ? (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">{candidate.phone}</span>
                  </div>
                ) : candidate.candidateProfile?.phone && candidate.candidateProfile.phone !== '[Contact Restricted]' ? (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">{candidate.candidateProfile.phone}</span>
                  </div>
                ) : candidate.email && candidate.email !== '[Contact Restricted]' ? (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 text-sm italic">Phone number not provided</span>
                  </div>
                ) : null}
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">{candidate.location || candidate.candidateProfile?.location || 'Location not specified'}</span>
                </div>
                {candidate.candidateProfile?.website && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <Link 
                      href={candidate.candidateProfile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Website
                    </Link>
                  </div>
                )}
                {candidate.candidateProfile?.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <Link 
                      href={candidate.candidateProfile.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      LinkedIn
                    </Link>
                  </div>
                )}
                {candidate.candidateProfile?.github_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <Link 
                      href={candidate.candidateProfile.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      GitHub
                    </Link>
                  </div>
                )}
                {candidate.candidateProfile?.portfolio_url && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <Link 
                      href={candidate.candidateProfile.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Portfolio
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidate Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Candidate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold text-blue-600">{candidate.candidate_profile?.experience_years || candidate.candidateProfile?.experience_years || 0} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Availability</span>
                  <span className="font-semibold text-green-600">{candidate.candidate_profile?.availability || candidate.candidateProfile?.availability || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expected Salary</span>
                  <span className="font-semibold text-gray-900">
                    {(candidate.candidate_profile?.salary_expectation || candidate.candidateProfile?.salary_expectation) ? `$${(candidate.candidate_profile?.salary_expectation || candidate.candidateProfile?.salary_expectation)}k` : 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {candidate.created_at ? formatDate(candidate.created_at) : 'Not available'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/jobs?candidate=${candidate.id}`}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    View Matching Jobs
                  </Link>
                </Button>
                {candidate.candidateProfile?.resume_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={candidate.candidateProfile.resume_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/candidates`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Candidates
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
