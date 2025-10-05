"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Crown, 
  Shield, 
  Users, 
  Mail, 
  Phone, 
  Building2,
  MoreVertical,
  Eye,
  BarChart3,
  Settings
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TeamMemberModal } from "./team-member-modal"
import type { TeamMember, TeamRole, EmployerProfile } from "@/lib/types"
import { showToast } from "@/lib/toast"
import { getApiUrl } from "@/lib/config"

interface TeamManagementProps {
  employerProfile: EmployerProfile
}

const roleColors: Record<TeamRole, string> = {
  primary_owner: "bg-purple-100 text-purple-800",
  hr_manager: "bg-blue-100 text-blue-800",
  recruiter: "bg-green-100 text-green-800",
  interviewer: "bg-orange-100 text-orange-800",
  admin: "bg-red-100 text-red-800",
}

const roleIcons: Record<TeamRole, React.ReactNode> = {
  primary_owner: <Crown className="h-4 w-4" />,
  hr_manager: <Shield className="h-4 w-4" />,
  recruiter: <UserPlus className="h-4 w-4" />,
  interviewer: <Users className="h-4 w-4" />,
  admin: <Settings className="h-4 w-4" />,
}

export function TeamManagement({ employerProfile }: TeamManagementProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    loadTeamMembers()
  }, [employerProfile.id])

  const loadTeamMembers = async () => {
    try {
      const response = await fetch(getApiUrl(`/team-members/${employerProfile.id}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setTeamMembers(data.teamMembers)
      }
    } catch (error) {
      console.error('Failed to load team members:', error)
      showToast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMember = async (memberData: Partial<TeamMember>) => {
    try {
      const url = memberData.id 
        ? getApiUrl(`/team-members/${memberData.id}`)
        : getApiUrl(`/team-members`)
      
      const response = await fetch(url, {
        method: memberData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify(memberData)
      })

      const data = await response.json()
      if (data.success) {
        showToast.success(memberData.id ? 'Team member updated successfully' : 'Team member added successfully')
        loadTeamMembers()
        setShowMemberModal(false)
        setEditingMember(null)
      } else {
        throw new Error(data.error || 'Failed to save team member')
      }
    } catch (error) {
      console.error('Failed to save team member:', error)
      showToast.error('Failed to save team member')
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return
    }

    try {
      const response = await fetch(getApiUrl(`/team-members/${memberId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      })

      const data = await response.json()
      if (data.success) {
        showToast.success('Team member removed successfully')
        loadTeamMembers()
      } else {
        throw new Error(data.error || 'Failed to remove team member')
      }
    } catch (error) {
      console.error('Failed to remove team member:', error)
      showToast.error('Failed to remove team member')
    }
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setShowMemberModal(true)
  }

  const handleAddMember = () => {
    setEditingMember(null)
    setShowMemberModal(true)
  }

  const getPermissionIcons = (member: TeamMember) => {
    const icons = []
    if (member.permissions.can_post_jobs) icons.push(<UserPlus key="jobs" className="h-3 w-3" title="Can post jobs" />)
    if (member.permissions.can_view_applications) icons.push(<Eye key="apps" className="h-3 w-3" title="Can view applications" />)
    if (member.permissions.can_interview_candidates) icons.push(<Users key="interview" className="h-3 w-3" title="Can interview candidates" />)
    if (member.permissions.can_manage_team) icons.push(<Shield key="team" className="h-3 w-3" title="Can manage team" />)
    if (member.permissions.can_access_analytics) icons.push(<BarChart3 key="analytics" className="h-3 w-3" title="Can access analytics" />)
    if (member.permissions.can_manage_company_profile) icons.push(<Settings key="profile" className="h-3 w-3" title="Can manage company profile" />)
    return icons
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading team members...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage your company's team members and their permissions
              </CardDescription>
            </div>
            <Button onClick={handleAddMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Primary Account Owner */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Primary Account Owner
            </h3>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={employerProfile.profile_picture_url} />
                      <AvatarFallback>
                        {employerProfile.first_name?.[0]}{employerProfile.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {employerProfile.first_name} {employerProfile.last_name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employerProfile.email}
                        </span>
                        {employerProfile.position && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {employerProfile.position}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={roleColors.primary_owner}>
                    <Crown className="h-3 w-3 mr-1" />
                    Primary Owner
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </h3>
            
            {teamMembers.length === 0 ? (
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  No team members added yet. Click "Add Member" to invite your first team member.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.first_name[0]}{member.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-semibold">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </span>
                              {member.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {member.phone}
                                </span>
                              )}
                              {member.department && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {member.department}
                                </span>
                              )}
                            </div>
                            {member.job_title && (
                              <div className="text-sm text-gray-500 mt-1">
                                {member.job_title}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={roleColors[member.role]}>
                            {roleIcons[member.role]}
                            {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            {getPermissionIcons(member)}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMember(member.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TeamMemberModal
        isOpen={showMemberModal}
        onClose={() => {
          setShowMemberModal(false)
          setEditingMember(null)
        }}
        onSave={handleSaveMember}
        member={editingMember}
        employerProfileId={employerProfile.id}
      />
    </>
  )
}
