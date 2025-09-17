"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Filter, MapPin, Briefcase, DollarSign } from "lucide-react"

export interface JobFilters {
  search: string
  location: string
  jobTypes: string[]
  experienceLevels: string[]
  salaryRange: [number, number]
  companies: string[]
  remote: boolean
}

interface JobFiltersProps {
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
  availableCompanies: string[]
  jobCount: number
}

export function JobFilters({ filters, onFiltersChange, availableCompanies, jobCount }: JobFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof JobFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleJobType = (jobType: string) => {
    const newJobTypes = filters.jobTypes.includes(jobType)
      ? filters.jobTypes.filter((type) => type !== jobType)
      : [...filters.jobTypes, jobType]
    updateFilter("jobTypes", newJobTypes)
  }

  const toggleExperienceLevel = (level: string) => {
    const newLevels = filters.experienceLevels.includes(level)
      ? filters.experienceLevels.filter((l) => l !== level)
      : [...filters.experienceLevels, level]
    updateFilter("experienceLevels", newLevels)
  }

  const toggleCompany = (company: string) => {
    const newCompanies = filters.companies.includes(company)
      ? filters.companies.filter((c) => c !== company)
      : [...filters.companies, company]
    updateFilter("companies", newCompanies)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      location: "",
      jobTypes: [],
      experienceLevels: [],
      salaryRange: [0, 200000],
      companies: [],
      remote: false,
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.location) count++
    if (filters.jobTypes.length > 0) count++
    if (filters.experienceLevels.length > 0) count++
    if (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 200000) count++
    if (filters.companies.length > 0) count++
    if (filters.remote) count++
    return count
  }

  const formatSalary = (value: number) => {
    return value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFiltersCount() > 0 && <Badge variant="secondary">{getActiveFiltersCount()}</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{jobCount} jobs</span>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="md:hidden">
              {isExpanded ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`space-y-6 ${isExpanded ? "block" : "hidden md:block"}`}>
        {/* Search */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Title or Keywords
          </Label>
          <Input
            placeholder="e.g. Frontend Developer, React, JavaScript"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            placeholder="e.g. San Francisco, CA"
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={filters.remote}
              onCheckedChange={(checked) => updateFilter("remote", checked)}
            />
            <Label htmlFor="remote" className="text-sm">
              Remote jobs only
            </Label>
          </div>
        </div>

        {/* Job Type */}
        <div className="space-y-3">
          <Label>Job Type</Label>
          <div className="space-y-2">
            {["full-time", "part-time", "contract", "internship"].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={filters.jobTypes.includes(type)}
                  onCheckedChange={() => toggleJobType(type)}
                />
                <Label htmlFor={type} className="text-sm capitalize">
                  {type.replace("-", " ")}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label>Experience Level</Label>
          <div className="space-y-2">
            {["entry", "mid", "senior", "executive"].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={filters.experienceLevels.includes(level)}
                  onCheckedChange={() => toggleExperienceLevel(level)}
                />
                <Label htmlFor={level} className="text-sm capitalize">
                  {level} Level
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Salary Range
          </Label>
          <div className="px-2">
            <Slider
              value={filters.salaryRange}
              onValueChange={(value) => updateFilter("salaryRange", value as [number, number])}
              max={200000}
              min={0}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatSalary(filters.salaryRange[0])}</span>
              <span>{formatSalary(filters.salaryRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Companies */}
        {availableCompanies.length > 0 && (
          <div className="space-y-3">
            <Label>Companies</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableCompanies.map((company) => (
                <div key={company} className="flex items-center space-x-2">
                  <Checkbox
                    id={company}
                    checked={filters.companies.includes(company)}
                    onCheckedChange={() => toggleCompany(company)}
                  />
                  <Label htmlFor={company} className="text-sm">
                    {company}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label>Active Filters</Label>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.search}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("search", "")} />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {filters.location}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("location", "")} />
                </Badge>
              )}
              {filters.remote && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Remote Only
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("remote", false)} />
                </Badge>
              )}
              {filters.jobTypes.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type.replace("-", " ")}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleJobType(type)} />
                </Badge>
              ))}
              {filters.experienceLevels.map((level) => (
                <Badge key={level} variant="secondary" className="flex items-center gap-1">
                  {level} Level
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleExperienceLevel(level)} />
                </Badge>
              ))}
              {filters.companies.map((company) => (
                <Badge key={company} variant="secondary" className="flex items-center gap-1">
                  {company}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCompany(company)} />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
