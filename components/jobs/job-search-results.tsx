"use client"

import { useState } from "react"
import { JobCard } from "./job-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpDown, Grid, List } from "lucide-react"
import type { JobWithCompany } from "@/lib/types"

interface JobSearchResultsProps {
  jobs: JobWithCompany[]
  loading: boolean
  onApplyToJob?: (job: JobWithCompany) => void
}

type SortOption = "newest" | "oldest" | "salary-high" | "salary-low" | "title-az" | "title-za"
type ViewMode = "grid" | "list"

export function JobSearchResults({ jobs, loading, onApplyToJob }: JobSearchResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const sortJobs = (jobs: JobWithCompany[], sortOption: SortOption): JobWithCompany[] => {
    const sortedJobs = [...jobs]

    switch (sortOption) {
      case "newest":
        return sortedJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return sortedJobs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "salary-high":
        return sortedJobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0))
      case "salary-low":
        return sortedJobs.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0))
      case "title-az":
        return sortedJobs.sort((a, b) => a.title.localeCompare(b.title))
      case "title-za":
        return sortedJobs.sort((a, b) => b.title.localeCompare(a.title))
      default:
        return sortedJobs
    }
  }

  const sortedJobs = sortJobs(jobs, sortBy)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
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
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"} Found
          </h2>
          <p className="text-sm text-muted-foreground">Showing all available positions matching your criteria</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="salary-high">Highest Salary</SelectItem>
              <SelectItem value="salary-low">Lowest Salary</SelectItem>
              <SelectItem value="title-az">Title A-Z</SelectItem>
              <SelectItem value="title-za">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {sortedJobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms to find more opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2" : "space-y-4"}>
          {sortedJobs.map((job) => (
            <JobCard key={job.id} job={job} showActions={!!onApplyToJob} onApply={onApplyToJob} />
          ))}
        </div>
      )}

      {/* Load More (for pagination in real app) */}
      {sortedJobs.length > 0 && sortedJobs.length >= 20 && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            Load More Jobs
          </Button>
        </div>
      )}
    </div>
  )
}
