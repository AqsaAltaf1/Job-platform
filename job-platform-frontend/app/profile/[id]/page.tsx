"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { getApiUrl } from "@/lib/config"
import { toast } from "sonner"
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
  Building
} from "lucide-react"
import Link from "next/link"

interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  location?: string
  availability?: string
  bio?: string
  profile_picture?: string
  created_at: string
  updated_at: string
  candidate_profile?: {
    id: string
    years_of_experience?: number
    current_position?: string
    expected_salary?: number
    coreSkills?: Array<{
      id: string
      name: string
      level: string
      category: string
      evidence?: Array<{
        id: string
        type: string
        title: string
        url?: string
        file_name?: string
      }>
    }>
    experiences?: Array<{
      id: string
      title: string
      company: string
      location?: string
      start_date: string
      end_date?: string
      description?: string
      is_current: boolean
    }>
    educations?: Array<{
      id: string
      degree: string
      institution: string
      field_of_study?: string
      graduation_year: number
      gpa?: number
    }>
    projects?: Array<{
      id: string
      title: string
      description: string
      technologies?: string
      start_date: string
      end_date?: string
      url?: string
      github_url?: string
    }>
  }
}

export default function CandidateProfilePage() {
  const { user } = useAuth()
  const params = useParams()
  const candidateId = params.id as string
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (candidateId && (user?.role === "employer" || user?.role === "team_member")) {
      fetchCandidateProfile()
    }
  }, [candidateId, user])

  const fetchCandidateProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/candidates/${candidateId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCandidate(data.data?.candidate)
      } else {
        toast.error('Failed to fetch candidate profile')
      }
    } catch (error) {
      console.error('Error fetching candidate profile:', error)
      toast.error('Failed to fetch candidate profile')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-blue-100 text-blue-800'
      case 'expert':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const downloadEvidence = (evidence: any) => {
    if (evidence.url) {
      const link = document.createElement('a')
      link.href = evidence.url
      link.download = evidence.file_name || evidence.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Show access denied for non-employers
  if (user?.role !== "employer" && user?.role !== "team_member") {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center min-h-screen">
          <Card className="w-96">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Access denied. This page is only available for employers and team members.
              </p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!candidate) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Candidate not found</h3>
                <p className="text-muted-foreground mb-4">
                  The candidate profile you're looking for doesn't exist or has been removed.
                </p>
                <Button asChild>
                  <Link href="/candidates">Back to Candidates</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" asChild>
                <Link href="/candidates">
                  ← Back to Candidates
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {candidate.first_name} {candidate.last_name}
            </h1>
            <p className="text-muted-foreground">
              Candidate Profile
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      {candidate.profile_picture ? (
                        <img 
                          src={candidate.profile_picture} 
                          alt={`${candidate.first_name} ${candidate.last_name}`}
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          {getInitials(candidate.first_name, candidate.last_name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="text-xl font-semibold">
                      {candidate.first_name} {candidate.last_name}
                    </h3>
                    <p className="text-muted-foreground">
                      {candidate.candidate_profile?.current_position || "Position not specified"}
                    </p>
                  </div>

                  <Separator className="my-4" />

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{candidate.email}</span>
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{candidate.phone}</span>
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{candidate.location}</span>
                      </div>
                    )}
                    {candidate.availability && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{candidate.availability}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Key Stats */}
                  <div className="space-y-3">
                    {candidate.candidate_profile?.years_of_experience !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Experience</span>
                        <span className="text-sm font-medium">
                          {candidate.candidate_profile.years_of_experience} years
                        </span>
                      </div>
                    )}
                    {candidate.candidate_profile?.expected_salary && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Expected Salary</span>
                        <span className="text-sm font-medium">
                          ${candidate.candidate_profile.expected_salary.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Member since</span>
                      <span className="text-sm font-medium">
                        {formatDate(candidate.created_at)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              {candidate.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {candidate.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {candidate.candidate_profile?.coreSkills && candidate.candidate_profile.coreSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Skills ({candidate.candidate_profile.coreSkills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {candidate.candidate_profile.coreSkills.map((skill) => (
                        <div key={skill.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{skill.name}</h4>
                            <Badge className={getSkillLevelColor(skill.level)}>
                              {skill.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {skill.category}
                          </p>
                          {skill.evidence && skill.evidence.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Evidence:</p>
                              <div className="flex flex-wrap gap-2">
                                {skill.evidence.map((evidence) => (
                                  <div key={evidence.id} className="flex items-center gap-2 bg-green-50 border border-green-200 px-2 py-1 rounded">
                                    <span className="text-green-700 text-sm">{evidence.title}</span>
                                    {evidence.url && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                        onClick={() => downloadEvidence(evidence)}
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Experience */}
              {candidate.candidate_profile?.experiences && candidate.candidate_profile.experiences.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Work Experience ({candidate.candidate_profile.experiences.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {candidate.candidate_profile.experiences.map((experience) => (
                        <div key={experience.id} className="border-l-2 border-primary/20 pl-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{experience.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {experience.company}
                                {experience.location && ` • ${experience.location}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatDate(experience.start_date)} - {experience.is_current ? 'Present' : formatDate(experience.end_date || '')}
                              </p>
                            </div>
                          </div>
                          {experience.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {experience.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {candidate.candidate_profile?.educations && candidate.candidate_profile.educations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education ({candidate.candidate_profile.educations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {candidate.candidate_profile.educations.map((edu) => (
                        <div key={edu.id} className="border-l-2 border-primary/20 pl-4">
                          <h4 className="font-medium">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">
                            {edu.institution}
                            {edu.field_of_study && ` • ${edu.field_of_study}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {edu.graduation_year}
                            {edu.gpa && ` • GPA: ${edu.gpa}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Projects */}
              {candidate.candidate_profile?.projects && candidate.candidate_profile.projects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Projects ({candidate.candidate_profile.projects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {candidate.candidate_profile.projects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{project.title}</h4>
                            <div className="flex gap-2">
                              {project.url && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={project.url} target="_blank">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Live
                                  </Link>
                                </Button>
                              )}
                              {project.github_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={project.github_url} target="_blank">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Code
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDate(project.start_date)} - {project.end_date ? formatDate(project.end_date) : 'Present'}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {project.description}
                          </p>
                          {project.technologies && (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.split(',').map((tech, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tech.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  )
}
