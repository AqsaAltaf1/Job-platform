"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { jobsApi } from "@/lib/jobs"
import type { JobWithCompany } from "@/lib/types"
import Link from "next/link"
import { Plus, Settings, Briefcase, User } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentJobs, setRecentJobs] = useState<JobWithCompany[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      let jobs: JobWithCompany[] = []

      if (user.role === "employer") {
        // Load jobs posted by this employer
        jobs = await jobsApi.getJobs({ posted_by: user.id })
      } else if (user.role === "candidate") {
        // Load recent published jobs for candidates
        jobs = await jobsApi.getJobs({ status: "published" })
        jobs = jobs.slice(0, 5) // Show only 5 recent jobs
      } else if (user.role === "admin") {
        // Load all jobs for admin
        jobs = await jobsApi.getJobs()
        jobs = jobs.slice(0, 10) // Show 10 most recent
      }

      setRecentJobs(jobs)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMockStats = () => {
    // Mock statistics based on user role
    switch (user?.role) {
      case "admin":
        return {
          totalJobs: 156,
          totalApplications: 1247,
          totalViews: 8934,
          totalHired: 89,
        }
      case "employer":
        return {
          activeJobs: recentJobs.filter((j) => j.status === "published").length,
          totalApplications: 23,
          totalViews: 456,
          totalHired: 5,
        }
      case "candidate":
        return {
          totalApplications: 8,
          pendingApplications: 3,
          totalViews: 12,
          totalHired: 2,
        }
      default:
        return {}
    }
  }

  const getDashboardTitle = () => {
    switch (user?.role) {
      case "admin":
        return "Admin Dashboard"
      case "employer":
        return "Employer Dashboard"
      case "candidate":
        return "Candidate Dashboard"
      default:
        return "Dashboard"
    }
  }

  const getWelcomeMessage = () => {
    const name = user ? `${user.first_name} ${user.last_name}` : "User"
    switch (user?.role) {
      case "admin":
        return `Welcome back, ${name}. Here's your platform overview.`
      case "employer":
        return `Welcome back, ${name}. Manage your job postings and applications.`
      case "candidate":
        return `Welcome back, ${name}. Find your next opportunity.`
      default:
        return `Welcome back, ${name}.`
    }
  }

  const getQuickActions = () => {
    switch (user?.role) {
      case "employer":
        return [
          {
            title: "Post New Job",
            description: "Create a new job posting",
            href: "/jobs/manage",
            icon: Plus,
          },
          {
            title: "Manage Jobs",
            description: "Edit existing job postings",
            href: "/jobs/manage",
            icon: Briefcase,
          },
        ]
      case "candidate":
        return [
          {
            title: "Browse Jobs",
            description: "Find new opportunities",
            href: "/jobs",
            icon: Briefcase,
          },
          {
            title: "Update Profile",
            description: "Keep your profile current",
            href: "/profile",
            icon: User,
          },
        ]
      case "admin":
        return [
          {
            title: "Manage Users",
            description: "User administration",
            href: "/admin/users",
            icon: User,
          },
          {
            title: "Platform Settings",
            description: "System configuration",
            href: "/admin/settings",
            icon: Settings,
          },
        ]
      default:
        return []
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/30">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{getDashboardTitle()}</h1>
            <p className="text-muted-foreground">{getWelcomeMessage()}</p>
          </div>

          {/* Stats */}
          {user && (
            <div className="mb-8">
              <DashboardStats stats={getMockStats()} userRole={user.role} />
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-3">
            {/* Quick Actions */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getQuickActions().map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-4 bg-transparent"
                      asChild
                    >
                      <Link href={action.href}>
                        <div className="flex items-center space-x-3">
                          <action.icon className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-sm text-muted-foreground">{action.description}</div>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  ))}

                  <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent" asChild>
                    <Link href="/profile">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Profile Settings</div>
                          <div className="text-sm text-muted-foreground">Update your information</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user?.role === "employer"
                      ? "Your Job Postings"
                      : user?.role === "candidate"
                        ? "Recent Job Opportunities"
                        : "Recent Jobs"}
                  </CardTitle>
                  <CardDescription>
                    {user?.role === "employer"
                      ? "Manage your active job postings"
                      : user?.role === "candidate"
                        ? "Latest opportunities that match your profile"
                        : "Most recent job postings on the platform"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : recentJobs.length > 0 ? (
                    <div className="space-y-4">
                      {recentJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company.name}</p>
                            <p className="text-xs text-muted-foreground">{job.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium capitalize">{job.status}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(job.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4">
                        <Button variant="outline" asChild>
                          <Link href={user?.role === "employer" ? "/jobs/manage" : "/jobs"}>
                            View All {user?.role === "employer" ? "Your Jobs" : "Jobs"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {user?.role === "employer" ? "No job postings yet." : "No recent jobs found."}
                      </p>
                      {user?.role === "employer" && (
                        <Button className="mt-4" asChild>
                          <Link href="/jobs/manage">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Job
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
