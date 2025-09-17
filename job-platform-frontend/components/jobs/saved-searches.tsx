"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bookmark, Bell, Trash2, Plus } from "lucide-react"
import type { JobFilters } from "./job-filters"

interface SavedSearch {
  id: string
  name: string
  filters: JobFilters
  alertsEnabled: boolean
  createdAt: Date
  jobCount: number
}

interface SavedSearchesProps {
  currentFilters: JobFilters
  currentJobCount: number
}

export function SavedSearches({ currentFilters, currentJobCount }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: "1",
      name: "Frontend Developer - Remote",
      filters: {
        search: "Frontend Developer",
        location: "",
        jobTypes: ["full-time"],
        experienceLevels: ["mid", "senior"],
        salaryRange: [80000, 150000],
        companies: [],
        remote: true,
      },
      alertsEnabled: true,
      createdAt: new Date("2024-03-01"),
      jobCount: 23,
    },
    {
      id: "2",
      name: "React Jobs in SF",
      filters: {
        search: "React",
        location: "San Francisco",
        jobTypes: ["full-time", "contract"],
        experienceLevels: ["mid", "senior"],
        salaryRange: [100000, 180000],
        companies: [],
        remote: false,
      },
      alertsEnabled: false,
      createdAt: new Date("2024-02-15"),
      jobCount: 12,
    },
  ])

  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [enableAlerts, setEnableAlerts] = useState(true)

  const saveCurrentSearch = () => {
    if (!searchName.trim()) return

    const newSearch: SavedSearch = {
      id: Math.random().toString(36).substr(2, 9),
      name: searchName.trim(),
      filters: currentFilters,
      alertsEnabled: enableAlerts,
      createdAt: new Date(),
      jobCount: currentJobCount,
    }

    setSavedSearches((prev) => [newSearch, ...prev])
    setSearchName("")
    setShowSaveDialog(false)
  }

  const deleteSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((search) => search.id !== id))
  }

  const toggleAlerts = (id: string) => {
    setSavedSearches((prev) =>
      prev.map((search) => (search.id === id ? { ...search, alertsEnabled: !search.alertsEnabled } : search)),
    )
  }

  const getFilterSummary = (filters: JobFilters) => {
    const parts = []
    if (filters.search) parts.push(`"${filters.search}"`)
    if (filters.location) parts.push(filters.location)
    if (filters.remote) parts.push("Remote")
    if (filters.jobTypes.length > 0) parts.push(filters.jobTypes.join(", "))
    if (filters.experienceLevels.length > 0) parts.push(filters.experienceLevels.join(", "))
    return parts.join(" • ")
  }

  const hasActiveFilters = () => {
    return (
      currentFilters.search ||
      currentFilters.location ||
      currentFilters.jobTypes.length > 0 ||
      currentFilters.experienceLevels.length > 0 ||
      currentFilters.salaryRange[0] > 0 ||
      currentFilters.salaryRange[1] < 200000 ||
      currentFilters.companies.length > 0 ||
      currentFilters.remote
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Saved Searches
            </CardTitle>
            <CardDescription>Save your search criteria and get notified of new jobs</CardDescription>
          </div>

          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!hasActiveFilters()}>
                <Plus className="h-4 w-4 mr-2" />
                Save Search
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Current Search</DialogTitle>
                <DialogDescription>
                  Save your current search filters to quickly access them later and get email alerts for new matching
                  jobs.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Search Name</label>
                  <Input
                    placeholder="e.g., Frontend Developer - Remote"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Filters</label>
                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                    {getFilterSummary(currentFilters) || "No filters applied"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentJobCount} jobs currently match these criteria
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableAlerts"
                    checked={enableAlerts}
                    onChange={(e) => setEnableAlerts(e.target.checked)}
                  />
                  <label htmlFor="enableAlerts" className="text-sm">
                    Email me when new jobs match this search
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={saveCurrentSearch} disabled={!searchName.trim()}>
                    Save Search
                  </Button>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {savedSearches.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No saved searches yet</p>
            <p className="text-sm text-muted-foreground">Apply some filters and save your search to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSearches.map((search) => (
              <div key={search.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{search.name}</h3>
                    <p className="text-sm text-muted-foreground">{getFilterSummary(search.filters)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAlerts(search.id)}
                      className={search.alertsEnabled ? "text-primary" : "text-muted-foreground"}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavedSearch(search.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{search.jobCount} jobs</Badge>
                    {search.alertsEnabled && (
                      <Badge variant="outline" className="text-primary border-primary">
                        <Bell className="h-3 w-3 mr-1" />
                        Alerts On
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Saved {search.createdAt.toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasActiveFilters() && (
          <Alert className="mt-4">
            <AlertDescription>Apply some search filters above to save your search and get job alerts.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
