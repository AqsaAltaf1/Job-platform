"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, UserPlus, Shield, Eye, Users, BarChart3, Settings } from "lucide-react"
import type { TeamMember, TeamRole, TeamPermissions } from "@/lib/types"

interface TeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (member: Partial<TeamMember>) => void
  member?: TeamMember | null
  employerProfileId: string
}

const roleDescriptions: Record<TeamRole, string> = {
  primary_owner: "Full access to all company features and settings",
  hr_manager: "Manage team members, view analytics, and handle HR tasks",
  recruiter: "Post jobs, view applications, and manage candidates",
  interviewer: "Conduct interviews and provide candidate feedback",
  admin: "Administrative access with customizable permissions"
}

const defaultPermissions: Record<TeamRole, TeamPermissions> = {
  primary_owner: {
    can_post_jobs: true,
    can_view_applications: true,
    can_interview_candidates: true,
    can_manage_team: true,
    can_access_analytics: true,
    can_manage_company_profile: true,
  },
  hr_manager: {
    can_post_jobs: true,
    can_view_applications: true,
    can_interview_candidates: false,
    can_manage_team: true,
    can_access_analytics: true,
    can_manage_company_profile: false,
  },
  recruiter: {
    can_post_jobs: true,
    can_view_applications: true,
    can_interview_candidates: false,
    can_manage_team: false,
    can_access_analytics: false,
    can_manage_company_profile: false,
  },
  interviewer: {
    can_post_jobs: false,
    can_view_applications: true,
    can_interview_candidates: true,
    can_manage_team: false,
    can_access_analytics: false,
    can_manage_company_profile: false,
  },
  admin: {
    can_post_jobs: true,
    can_view_applications: true,
    can_interview_candidates: true,
    can_manage_team: true,
    can_access_analytics: true,
    can_manage_company_profile: true,
  },
}

export function TeamMemberModal({ isOpen, onClose, onSave, member, employerProfileId }: TeamMemberModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "recruiter" as TeamRole,
    phone: "",
    department: "",
    job_title: "",
    permissions: defaultPermissions.recruiter,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        role: member.role,
        phone: member.phone || "",
        department: member.department || "",
        job_title: member.job_title || "",
        permissions: member.permissions,
      })
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        role: "recruiter",
        phone: "",
        department: "",
        job_title: "",
        permissions: defaultPermissions.recruiter,
      })
    }
  }, [member, isOpen])

  const handleRoleChange = (role: TeamRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: defaultPermissions[role],
    }))
  }

  const handlePermissionChange = (permission: keyof TeamPermissions, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const memberData: Partial<TeamMember> = {
        ...formData,
        employer_profile_id: employerProfileId,
        is_active: true,
      }

      if (member) {
        memberData.id = member.id
      }

      await onSave(memberData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save team member")
    } finally {
      setLoading(false)
    }
  }

  const permissionIcons = {
    can_post_jobs: <UserPlus className="h-4 w-4" />,
    can_view_applications: <Eye className="h-4 w-4" />,
    can_interview_candidates: <Users className="h-4 w-4" />,
    can_manage_team: <Shield className="h-4 w-4" />,
    can_access_analytics: <BarChart3 className="h-4 w-4" />,
    can_manage_company_profile: <Settings className="h-4 w-4" />,
  }

  const permissionLabels = {
    can_post_jobs: "Post Jobs",
    can_view_applications: "View Applications",
    can_interview_candidates: "Interview Candidates",
    can_manage_team: "Manage Team",
    can_access_analytics: "Access Analytics",
    can_manage_company_profile: "Manage Company Profile",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {member ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
          <DialogDescription>
            {member ? "Update team member information and permissions" : "Invite a new team member to your company"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g., Human Resources, Engineering"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title (Optional)</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  placeholder="e.g., Senior Recruiter, HR Manager"
                />
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role & Permissions</CardTitle>
              <CardDescription>
                Select a role and customize permissions as needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recruiter" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Recruiter</SelectItem>
                    <SelectItem value="hr_manager" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">HR Manager</SelectItem>
                    <SelectItem value="interviewer" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Interviewer</SelectItem>
                    <SelectItem value="admin" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  {roleDescriptions[formData.role]}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={formData.permissions[key as keyof TeamPermissions]}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(key as keyof TeamPermissions, checked as boolean)
                        }
                      />
                      <Label htmlFor={key} className="flex items-center gap-2 text-sm">
                        {permissionIcons[key as keyof TeamPermissions]}
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : member ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
