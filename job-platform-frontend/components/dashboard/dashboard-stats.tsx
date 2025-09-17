"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Eye, CheckCircle } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalJobs?: number
    totalApplications?: number
    totalViews?: number
    totalHired?: number
    activeJobs?: number
    pendingApplications?: number
  }
  userRole: "admin" | "employer" | "candidate"
}

export function DashboardStats({ stats, userRole }: DashboardStatsProps) {
  const getStatsForRole = () => {
    switch (userRole) {
      case "admin":
        return [
          {
            title: "Total Jobs",
            value: stats.totalJobs || 0,
            description: "Active job postings",
            icon: Briefcase,
          },
          {
            title: "Total Users",
            value: stats.totalApplications || 0,
            description: "Registered users",
            icon: Users,
          },
          {
            title: "Applications",
            value: stats.totalViews || 0,
            description: "Total applications",
            icon: Eye,
          },
          {
            title: "Placements",
            value: stats.totalHired || 0,
            description: "Successful hires",
            icon: CheckCircle,
          },
        ]

      case "employer":
        return [
          {
            title: "Active Jobs",
            value: stats.activeJobs || 0,
            description: "Currently published",
            icon: Briefcase,
          },
          {
            title: "Applications",
            value: stats.totalApplications || 0,
            description: "Total received",
            icon: Users,
          },
          {
            title: "Profile Views",
            value: stats.totalViews || 0,
            description: "Job post views",
            icon: Eye,
          },
          {
            title: "Hired",
            value: stats.totalHired || 0,
            description: "Successful placements",
            icon: CheckCircle,
          },
        ]

      case "candidate":
        return [
          {
            title: "Applications",
            value: stats.totalApplications || 0,
            description: "Jobs applied to",
            icon: Briefcase,
          },
          {
            title: "Pending",
            value: stats.pendingApplications || 0,
            description: "Awaiting response",
            icon: Users,
          },
          {
            title: "Profile Views",
            value: stats.totalViews || 0,
            description: "Employer views",
            icon: Eye,
          },
          {
            title: "Interviews",
            value: stats.totalHired || 0,
            description: "Interview requests",
            icon: CheckCircle,
          },
        ]

      default:
        return []
    }
  }

  const statsData = getStatsForRole()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
