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
  Heart, 
  Brain, 
  Target, 
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  BarChart3,
  PieChart,
  Activity,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Award,
  Clock,
  MapPin,
  Briefcase,
  UserCheck,
  UserX,
  UserPlus,
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { getApiUrl } from '@/lib/config'

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  department: string
  tenure_months: number
  personality_traits: string[]
  work_style: string[]
  communication_style: string
  collaboration_score: number
  innovation_score: number
  reliability_score: number
  leadership_potential: number
}

interface Candidate {
  id: string
  name: string
  email: string
  avatar?: string
  role_applied: string
  team_fit_score: number
  culture_alignment: number
  personality_assessment: {
    traits: Array<{
      name: string
      score: number
      description: string
    }>
    work_style: Array<{
      style: string
      score: number
      description: string
    }>
    communication_preference: string
    collaboration_style: string
  }
  peer_feedback: Array<{
    reviewer: string
    relationship: 'colleague' | 'manager' | 'subordinate' | 'client'
    rating: number
    feedback: string
    traits_mentioned: string[]
  }>
  team_dynamics_analysis: {
    potential_conflicts: string[]
    synergy_opportunities: string[]
    role_complementarity: number
    knowledge_sharing_potential: number
  }
  culture_indicators: {
    values_alignment: number
    work_ethic_match: number
    communication_fit: number
    innovation_mindset: number
    diversity_contribution: number
  }
}

interface TeamDynamics {
  current_team: TeamMember[]
  team_culture: {
    dominant_traits: string[]
    communication_style: string
    work_rhythm: string
    innovation_level: number
    collaboration_level: number
    conflict_resolution: string
  }
  gaps_analysis: {
    missing_skills: string[]
    personality_gaps: string[]
    experience_gaps: string[]
    diversity_gaps: string[]
  }
}

