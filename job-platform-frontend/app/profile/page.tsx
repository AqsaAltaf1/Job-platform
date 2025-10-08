"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Plus, MapPin, Mail, Phone, Globe, Linkedin, Github, Calendar, Building, Briefcase, Code, ExternalLink, User, Star, CheckCircle, Clock, DollarSign, FileText, Eye, Trash2, Shield } from "lucide-react"
import { ExperienceModal } from "@/components/profile/experience-modal"
import { ProjectModal } from "@/components/profile/project-modal"
import { EducationModal } from "@/components/profile/education-modal"
import EnhancedSkillsModal from "@/components/profile/enhanced-skills-modal"
import SkillEvidenceModal from "@/components/profile/skill-evidence-modal"
import PeerEndorsementModal from "@/components/profile/peer-endorsement-modal"
import ReviewerInvitationModal from "@/components/profile/reviewer-invitation-modal"
import { LinkedInSkillsImport } from "@/components/profile/linkedin-skills-import"
import { TeamManagement } from "@/components/team/team-management"
import { ProfileModalWrapper } from "@/components/profile/profile-modal-wrapper"
import NarrativeControl from "@/components/profile/narrative-control"
import AdvancedCustomization from "@/components/profile/advanced-customization"
import type { Experience, Project, Education, EnhancedSkill } from "@/lib/types"
import { showToast } from "@/lib/toast"
import { useSearchParams } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, refreshUser, showProfileModal, setShowProfileModal } = useAuth()
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)
  const [showEnhancedSkillsModal, setShowEnhancedSkillsModal] = useState(false)
  const [showSkillEvidenceModal, setShowSkillEvidenceModal] = useState(false)
  const [showPeerEndorsementModal, setShowPeerEndorsementModal] = useState(false)
  const [showReviewerInvitationModal, setShowReviewerInvitationModal] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<EnhancedSkill | null>(null)
  const [editingSkill, setEditingSkill] = useState<EnhancedSkill | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [enhancedSkills, setEnhancedSkills] = useState<EnhancedSkill[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("experience")
  const [verificationStatus, setVerificationStatus] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (user?.role === 'candidate') {
      // Refresh user data to ensure candidateProfile is loaded
      refreshUser()
      loadExperiences()
      loadProjects()
      loadEducations()
      loadEnhancedSkills()
      loadVerificationStatus()
    }
  }, [user])

  // Debug effect to track user data changes
  useEffect(() => {
    console.log('User data changed:', {
      user: user,
      candidateProfile: user?.candidateProfile,
      hasCandidateProfile: !!user?.candidateProfile
    })
  }, [user?.candidateProfile])

  // Check for verification notification
  useEffect(() => {
    const verificationParam = searchParams.get('verification')
    if (verificationParam === 'submitted') {
      showToast.success('Identity verification submitted successfully! Your profile is now under review.')
      // Clean up the URL parameter
      router.replace('/profile', { scroll: false })
    }
  }, [searchParams, router])

  const loadExperiences = async () => {
    try {
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/experiences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setExperiences(data.experiences)
      }
    } catch (error) {
      console.error('Failed to load experiences:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadEducations = async () => {
    try {
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/educations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setEducations(data.educations)
      }
    } catch (error) {
      console.error('Failed to load educations:', error)
    }
  }

  const loadEnhancedSkills = async () => {
    try {
      if (!user?.candidateProfile?.id) return
      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/candidates/${user.candidateProfile.id}/skills`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setEnhancedSkills(data)
      } else {
        console.error('Failed to load enhanced skills:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to load enhanced skills:', error)
    }
  }

  const loadVerificationStatus = async () => {
    try {
      const response = await fetch('process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/verification/user-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setVerificationStatus(data.verification)
        }
      } else {
        console.error('Failed to load verification status:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to load verification status:', error)
    }
  }

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience)
    setShowExperienceModal(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowProjectModal(true)
  }

  const handleEditEducation = (education: Education) => {
    setEditingEducation(education)
    setShowEducationModal(true)
  }

  const handleCloseModals = () => {
    setShowProfileModal(false)
    setShowExperienceModal(false)
    setShowProjectModal(false)
    setShowEducationModal(false)
    setShowEnhancedSkillsModal(false)
    setShowSkillEvidenceModal(false)
    setShowPeerEndorsementModal(false)
    setShowReviewerInvitationModal(false)
    setEditingExperience(null)
    setEditingProject(null)
    setEditingEducation(null)
    setSelectedSkill(null)
    setEditingSkill(null)
  }

  const handleDeleteSkill = async (skillId: string, skillName: string) => {
    try {
      const token = localStorage.getItem('jwt_token')
      if (!token) return

      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Remove skill from local state
        setEnhancedSkills(prev => prev.filter(skill => skill.id !== skillId))
        showToast.success(`Skill "${skillName}" deleted successfully!`)
        // Ensure we stay on the skills tab
        setActiveTab('skills')
      } else {
        const errorData = await response.json()
        showToast.error(errorData.error || 'Failed to delete skill')
      }
    } catch (error) {
      console.error('Error deleting skill:', error)
      showToast.error('Failed to delete skill')
    }
  }

  const handleDeleteExperience = async (experienceId: string, companyName: string) => {
    try {
      const token = localStorage.getItem('jwt_token')
      if (!token) return

      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/experiences/${experienceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Remove experience from local state
        setExperiences(prev => prev.filter(exp => exp.id !== experienceId))
        showToast.success(`Experience at "${companyName}" deleted successfully!`)
      } else {
        const errorData = await response.json()
        showToast.error(errorData.error || 'Failed to delete experience')
      }
    } catch (error) {
      console.error('Error deleting experience:', error)
      showToast.error('Failed to delete experience')
    }
  }

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    try {
      const token = localStorage.getItem('jwt_token')
      if (!token) return

      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Remove project from local state
        setProjects(prev => prev.filter(proj => proj.id !== projectId))
        showToast.success(`Project "${projectTitle}" deleted successfully!`)
      } else {
        const errorData = await response.json()
        showToast.error(errorData.error || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      showToast.error('Failed to delete project')
    }
  }

  const handleDeleteEducation = async (educationId: string, institutionName: string) => {
    try {
      const token = localStorage.getItem('jwt_token')
      if (!token) return

      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/educations/${educationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Remove education from local state
        setEducations(prev => prev.filter(edu => edu.id !== educationId))
        showToast.success(`Education at "${institutionName}" deleted successfully!`)
      } else {
        const errorData = await response.json()
        showToast.error(errorData.error || 'Failed to delete education')
      }
    } catch (error) {
      console.error('Error deleting education:', error)
      showToast.error('Failed to delete education')
    }
  }

  const reloadUserData = async () => {
    try {
      setRefreshing(true)
      console.log('Before refresh - user data:', user?.candidateProfile)
      
      // Force refresh the user data by calling the API directly
      const token = localStorage.getItem('jwt_token')
      if (token) {
        const response = await fetch('process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const userData = await response.json()
          console.log('Fresh user data from API:', userData.user?.candidateProfile)
          // Force a re-render by updating the auth context
          await refreshUser()
        }
      }
      
      console.log('After refresh - user data:', user?.candidateProfile)
    } catch (error) {
      console.error('Failed to reload user data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleSave = async () => {
    console.log('Main handleSave function called - this should NOT be called for endorsement invitations')
    try {
      // Reload user data first to get the latest profile information
      await reloadUserData()
      
      // Then reload all the profile sections
      if (user?.role === 'candidate') {
        await Promise.all([
          loadExperiences(),
          loadProjects(),
          loadEducations(),
          loadEnhancedSkills()
        ])
      }
      
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1)
      
      // Show success message
      showToast.success('Profile updated successfully!')
      
      handleCloseModals()
      // Keep the current tab active
    } catch (error) {
      console.error('Failed to refresh profile data:', error)
      showToast.error('Failed to update profile data')
      // Still close modals even if refresh fails
      handleCloseModals()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Updating profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Button asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      </div>
    )
  }

  const profile = user.candidateProfile || user.employerProfile

  return (
    <div className="min-h-screen bg-gray-50" key={refreshKey}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center">
                  {/* Profile Picture */}
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-32 h-32 mx-auto">
                      <AvatarImage 
                        src={user.role === 'candidate' 
                          ? user.candidateProfile?.profile_picture_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=3b82f6&color=fff&size=128`
                          : user.employerProfile?.profile_picture_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=3b82f6&color=fff&size=128`
                        } 
                        alt={`${user.first_name} ${user.last_name}`}
                      />
                      <AvatarFallback className="text-2xl">
                        {user.first_name[0]}{user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name and Role */}
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.role === 'employer' && user.employerProfile?.first_name
                      ? `${user.employerProfile.first_name} ${user.employerProfile.last_name || ''}`.trim()
                      : `${user.first_name} ${user.last_name}`
                    }
                  </h1>
                  {user.role === 'candidate' && (
                  <p className="text-lg text-gray-600 mb-2">
                      {user.candidateProfile?.job_title || 'Candidate'}
                    </p>
                  )}
                  {user.role === 'employer' && user.employerProfile?.position && (
                    <p className="text-lg text-gray-600 mb-2">
                      {user.employerProfile.position}
                    </p>
                  )}
                  
                  {/* Identity Verification Badge - Only for Candidates */}
                  {user.role === 'candidate' && (
                    <>
                      {verificationStatus?.isVerified ? (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Badge className="bg-primary hover:bg-primary/90 text-white border-0">
                            <Shield className="h-3 w-3 mr-1" />
                            Identity Verified
                          </Badge>
                        </div>
                      ) : verificationStatus?.status === 'SUBMITTED' || verificationStatus?.code === 'UNDER_REVIEW' ? (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Badge variant="outline" className="border-blue-300 text-blue-600 bg-blue-50">
                            <Clock className="h-3 w-3 mr-1" />
                            Under Review
                          </Badge>
                        </div>
                      ) : verificationStatus?.status === 'DECLINED' ? (
                        <div className="flex flex-col items-center gap-2 mb-4">
                          <Badge variant="outline" className="border-red-300 text-red-600 bg-red-50">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Verification Declined
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.push('/verification')}
                            className="text-xs hover:bg-primary hover:text-white hover:border-primary"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Try Again
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 mb-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.push('/verification')}
                            className="text-xs hover:bg-primary hover:text-white hover:border-primary"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Verify Identity
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Admin Approval Status - Only for Employers */}
                  {user.role === 'employer' && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge variant="outline" className="border-blue-300 text-blue-600 bg-blue-50">
                        <Building className="h-3 w-3 mr-1" />
                        Pending Admin Approval
                      </Badge>
                    </div>
                  )}
                  
                  {/* Rate (for candidates) */}
                  {user.role === 'candidate' && user.candidateProfile?.salary_expectation && (
                    <div className="flex items-center justify-center gap-1 mb-4">
                      <span className="text-lg font-semibold text-primary">
                        ${user.candidateProfile.salary_expectation.toLocaleString()}/year
                      </span>
                    </div>
                  )}

                  {/* Bio */}
                  {user.role === 'candidate' && user.candidateProfile?.bio && (
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {user.candidateProfile.bio}
                    </p>
                  )}
                  {user.role === 'employer' && user.employerProfile?.company_description && (
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {user.employerProfile.company_description}
                    </p>
                  )}

                  {/* Skills (for candidates) */}
                  {user.role === 'candidate' && user.candidateProfile?.skills && user.candidateProfile.skills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Skills:</h3>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {user.candidateProfile.skills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {user.candidateProfile.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.candidateProfile.skills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{user.email}</span>
                    </div>
                    {user.role === 'candidate' && user.candidateProfile?.phone && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{user.candidateProfile.phone}</span>
                      </div>
                    )}
                    {user.role === 'employer' && user.employerProfile?.phone && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{user.employerProfile.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-4 mt-4">
                    {user.role === 'candidate' && user.candidateProfile?.linkedin_url && (
                      <a href={user.candidateProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {user.role === 'employer' && user.employerProfile?.linkedin_url && (
                      <a href={user.employerProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {user.candidateProfile?.github_url && (
                      <a href={user.candidateProfile.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {user.role === 'candidate' && user.candidateProfile?.website && (
                      <a href={user.candidateProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                    {user.role === 'employer' && user.employerProfile?.company_website && (
                      <a href={user.employerProfile.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>

                  {/* Edit Profile Button */}
                  <Button 
                    className="w-full mt-6 bg-primary hover:bg-primary/90 text-white"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>

                  {/* Admin Panel Link for Super Admin */}
                  {user?.role === 'super_admin' && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-3"
                      onClick={() => router.push('/admin')}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
            </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {user.role === 'candidate' && user.candidateProfile?.experience_years && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{user.candidateProfile.experience_years}</div>
                      <div className="text-sm text-gray-600">Years Experience</div>
                    </div>
                  )}
                  {user.role === 'candidate' && user.candidateProfile?.location && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        <MapPin className="h-6 w-6 mx-auto" />
                      </div>
                      <div className="text-sm text-gray-600">{user.candidateProfile.location}</div>
                    </div>
                  )}
                  {user.role === 'employer' && user.employerProfile?.company_location && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        <MapPin className="h-6 w-6 mx-auto" />
                      </div>
                      <div className="text-sm text-gray-600">{user.employerProfile.company_location}</div>
                    </div>
                  )}
                  {user.role === 'candidate' && user.candidateProfile?.availability && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        <Clock className="h-6 w-6 mx-auto" />
                      </div>
                      <div className="text-sm text-gray-600">
                        {user.candidateProfile.availability === 'immediate' && 'Available Immediately'}
                        {user.candidateProfile.availability === '2-weeks' && 'Available in 2 weeks'}
                        {user.candidateProfile.availability === '1-month' && 'Available in 1 month'}
                        {user.candidateProfile.availability === 'not-available' && 'Not Currently Available'}
                      </div>
                    </div>
                  )}
                  {/* Verification Status - Only for Candidates */}
                  {user.role === 'candidate' && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {verificationStatus?.isVerified ? (
                          <Shield className="h-6 w-6 mx-auto text-primary" />
                        ) : verificationStatus?.status === 'SUBMITTED' || verificationStatus?.code === 'UNDER_REVIEW' ? (
                          <Clock className="h-6 w-6 mx-auto text-blue-500" />
                        ) : verificationStatus?.status === 'DECLINED' ? (
                          <ExternalLink className="h-6 w-6 mx-auto text-red-500" />
                        ) : (
                          <Clock className="h-6 w-6 mx-auto text-orange-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {verificationStatus?.isVerified 
                          ? 'Identity Verified' 
                          : verificationStatus?.status === 'SUBMITTED' || verificationStatus?.code === 'UNDER_REVIEW'
                          ? 'Under Review'
                          : verificationStatus?.status === 'DECLINED'
                          ? 'Verification Declined'
                          : 'Not Verified'
                        }
                      </div>
                    </div>
                  )}

                  {/* Admin Approval Status - Only for Employers */}
                  {user.role === 'employer' && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        <Building className="h-6 w-6 mx-auto text-blue-500" />
                      </div>
                      <div className="text-sm text-gray-600">
                        Pending Admin Approval
                      </div>
                    </div>
                  )}
                  </div>
              </CardContent>
            </Card>

            {/* Company Information Card (for employers) */}
            {user?.role === 'employer' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    
                    {/* Company Header */}
                    <div className="flex items-start gap-4">
                      {user.employerProfile?.company_logo_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img 
                            src={user.employerProfile.company_logo_url} 
                            alt="Company Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {user.employerProfile?.company_display_name || user.employerProfile?.company_name || 'Company Name Not Set'}
                        </h3>
                        {user.employerProfile?.company_legal_name && user.employerProfile.company_legal_name !== user.employerProfile?.company_name && (
                          <p className="text-sm text-gray-600">Legal Name: {user.employerProfile.company_legal_name}</p>
                        )}
                        {user.employerProfile?.position && (
                          <p className="text-sm text-blue-600 font-medium">{user.employerProfile.position}</p>
                        )}
                      </div>
                    </div>

                    {/* Company Description */}
                    {user.employerProfile?.company_description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">About the Company</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {user.employerProfile.company_description}
                        </p>
                      </div>
                    )}

                    {/* Company Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      {/* Industry & Sector */}
                      {user.employerProfile?.company_industry && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.employerProfile.company_industry}</p>
                            {user.employerProfile?.company_sector && (
                              <p className="text-xs text-gray-500">{user.employerProfile.company_sector}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Company Size */}
                      {user.employerProfile?.company_size && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.employerProfile.company_size} employees</p>
                            <p className="text-xs text-gray-500">Company Size</p>
                          </div>
                        </div>
                      )}

                      {/* Remote Policy */}
                      {user.employerProfile?.remote_policy && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.employerProfile.remote_policy === 'on-site' && 'On-site Only'}
                              {user.employerProfile.remote_policy === 'remote' && 'Fully Remote'}
                              {user.employerProfile.remote_policy === 'hybrid' && 'Hybrid'}
                              {user.employerProfile.remote_policy === 'flexible' && 'Flexible'}
                            </p>
                            <p className="text-xs text-gray-500">Work Policy</p>
                          </div>
                        </div>
                      )}

                      {/* Headquarters */}
                      {user.employerProfile?.headquarters_location && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.employerProfile.headquarters_location}</p>
                            <p className="text-xs text-gray-500">Headquarters</p>
                          </div>
                        </div>
                      )}

                      {/* Primary Office */}
                      {user.employerProfile?.company_location && user.employerProfile.company_location !== user.employerProfile?.headquarters_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.employerProfile.company_location}</p>
                            <p className="text-xs text-gray-500">Primary Office</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Company Links */}
                    {(user.employerProfile?.company_website || user.employerProfile?.careers_page_url) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Company Links</h4>
                        <div className="flex flex-wrap gap-3">
                          {user.employerProfile?.company_website && (
                            <a 
                              href={user.employerProfile.company_website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                            >
                              <Globe className="h-4 w-4" />
                              Company Website
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {user.employerProfile?.careers_page_url && (
                            <a 
                              href={user.employerProfile.careers_page_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                            >
                              <Briefcase className="h-4 w-4" />
                              Careers Page
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Management - Only for Employers */}
            {user?.role === 'employer' && user.employerProfile && (
              <TeamManagement employerProfile={user.employerProfile} />
            )}

            {/* Detailed Information Tabs - Only for Candidates */}
            {user?.role === 'candidate' && (
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="narrative">Narrative</TabsTrigger>
                    <TabsTrigger value="customization">Portfolio</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="experience" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Work Experience</h3>
                      {user.role === 'candidate' && (
                        <Button size="sm" onClick={() => setShowExperienceModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Experience
                        </Button>
                      )}
                    </div>

                    {user.role === 'candidate' ? (
                      experiences.length > 0 ? (
                  <div className="space-y-4">
                          {experiences.map((experience) => (
                            <div key={experience.id} className="border-l-4 border-blue-500 pl-4 py-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">{experience.role}</h4>
                                  <p className="text-gray-600 font-medium">{experience.company_name}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(experience.from_date).toLocaleDateString()} - {experience.is_current ? 'Present' : new Date(experience.to_date!).toLocaleDateString()}
                                    </div>
                                    {experience.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {experience.location}
                                      </div>
                                    )}
                                  </div>
                                  {experience.description && (
                                    <p className="text-gray-600 mt-2 text-sm">{experience.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditExperience(experience)} className="hover:bg-primary hover:text-white">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete your experience at "${experience.company_name}"?`)) {
                                        handleDeleteExperience(experience.id, experience.company_name)
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No work experience added yet</p>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Employer profile - no work experience to display</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="projects" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Projects</h3>
                      {user.role === 'candidate' && (
                        <Button size="sm" onClick={() => setShowProjectModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Project
                        </Button>
                      )}
                    </div>

                    {user.role === 'candidate' ? (
                      projects.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {projects.map((project) => (
                            <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-lg">{project.title}</h4>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)} className="hover:bg-primary hover:text-white">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete the project "${project.title}"?`)) {
                                        handleDeleteProject(project.id, project.title)
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {project.description && (
                                <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                              )}
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {project.technologies.map((tech, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-2">
                                {project.project_url && (
                                  <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                                    <ExternalLink className="h-3 w-3" />
                                    Live Demo
                                  </a>
                                )}
                                {project.github_url && (
                                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 hover:text-primary text-sm">
                                    <Github className="h-3 w-3" />
                                    Code
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No projects added yet</p>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Employer profile - no projects to display</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="education" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Education</h3>
                      {user.role === 'candidate' && (
                        <Button size="sm" onClick={() => setShowEducationModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Education
                        </Button>
                      )}
                    </div>

                    {user.role === 'candidate' ? (
                      educations.length > 0 ? (
                        <div className="space-y-4">
                          {educations.map((education) => (
                            <div key={education.id} className="border-l-4 border-green-500 pl-4 py-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">{education.degree}</h4>
                                  <p className="text-gray-600 font-medium">{education.institution_name}</p>
                                  {education.field_of_study && (
                                    <p className="text-gray-500 text-sm">{education.field_of_study}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(education.start_date).toLocaleDateString()} - {education.is_current ? 'Present' : new Date(education.end_date!).toLocaleDateString()}
                                    </div>
                                    {education.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {education.location}
                                      </div>
                                    )}
                                    {education.gpa && (
                                      <div className="flex items-center gap-1">
                                        <span>GPA: {education.gpa}</span>
                                      </div>
                                    )}
                                  </div>
                                  {education.description && (
                                    <p className="text-gray-600 mt-2 text-sm">{education.description}</p>
                                  )}
                                  {education.activities && (
                                    <p className="text-gray-500 mt-1 text-sm">
                                      <strong>Activities:</strong> {education.activities}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditEducation(education)} className="hover:bg-primary hover:text-white">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete your education at "${education.institution_name}"?`)) {
                                        handleDeleteEducation(education.id, education.institution_name)
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No education information added yet</p>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Employer profile - no education to display</p>
                  </div>
                    )}
                  </TabsContent>

                  <TabsContent value="skills" className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Skills & Competencies</h3>
                      {user.role === 'candidate' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setShowEnhancedSkillsModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Skill
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowReviewerInvitationModal(true)} className="hover:bg-primary hover:text-white hover:border-primary">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invitations
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* LinkedIn Skills Import */}
                    {user.role === 'candidate' && (
                      <div className="mb-6">
                        <LinkedInSkillsImport 
                          candidateId={user.candidateProfile?.id || ''}
                          onSkillsImported={(count) => {
                            showToast.success(`Imported ${count} skills from LinkedIn!`)
                            loadEnhancedSkills()
                          }}
                        />
                      </div>
                    )}

                    {user.role === 'candidate' ? (
                      enhancedSkills.length > 0 ? (
                        <div className="space-y-4">
                          {enhancedSkills.map((skill) => (
                            <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-lg">{skill.name}</h4>
                                    <Badge className={
                                      skill.level === 'beginner' ? 'bg-gray-100 text-gray-800' :
                                      skill.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                                      skill.level === 'advanced' ? 'bg-primary/10 text-primary' :
                                      'bg-purple-100 text-purple-800'
                                    }>
                                      {skill.level}
                                    </Badge>
                                    <Badge variant="outline">{skill.taxonomy_source}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                    <span>{skill.category}</span>
                                    <span>•</span>
                                    <span>{skill.years_experience} years</span>
                                    <span>•</span>
                                    {skill.skill_rating && typeof skill.skill_rating === 'number' && (
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => {
                                          const rating = skill.skill_rating || 0;
                                          return (
                                            <Star
                                              key={i}
                                              className={`h-4 w-4 ${
                                                i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                              }`}
                                            />
                                          );
                                        })}
                                        <span className="ml-1">({(skill.skill_rating || 0).toFixed(1)}/5)</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {skill.verified_rating && (
                                    <div className="text-sm text-primary">
                                      Verified Rating: {skill.verified_rating}/5
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // Navigate to skill detail page in same tab
                                      router.push(`/skill/${skill.id}`);
                                    }}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingSkill(skill);
                                      setShowEnhancedSkillsModal(true);
                                    }}
                                    title="Edit Skill"
                                    className="hover:bg-primary hover:text-white hover:border-primary"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete "${skill.name}"?`)) {
                                        handleDeleteSkill(skill.id, skill.name);
                                      }
                                    }}
                                    title="Delete Skill"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSkill(skill);
                                      setShowSkillEvidenceModal(true);
                                    }}
                                    title="Manage Evidence"
                                    className="hover:bg-primary hover:text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSkill(skill);
                                      setShowPeerEndorsementModal(true);
                                    }}
                                    title="Manage Endorsements"
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Evidence Preview */}
                              {skill.evidence && skill.evidence.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Evidence:
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {skill.evidence.slice(0, 3).map((evidence) => (
                                      <div key={evidence.id} className="flex items-center gap-1 text-xs bg-green-50 border border-green-200 px-2 py-1 rounded">
                                        {evidence.type === 'work_sample' && <FileText className="h-3 w-3 text-green-600" />}
                                        {evidence.type === 'github_repo' && <Github className="h-3 w-3 text-green-600" />}
                                        {evidence.type === 'portfolio_link' && <ExternalLink className="h-3 w-3 text-green-600" />}
                                        {evidence.type === 'certification' && <CheckCircle className="h-3 w-3 text-green-600" />}
                                        {evidence.type === 'project' && <Briefcase className="h-3 w-3 text-green-600" />}
                                        <span className="text-green-700">{evidence.title}</span>
                                      </div>
                                    ))}
                                    {skill.evidence.length > 3 && (
                                      <span className="text-xs text-green-600 font-medium">+{skill.evidence.length - 3} more</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Endorsements Preview */}
                              {skill.endorsements && skill.endorsements.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Endorsements:</h5>
                                  <div className="text-xs text-gray-600">
                                    {skill.endorsements.length} endorsement{skill.endorsements.length !== 1 ? 's' : ''}
                                    {skill.endorsements.filter(e => e.verified).length > 0 && (
                                      <span className="text-primary ml-2">
                                        ({skill.endorsements.filter(e => e.verified).length} verified)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">No skills added yet</p>
                          <Button onClick={() => setShowEnhancedSkillsModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Skill
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Employer profile - no skills to display</p>
                      </div>
                    )}
                  </TabsContent>


                  {/* Narrative Control Tab */}
                  <TabsContent value="narrative" className="p-6">
                    <NarrativeControl />
                  </TabsContent>

                  {/* Advanced Customization Tab */}
                  <TabsContent value="customization" className="p-6">
                    <AdvancedCustomization />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            )}
          </div>
        </div>

        {/* Modals */}
        <ProfileModalWrapper onProfileSave={handleSave} />
        
        {user.role === 'candidate' && (
          <>
            <ExperienceModal
              isOpen={showExperienceModal}
              onClose={handleCloseModals}
              onSave={handleSave}
              experience={editingExperience}
            />

            <ProjectModal
              isOpen={showProjectModal}
              onClose={handleCloseModals}
              onSave={handleSave}
              project={editingProject}
            />

            <EducationModal
              isOpen={showEducationModal}
              onClose={handleCloseModals}
              onSave={handleSave}
              education={editingEducation}
            />

            <EnhancedSkillsModal
              isOpen={showEnhancedSkillsModal}
              onClose={handleCloseModals}
              candidateId={user.candidateProfile?.id || ''}
              onSave={handleSave}
              editingSkill={editingSkill}
            />

            <SkillEvidenceModal
              isOpen={showSkillEvidenceModal}
              onClose={handleCloseModals}
              skillId={selectedSkill?.id || ''}
              skillName={selectedSkill?.name || ''}
              onSave={handleSave}
            />

            <PeerEndorsementModal
              isOpen={showPeerEndorsementModal}
              onClose={handleCloseModals}
              skillId={selectedSkill?.id || ''}
              skillName={selectedSkill?.name || ''}
              onSave={() => {
                // Only reload enhanced skills for endorsement updates, not full profile
                // No success message needed as the endorsement modal handles its own success message
                console.log('PeerEndorsementModal onSave called - reloading enhanced skills only')
                if (user?.role === 'candidate') {
                  loadEnhancedSkills()
                }
              }}
            />

            <ReviewerInvitationModal
              isOpen={showReviewerInvitationModal}
              onClose={handleCloseModals}
              candidateId={user.candidateProfile?.id || ''}
              onSave={handleSave}
            />
          </>
        )}
      </div>
    </div>
  )
}