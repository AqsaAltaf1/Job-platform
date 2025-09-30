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

  useEffect(() => {
    if (user?.role === 'candidate') {
      loadExperiences()
      loadProjects()
      loadEducations()
      loadEnhancedSkills()
    }
    loadVerificationStatus()
  }, [user])

  // Debug effect to track user data changes
  useEffect(() => {
    console.log('User data changed:', user?.candidateProfile)
  }, [user?.candidateProfile])

  // Check for verification notification
  useEffect(() => {
    const verificationParam = searchParams.get('verification')
    if (verificationParam === 'submitted') {
      showToast('Identity verification submitted successfully! Your profile is now under review.', 'success')
      // Clean up the URL parameter
      router.replace('/profile', { scroll: false })
    }
  }, [searchParams, router])

  const loadExperiences = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/experiences', {
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
      const response = await fetch('http://localhost:5000/api/projects', {
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
      const response = await fetch('http://localhost:5000/api/educations', {
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
      const response = await fetch(`http://localhost:5000/api/candidates/${user.candidateProfile.id}/skills`, {
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
      const response = await fetch('http://localhost:5000/api/verification/user-status', {
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

      const response = await fetch(`http://localhost:5000/api/skills/${skillId}`, {
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

  const reloadUserData = async () => {
    try {
      setRefreshing(true)
      console.log('Before refresh - user data:', user?.candidateProfile)
      
      // Force refresh the user data by calling the API directly
      const token = localStorage.getItem('jwt_token')
      if (token) {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
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
    // Reload user data first to get the latest profile information
    await reloadUserData()
    
    // Then reload all the profile sections
    loadExperiences()
    loadProjects()
    loadEducations()
    loadEnhancedSkills()
    
    handleCloseModals()
    // Keep the current tab active
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
    <div className="min-h-screen bg-gray-50">
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
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Name and Role */}
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    {user.role === 'candidate' 
                      ? user.candidateProfile?.job_title || 'Candidate'
                      : user.employerProfile?.position || 'Employer'
                    }
                  </p>
                  
                  {/* Identity Verification Badge */}
                  {verificationStatus?.isVerified ? (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
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
                        className="text-xs"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-orange-300 text-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push('/verification')}
                        className="text-xs"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Verify Identity
                      </Button>
                    </div>
                  )}
                  
                  {/* Rate (for candidates) */}
                  {user.role === 'candidate' && user.candidateProfile?.salary_expectation && (
                    <div className="flex items-center justify-center gap-1 mb-4">
                      <span className="text-lg font-semibold text-green-600">
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
                    {user.role === 'candidate' && user.candidateProfile?.location && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{user.candidateProfile.location}</span>
                      </div>
                    )}
                    {user.role === 'employer' && user.employerProfile?.company_location && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{user.employerProfile.company_location}</span>
                      </div>
                    )}
                    {user.role === 'candidate' && user.candidateProfile?.availability && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {user.candidateProfile.availability === 'immediate' && 'Available Immediately'}
                          {user.candidateProfile.availability === '2-weeks' && 'Available in 2 weeks'}
                          {user.candidateProfile.availability === '1-month' && 'Available in 1 month'}
                          {user.candidateProfile.availability === 'not-available' && 'Not Currently Available'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.role === 'candidate' && user.candidateProfile?.phone && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{user.candidateProfile.phone}</span>
                      </div>
                    )}
                    {user.role === 'employer' && user.employerProfile?.phone && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
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
                      <a href={user.candidateProfile.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
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
                    variant="outline" 
                    className="w-full mt-6"
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
                  {/* Verification Status */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {verificationStatus?.isVerified ? (
                        <Shield className="h-6 w-6 mx-auto text-green-500" />
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
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">100%</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  </div>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills & Competencies</TabsTrigger>
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
                                <Button variant="ghost" size="sm" onClick={() => handleEditExperience(experience)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
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
                                <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
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
                                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm">
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
                                <Button variant="ghost" size="sm" onClick={() => handleEditEducation(education)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
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
                          <Button size="sm" variant="outline" onClick={() => setShowReviewerInvitationModal(true)}>
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
                                      skill.level === 'advanced' ? 'bg-green-100 text-green-800' :
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
                                    <div className="text-sm text-green-600">
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
                                  >
                                    <FileText className="h-4 w-4" />
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
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Evidence:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {skill.evidence.slice(0, 3).map((evidence) => (
                                      <div key={evidence.id} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded">
                                        {evidence.type === 'work_sample' && <FileText className="h-3 w-3" />}
                                        {evidence.type === 'github_repo' && <Github className="h-3 w-3" />}
                                        {evidence.type === 'portfolio_link' && <ExternalLink className="h-3 w-3" />}
                                        {evidence.type === 'certification' && <CheckCircle className="h-3 w-3" />}
                                        {evidence.type === 'project' && <Briefcase className="h-3 w-3" />}
                                        <span>{evidence.title}</span>
                                      </div>
                                    ))}
                                    {skill.evidence.length > 3 && (
                                      <span className="text-xs text-gray-500">+{skill.evidence.length - 3} more</span>
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
                                      <span className="text-green-600 ml-2">
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
                </Tabs>
                </CardContent>
              </Card>
          </div>
        </div>

        {/* Modals */}
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
              onSave={handleSave}
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