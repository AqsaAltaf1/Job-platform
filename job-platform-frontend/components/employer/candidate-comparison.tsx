'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Star, 
  Award, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Minus,
  Eye,
  Download,
  Filter,
  Search,
  Plus,
  X,
  BarChart3,
  Target,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Info
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { getApiUrl } from '@/lib/config'

interface Candidate {
  id: string
  name: string
  email: string
  avatar?: string
  location: string
  experience_years: number
  current_role: string
  skills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    rating: number
    endorsements: number
  }>
  education: Array<{
    degree: string
    institution: string
    year: number
  }>
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  endorsements: Array<{
    skill: string
    endorser: string
    rating: number
    comment: string
  }>
  culture_fit: {
    score: number
    indicators: Array<{
      trait: string
      score: number
      description: string
    }>
  }
  overall_rating: number
  application_date: string
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
}

interface ComparisonMetrics {
  skill_match: number
  experience_match: number
  culture_fit: number
  education_match: number
  overall_score: number
}

export default function CandidateComparison() {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [comparisonData, setComparisonData] = useState<Record<string, ComparisonMetrics>>({})
  const [jobRequirements, setJobRequirements] = useState({
    required_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    experience_years: 3,
    education_level: 'Bachelor',
    culture_traits: ['Collaborative', 'Innovative', 'Detail-oriented', 'Leadership']
  })

  useEffect(() => {
    if (user) {
      fetchCandidates()
    }
  }, [user])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/employer/candidates-for-comparison'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCandidates(data.data.candidates || [])
      } else {
        // Mock data for now
        setCandidates([
          {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            avatar: '/api/placeholder/40/40',
            location: 'San Francisco, CA',
            experience_years: 5,
            current_role: 'Senior Frontend Developer',
            skills: [
              { name: 'React', level: 'expert', rating: 4.8, endorsements: 12 },
              { name: 'TypeScript', level: 'advanced', rating: 4.5, endorsements: 8 },
              { name: 'Node.js', level: 'intermediate', rating: 3.8, endorsements: 5 },
              { name: 'PostgreSQL', level: 'beginner', rating: 2.5, endorsements: 2 }
            ],
            education: [
              { degree: 'Bachelor of Computer Science', institution: 'Stanford University', year: 2019 }
            ],
            experience: [
              { title: 'Senior Frontend Developer', company: 'TechCorp', duration: '2 years', description: 'Led frontend development for e-commerce platform' }
            ],
            endorsements: [
              { skill: 'React', endorser: 'John Smith', rating: 5, comment: 'Excellent React skills and great team player' }
            ],
            culture_fit: {
              score: 4.2,
              indicators: [
                { trait: 'Collaborative', score: 4.5, description: 'Works well in team environments' },
                { trait: 'Innovative', score: 4.0, description: 'Brings creative solutions to problems' },
                { trait: 'Detail-oriented', score: 4.8, description: 'Pays attention to code quality' },
                { trait: 'Leadership', score: 3.5, description: 'Shows initiative in mentoring others' }
              ]
            },
            overall_rating: 4.3,
            application_date: '2024-01-15',
            status: 'reviewing'
          },
          {
            id: '2',
            name: 'Michael Chen',
            email: 'michael.chen@email.com',
            avatar: '/api/placeholder/40/40',
            location: 'New York, NY',
            experience_years: 4,
            current_role: 'Full Stack Developer',
            skills: [
              { name: 'React', level: 'advanced', rating: 4.2, endorsements: 9 },
              { name: 'TypeScript', level: 'advanced', rating: 4.3, endorsements: 7 },
              { name: 'Node.js', level: 'advanced', rating: 4.1, endorsements: 6 },
              { name: 'PostgreSQL', level: 'intermediate', rating: 3.5, endorsements: 4 }
            ],
            education: [
              { degree: 'Master of Software Engineering', institution: 'MIT', year: 2020 }
            ],
            experience: [
              { title: 'Full Stack Developer', company: 'StartupXYZ', duration: '3 years', description: 'Built scalable web applications from scratch' }
            ],
            endorsements: [
              { skill: 'Node.js', endorser: 'Jane Doe', rating: 4, comment: 'Strong backend development skills' }
            ],
            culture_fit: {
              score: 3.8,
              indicators: [
                { trait: 'Collaborative', score: 3.5, description: 'Good team player but prefers independent work' },
                { trait: 'Innovative', score: 4.2, description: 'Always exploring new technologies' },
                { trait: 'Detail-oriented', score: 4.0, description: 'Consistent code quality' },
                { trait: 'Leadership', score: 3.0, description: 'More of a contributor than leader' }
              ]
            },
            overall_rating: 4.0,
            application_date: '2024-01-12',
            status: 'shortlisted'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching candidates:', error)
      showToast.error('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId)
      } else if (prev.length < 3) { // Limit to 3 candidates for comparison
        return [...prev, candidateId]
      } else {
        showToast.error('You can compare up to 3 candidates at once')
        return prev
      }
    })
  }

  const calculateComparisonMetrics = (candidate: Candidate): ComparisonMetrics => {
    const skillMatch = candidate.skills.reduce((acc, skill) => {
      const isRequired = jobRequirements.required_skills.includes(skill.name)
      return acc + (isRequired ? skill.rating : 0)
    }, 0) / jobRequirements.required_skills.length

    const experienceMatch = Math.min(candidate.experience_years / jobRequirements.experience_years, 1) * 5

    const cultureFit = candidate.culture_fit.score

    const educationMatch = candidate.education.some(edu => 
      edu.degree.toLowerCase().includes(jobRequirements.education_level.toLowerCase())
    ) ? 4.5 : 3.0

    const overallScore = (skillMatch + experienceMatch + cultureFit + educationMatch) / 4

    return {
      skill_match: Math.round(skillMatch * 20) / 20,
      experience_match: Math.round(experienceMatch * 20) / 20,
      culture_fit: Math.round(cultureFit * 20) / 20,
      education_match: Math.round(educationMatch * 20) / 20,
      overall_score: Math.round(overallScore * 20) / 20
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100'
    if (score >= 3.5) return 'text-blue-600 bg-blue-100'
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 4.5) return <TrendingUp className="h-4 w-4" />
    if (score >= 3.5) return <Minus className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const exportComparison = () => {
    const selectedCandidatesData = candidates.filter(c => selectedCandidates.includes(c.id))
    const comparisonReport = {
      job_requirements: jobRequirements,
      candidates: selectedCandidatesData.map(candidate => ({
        ...candidate,
        comparison_metrics: calculateComparisonMetrics(candidate)
      })),
      generated_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(comparisonReport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'candidate-comparison-report.json'
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
    showToast.success('Comparison report downloaded')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Candidate Comparison</h2>
          <p className="text-gray-600 mt-1">
            Compare candidates side-by-side with detailed skill and feedback analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportComparison} disabled={selectedCandidates.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Job Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Job Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-1">
                {jobRequirements.required_skills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Experience</h4>
              <p className="text-sm">{jobRequirements.experience_years}+ years</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Education</h4>
              <p className="text-sm">{jobRequirements.education_level} degree</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Culture Traits</h4>
              <div className="flex flex-wrap gap-1">
                {jobRequirements.culture_traits.map(trait => (
                  <Badge key={trait} variant="secondary" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Candidates to Compare
          </CardTitle>
          <CardDescription>
            Choose up to 3 candidates for detailed comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map(candidate => (
              <Card 
                key={candidate.id} 
                className={`cursor-pointer transition-all ${
                  selectedCandidates.includes(candidate.id) 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => toggleCandidateSelection(candidate.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-sm">{candidate.name}</h4>
                        <p className="text-xs text-gray-600">{candidate.current_role}</p>
                      </div>
                    </div>
                    {selectedCandidates.includes(candidate.id) && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="h-3 w-3" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Briefcase className="h-3 w-3" />
                      {candidate.experience_years} years experience
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Star className="h-3 w-3" />
                      {candidate.overall_rating}/5 overall rating
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Badge className={getScoreColor(candidate.overall_rating)}>
                      {candidate.overall_rating}/5
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      {candidate.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedCandidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparison Results
            </CardTitle>
            <CardDescription>
              Detailed analysis of selected candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="culture">Culture Fit</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Candidate</th>
                        <th className="text-center p-3">Overall Score</th>
                        <th className="text-center p-3">Skill Match</th>
                        <th className="text-center p-3">Experience</th>
                        <th className="text-center p-3">Culture Fit</th>
                        <th className="text-center p-3">Education</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates
                        .filter(c => selectedCandidates.includes(c.id))
                        .map(candidate => {
                          const metrics = calculateComparisonMetrics(candidate)
                          return (
                            <tr key={candidate.id} className="border-b">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={candidate.avatar} />
                                    <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{candidate.name}</p>
                                    <p className="text-xs text-gray-600">{candidate.current_role}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center p-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Badge className={getScoreColor(metrics.overall_score)}>
                                    {metrics.overall_score}/5
                                  </Badge>
                                  {getScoreIcon(metrics.overall_score)}
                                </div>
                              </td>
                              <td className="text-center p-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Badge className={getScoreColor(metrics.skill_match)}>
                                    {metrics.skill_match}/5
                                  </Badge>
                                </div>
                              </td>
                              <td className="text-center p-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Badge className={getScoreColor(metrics.experience_match)}>
                                    {metrics.experience_match}/5
                                  </Badge>
                                </div>
                              </td>
                              <td className="text-center p-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Badge className={getScoreColor(metrics.culture_fit)}>
                                    {metrics.culture_fit}/5
                                  </Badge>
                                </div>
                              </td>
                              <td className="text-center p-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Badge className={getScoreColor(metrics.education_match)}>
                                    {metrics.education_match}/5
                                  </Badge>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {candidates
                    .filter(c => selectedCandidates.includes(c.id))
                    .map(candidate => (
                      <Card key={candidate.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          <CardDescription>Skills Analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {candidate.skills.map(skill => (
                            <div key={skill.name} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{skill.name}</span>
                                <div className="flex items-center gap-2">
                                  <Badge className={getScoreColor(skill.rating)}>
                                    {skill.rating}/5
                                  </Badge>
                                  <Badge variant="outline">
                                    {skill.level}
                                  </Badge>
                                </div>
                              </div>
                              <Progress value={skill.rating * 20} className="h-2" />
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span>{skill.endorsements} endorsements</span>
                                <span>•</span>
                                <span>{skill.level} level</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              {/* Culture Fit Tab */}
              <TabsContent value="culture" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {candidates
                    .filter(c => selectedCandidates.includes(c.id))
                    .map(candidate => (
                      <Card key={candidate.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          <CardDescription>Culture Fit Analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {candidate.culture_fit.score}/5
                            </div>
                            <p className="text-sm text-gray-600">Overall Culture Fit</p>
                          </div>
                          
                          {candidate.culture_fit.indicators.map(indicator => (
                            <div key={indicator.trait} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{indicator.trait}</span>
                                <Badge className={getScoreColor(indicator.score)}>
                                  {indicator.score}/5
                                </Badge>
                              </div>
                              <Progress value={indicator.score * 20} className="h-2" />
                              <p className="text-xs text-gray-600">{indicator.description}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              {/* Feedback Tab */}
              <TabsContent value="feedback" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {candidates
                    .filter(c => selectedCandidates.includes(c.id))
                    .map(candidate => (
                      <Card key={candidate.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          <CardDescription>Peer Endorsements & Feedback</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {candidate.endorsements.length > 0 ? (
                            candidate.endorsements.map((endorsement, index) => (
                              <div key={index} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{endorsement.skill}</span>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < endorsement.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">"{endorsement.comment}"</p>
                                <p className="text-xs text-gray-500">- {endorsement.endorser}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No endorsements yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Comparison Tips:</strong> Focus on candidates with high skill match and culture fit scores. 
          Consider the specific requirements of your role and team dynamics when making final decisions.
        </AlertDescription>
      </Alert>
    </div>
  )
}
