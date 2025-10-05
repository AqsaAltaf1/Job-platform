"use client"

import { useState, useEffect } from "react"
import { JobCard } from "./job-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import { jobsApi } from "@/lib/jobs"
import type { JobWithCompany } from "@/lib/types"

interface JobsListProps {
  showCreateButton?: boolean
  showFilters?: boolean
  companyId?: string
  postedBy?: string
  onCreateJob?: () => void
  onEditJob?: (job: JobWithCompany) => void
  onDeleteJob?: (job: JobWithCompany) => void
  onApplyToJob?: (job: JobWithCompany) => void
}

export function JobsList({
  showCreateButton = false,
  showFilters = true,
  companyId,
  postedBy,
  onCreateJob,
  onEditJob,
  onDeleteJob,
  onApplyToJob,
}: JobsListProps) {
  const [jobs, setJobs] = useState<JobWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadJobs()
  }, [companyId, postedBy])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (companyId) filters.company_id = companyId
      if (postedBy) filters.posted_by = postedBy

      const jobsData = await jobsApi.getJobs(filters)
      setJobs(jobsData)
    } catch (error) {
      console.error("Failed to load jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.employerProfile?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || job.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with search and create button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          {showFilters && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {showFilters && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          )}

          {showCreateButton && onCreateJob && (
            <Button onClick={onCreateJob}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          )}
        </div>
      </div>

      {/* Jobs list */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" ? "No jobs match your filters." : "No jobs found."}
              </p>
              {showCreateButton && onCreateJob && (
                <Button onClick={onCreateJob} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              showActions={!!(onEditJob || onDeleteJob || onApplyToJob)}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
              onApply={onApplyToJob}
            />
          ))
        )}
      </div>
    </div>
  )
}