export default function TeamFitCulture() {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [teamDynamics, setTeamDynamics] = useState<TeamDynamics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchTeamFitData()
    }
  }, [user])

  const fetchTeamFitData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Mock data for now - replace with actual API calls
      setTeamDynamics({
        current_team: [
          {
            id: '1',
            name: 'Alex Johnson',
            role: 'Senior Developer',
            avatar: '/api/placeholder/40/40',
            department: 'Engineering',
            tenure_months: 24,
            personality_traits: ['Analytical', 'Detail-oriented', 'Independent'],
            work_style: ['Methodical', 'Quality-focused', 'Self-directed'],
            communication_style: 'Direct and concise',
            collaboration_score: 3.5,
            innovation_score: 4.0,
            reliability_score: 4.5,
            leadership_potential: 3.0
          },
          {
            id: '2',
            name: 'Sarah Chen',
            role: 'Product Manager',
            avatar: '/api/placeholder/40/40',
            department: 'Product',
            tenure_months: 18,
            personality_traits: ['Collaborative', 'Strategic', 'Empathetic'],
            work_style: ['Team-oriented', 'Big-picture', 'User-focused'],
            communication_style: 'Inclusive and encouraging',
            collaboration_score: 4.5,
            innovation_score: 4.2,
            reliability_score: 4.0,
            leadership_potential: 4.5
          },
          {
            id: '3',
            name: 'Mike Rodriguez',
            role: 'UX Designer',
            avatar: '/api/placeholder/40/40',
            department: 'Design',
            tenure_months: 12,
            personality_traits: ['Creative', 'User-centric', 'Adaptable'],
            work_style: ['Iterative', 'Research-driven', 'Cross-functional'],
            communication_style: 'Visual and storytelling',
            collaboration_score: 4.0,
            innovation_score: 4.8,
            reliability_score: 3.8,
            leadership_potential: 3.5
          }
        ],
        team_culture: {
          dominant_traits: ['Collaborative', 'Innovative', 'Quality-focused', 'User-centric'],
          communication_style: 'Open and transparent',
          work_rhythm: 'Agile with regular check-ins',
          innovation_level: 4.2,
          collaboration_level: 4.3,
          conflict_resolution: 'Direct discussion and compromise'
        },
        gaps_analysis: {
          missing_skills: ['DevOps', 'Data Analysis', 'Mobile Development'],
          personality_gaps: ['Risk-taking', 'Process optimization'],
          experience_gaps: ['Enterprise software', 'Scaling challenges'],
          diversity_gaps: ['Different cultural backgrounds', 'Varied educational paths']
        }
      })

      setCandidates([
        {
          id: '1',
          name: 'Emma Wilson',
          email: 'emma.wilson@email.com',
          avatar: '/api/placeholder/40/40',
          role_applied: 'Full Stack Developer',
          team_fit_score: 4.2,
          culture_alignment: 4.0,
          personality_assessment: {
            traits: [
              { name: 'Collaborative', score: 4.5, description: 'Thrives in team environments' },
              { name: 'Innovative', score: 4.0, description: 'Brings fresh perspectives' },
              { name: 'Detail-oriented', score: 3.8, description: 'Pays attention to quality' },
              { name: 'Adaptable', score: 4.2, description: 'Handles change well' }
            ],
            work_style: [
              { style: 'Agile', score: 4.5, description: 'Comfortable with iterative development' },
              { style: 'Cross-functional', score: 4.0, description: 'Works well across teams' },
              { style: 'User-focused', score: 3.8, description: 'Considers end-user needs' }
            ],
            communication_preference: 'Open and collaborative',
            collaboration_style: 'Proactive and inclusive'
          },
          peer_feedback: [
            {
              reviewer: 'John Smith',
              relationship: 'colleague',
              rating: 4.5,
              feedback: 'Emma is an excellent team player who always contributes valuable insights during code reviews and planning sessions.',
              traits_mentioned: ['Collaborative', 'Knowledgeable', 'Supportive']
            },
            {
              reviewer: 'Lisa Park',
              relationship: 'manager',
              rating: 4.2,
              feedback: 'Strong technical skills and great communication. Would fit well in our collaborative environment.',
              traits_mentioned: ['Technical', 'Communicative', 'Reliable']
            }
          ],
          team_dynamics_analysis: {
            potential_conflicts: ['Different timezone preferences', 'Varying code review styles'],
            synergy_opportunities: ['Pair programming with Alex', 'Cross-training with Sarah', 'Design collaboration with Mike'],
            role_complementarity: 4.3,
            knowledge_sharing_potential: 4.0
          },
          culture_indicators: {
            values_alignment: 4.2,
            work_ethic_match: 4.0,
            communication_fit: 4.3,
            innovation_mindset: 4.1,
            diversity_contribution: 4.5
          }
        },
        {
          id: '2',
          name: 'David Kim',
          email: 'david.kim@email.com',
          avatar: '/api/placeholder/40/40',
          role_applied: 'DevOps Engineer',
          team_fit_score: 3.8,
          culture_alignment: 3.5,
          personality_assessment: {
            traits: [
              { name: 'Independent', score: 4.2, description: 'Works well autonomously' },
              { name: 'Systematic', score: 4.5, description: 'Process-oriented approach' },
              { name: 'Problem-solving', score: 4.3, description: 'Strong analytical skills' },
              { name: 'Reserved', score: 3.0, description: 'Less vocal in group settings' }
            ],
            work_style: [
              { style: 'Process-driven', score: 4.5, description: 'Follows established procedures' },
              { style: 'Independent', score: 4.0, description: 'Prefers working alone' },
              { style: 'Quality-focused', score: 4.2, description: 'Emphasizes reliability' }
            ],
            communication_preference: 'Written and structured',
            collaboration_style: 'Task-focused and efficient'
          },
          peer_feedback: [
            {
              reviewer: 'Maria Garcia',
              relationship: 'colleague',
              rating: 3.8,
              feedback: 'David is technically excellent but could be more proactive in team communication.',
              traits_mentioned: ['Technical', 'Independent', 'Reliable']
            }
          ],
          team_dynamics_analysis: {
            potential_conflicts: ['Communication style differences', 'Collaboration preferences'],
            synergy_opportunities: ['Infrastructure improvements', 'Process optimization'],
            role_complementarity: 4.5,
            knowledge_sharing_potential: 3.5
          },
          culture_indicators: {
            values_alignment: 3.8,
            work_ethic_match: 4.2,
            communication_fit: 3.0,
            innovation_mindset: 3.5,
            diversity_contribution: 4.0
          }
        }
      ])

    } catch (error) {
      console.error('Error fetching team fit data:', error)
      showToast.error('Failed to load team fit data')
    } finally {
      setLoading(false)
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
    if (score >= 3.5) return <Target className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const exportTeamFitReport = () => {
    if (!selectedCandidate || !teamDynamics) return

    const candidate = candidates.find(c => c.id === selectedCandidate)
    if (!candidate) return

    const report = {
      candidate: candidate,
      team_dynamics: teamDynamics,
      analysis_date: new Date().toISOString(),
      recommendations: generateRecommendations(candidate, teamDynamics)
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-fit-report-${candidate.name.replace(' ', '-')}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
    showToast.success('Team fit report downloaded')
  }

  const generateRecommendations = (candidate: Candidate, team: TeamDynamics) => {
    const recommendations = []
    
    if (candidate.team_fit_score >= 4.0) {
      recommendations.push('Strong team fit - recommend proceeding with interview')
    } else if (candidate.team_fit_score >= 3.5) {
      recommendations.push('Good team fit with some considerations - proceed with caution')
    } else {
      recommendations.push('Potential team fit issues - consider additional assessment')
    }

    if (candidate.culture_indicators.communication_fit < 3.5) {
      recommendations.push('Focus on communication style alignment during interview')
    }

    if (candidate.team_dynamics_analysis.potential_conflicts.length > 0) {
      recommendations.push('Address potential conflicts in team dynamics discussion')
    }

    return recommendations
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
          <h2 className="text-2xl font-bold text-gray-900">Team Fit & Culture Analysis</h2>
          <p className="text-gray-600 mt-1">
            Analyze how candidates will integrate with your team culture and dynamics
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportTeamFitReport} 
            disabled={!selectedCandidate}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Current Team Overview */}
      {teamDynamics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Team Dynamics
            </CardTitle>
            <CardDescription>
              Understanding your team's current culture and dynamics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Members */}
              <div>
                <h4 className="font-semibold mb-3">Team Members</h4>
                <div className="space-y-3">
                  {teamDynamics.current_team.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.role} • {member.tenure_months} months</p>
                      </div>
                      <div className="flex gap-1">
                        {member.personality_traits.slice(0, 2).map(trait => (
                          <Badge key={trait} variant="outline" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Culture */}
              <div>
                <h4 className="font-semibold mb-3">Team Culture</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Dominant Traits</p>
                    <div className="flex flex-wrap gap-1">
                      {teamDynamics.team_culture.dominant_traits.map(trait => (
                        <Badge key={trait} className="bg-primary/10 text-primary">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Communication Style</p>
                    <p className="text-sm text-gray-600">{teamDynamics.team_culture.communication_style}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Work Rhythm</p>
                    <p className="text-sm text-gray-600">{teamDynamics.team_culture.work_rhythm}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Innovation Level</p>
                      <div className="flex items-center gap-2">
                        <Progress value={teamDynamics.team_culture.innovation_level * 20} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{teamDynamics.team_culture.innovation_level}/5</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Collaboration Level</p>
                      <div className="flex items-center gap-2">
                        <Progress value={teamDynamics.team_culture.collaboration_level * 20} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{teamDynamics.team_culture.collaboration_level}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Candidate Team Fit Analysis
          </CardTitle>
          <CardDescription>
            Select a candidate to analyze their team fit and culture alignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {candidates.map(candidate => (
              <Card 
                key={candidate.id} 
                className={`cursor-pointer transition-all ${
                  selectedCandidate === candidate.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedCandidate(candidate.id)}
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
                        <p className="text-xs text-gray-600">{candidate.role_applied}</p>
                      </div>
                    </div>
                    {selectedCandidate === candidate.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Team Fit</span>
                      <Badge className={getScoreColor(candidate.team_fit_score)}>
                        {candidate.team_fit_score}/5
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Culture Alignment</span>
                      <Badge className={getScoreColor(candidate.culture_alignment)}>
                        {candidate.culture_alignment}/5
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Analysis */}
          {selectedCandidate && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="personality">Personality</TabsTrigger>
                <TabsTrigger value="dynamics">Team Dynamics</TabsTrigger>
                <TabsTrigger value="feedback">Peer Feedback</TabsTrigger>
              </TabsList>

              {(() => {
                const candidate = candidates.find(c => c.id === selectedCandidate)
                if (!candidate) return null

                return (
                  <>
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Culture Indicators */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Culture Indicators</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {Object.entries(candidate.culture_indicators).map(([key, value]) => (
                              <div key={key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium capitalize">
                                    {key.replace('_', ' ')}
                                  </span>
                                  <Badge className={getScoreColor(value)}>
                                    {value}/5
                                  </Badge>
                                </div>
                                <Progress value={value * 20} className="h-2" />
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Team Dynamics Summary */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Team Dynamics Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Role Complementarity</span>
                                <Badge className={getScoreColor(candidate.team_dynamics_analysis.role_complementarity)}>
                                  {candidate.team_dynamics_analysis.role_complementarity}/5
                                </Badge>
                              </div>
                              <Progress value={candidate.team_dynamics_analysis.role_complementarity * 20} className="h-2" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Knowledge Sharing Potential</span>
                                <Badge className={getScoreColor(candidate.team_dynamics_analysis.knowledge_sharing_potential)}>
                                  {candidate.team_dynamics_analysis.knowledge_sharing_potential}/5
                                </Badge>
                              </div>
                              <Progress value={candidate.team_dynamics_analysis.knowledge_sharing_potential * 20} className="h-2" />
                            </div>

                            {candidate.team_dynamics_analysis.synergy_opportunities.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Synergy Opportunities</p>
                                <div className="space-y-1">
                                  {candidate.team_dynamics_analysis.synergy_opportunities.map((opportunity, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                                      <CheckCircle className="h-3 w-3" />
                                      {opportunity}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {candidate.team_dynamics_analysis.potential_conflicts.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Potential Conflicts</p>
                                <div className="space-y-1">
                                  {candidate.team_dynamics_analysis.potential_conflicts.map((conflict, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-orange-600">
                                      <AlertTriangle className="h-3 w-3" />
                                      {conflict}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Personality Tab */}
                    <TabsContent value="personality" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personality Traits */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Personality Traits</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {candidate.personality_assessment.traits.map(trait => (
                              <div key={trait.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{trait.name}</span>
                                  <Badge className={getScoreColor(trait.score)}>
                                    {trait.score}/5
                                  </Badge>
                                </div>
                                <Progress value={trait.score * 20} className="h-2" />
                                <p className="text-xs text-gray-600">{trait.description}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Work Style */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Work Style</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {candidate.personality_assessment.work_style.map(style => (
                              <div key={style.style} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{style.style}</span>
                                  <Badge className={getScoreColor(style.score)}>
                                    {style.score}/5
                                  </Badge>
                                </div>
                                <Progress value={style.score * 20} className="h-2" />
                                <p className="text-xs text-gray-600">{style.description}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Communication & Collaboration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Communication Preference</p>
                              <p className="text-sm text-gray-600">{candidate.personality_assessment.communication_preference}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Collaboration Style</p>
                              <p className="text-sm text-gray-600">{candidate.personality_assessment.collaboration_style}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Team Dynamics Tab */}
                    <TabsContent value="dynamics" className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Synergy Opportunities */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Zap className="h-5 w-5 text-green-600" />
                              Synergy Opportunities
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {candidate.team_dynamics_analysis.synergy_opportunities.length > 0 ? (
                              <div className="space-y-3">
                                {candidate.team_dynamics_analysis.synergy_opportunities.map((opportunity, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                    <p className="text-sm text-green-800">{opportunity}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No specific synergy opportunities identified</p>
                            )}
                          </CardContent>
                        </Card>

                        {/* Potential Conflicts */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                              Potential Conflicts
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {candidate.team_dynamics_analysis.potential_conflicts.length > 0 ? (
                              <div className="space-y-3">
                                {candidate.team_dynamics_analysis.potential_conflicts.map((conflict, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                                    <p className="text-sm text-orange-800">{conflict}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No potential conflicts identified</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Peer Feedback Tab */}
                    <TabsContent value="feedback" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Peer Endorsements & Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {candidate.peer_feedback.length > 0 ? (
                            <div className="space-y-4">
                              {candidate.peer_feedback.map((feedback, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback>{feedback.reviewer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-sm">{feedback.reviewer}</p>
                                        <p className="text-xs text-gray-600 capitalize">{feedback.relationship}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-700">"{feedback.feedback}"</p>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {feedback.traits_mentioned.map(trait => (
                                      <Badge key={trait} variant="outline" className="text-xs">
                                        {trait}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No peer feedback available yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                )
              })()}
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Team Fit Analysis:</strong> Consider both technical skills and cultural alignment when making hiring decisions. 
          High team fit scores indicate better integration potential, while culture alignment ensures long-term success.
        </AlertDescription>
      </Alert>
    </div>
  )
}
