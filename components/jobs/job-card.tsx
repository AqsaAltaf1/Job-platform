"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, DollarSign, Building2 } from "lucide-react"
import type { JobWithCompany } from "@/lib/types"
import Link from "next/link"

interface JobCardProps {
  job: JobWithCompany
  showActions?: boolean
  onEdit?: (job: JobWithCompany) => void
  onDelete?: (job: JobWithCompany) => void
  onApply?: (job: JobWithCompany) => void
}

export function JobCard({ job, showActions = false, onEdit, onDelete, onApply }: JobCardProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified"
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default"
      case "draft":
        return "secondary"
      case "closed":
        return "destructive"
      default:
        return "default"
    }
  }

  const formatJobType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatExperienceLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1) + " Level"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">
              <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                {job.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {job.company.name}
            </CardDescription>
          </div>
          <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{formatJobType(job.job_type)}</Badge>
          <Badge variant="outline">{formatExperienceLevel(job.experience_level)}</Badge>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Posted {new Date(job.created_at).toLocaleDateString()}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

        {showActions && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(job)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="outline" onClick={() => onDelete(job)}>
                Delete
              </Button>
            )}
            {onApply && job.status === "published" && (
              <Button size="sm" onClick={() => onApply(job)}>
                Apply Now
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
