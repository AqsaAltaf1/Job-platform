"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, DollarSign, Building2, Search, Filter, Star, TrendingUp, Code, Settings, Users, Briefcase, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getJobsWithCompany } from "@/lib/mock-data"

export default function JobsPage() {
  const allJobs = getJobsWithCompany()
  const [jobs, setJobs] = useState(allJobs)
  const [filterTerm, setFilterTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [postedAt, setPostedAt] = useState("")
  const [location, setLocation] = useState("")
  const [radius, setRadius] = useState("")
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [sortBy, setSortBy] = useState("")

  const categories = ["All categories", "Technology", "Marketing & Advertising", "Finance", "Healthcare", "Education", "Design", "Sales", "Operations"]
  const jobTypes = ["All job types", "Full-time", "Part-time", "Contract", "Internship", "Remote"]
  const postedAtOptions = ["Any time", "Today", "Last 3 days", "Last week", "Last 2 weeks", "Last month"]
  const radiusOptions = ["within 5 km", "within 10 km", "within 25 km", "within 50 km", "within 100 km"]
  const sortOptions = ["Relevance", "Date Posted", "Salary", "Company", "Location"]

  const handleSearch = () => {
    let filteredJobs = allJobs

    if (filterTerm) {
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
        job.company.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(filterTerm.toLowerCase())
      )
    }

    if (selectedCategory && selectedCategory !== "All categories") {
      filteredJobs = filteredJobs.filter(job =>
        job.company.industry?.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    }

    if (selectedType && selectedType !== "All job types") {
      filteredJobs = filteredJobs.filter(job =>
        job.job_type === selectedType.toLowerCase().replace("-", "")
      )
    }

    if (location) {
      filteredJobs = filteredJobs.filter(job =>
        job.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    if (remoteOnly) {
      filteredJobs = filteredJobs.filter(job =>
        job.location.toLowerCase().includes("remote")
      )
    }

    setJobs(filteredJobs)
  }

  const clearFilters = () => {
    setFilterTerm("")
    setSelectedCategory("")
    setSelectedType("")
    setPostedAt("")
    setLocation("")
    setRadius("")
    setRemoteOnly(false)
    setSortBy("")
    setJobs(allJobs)
  }

  return (
    <div className="bg-background relative overflow-hidden">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100/50 py-20 lg:py-24 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-blue-100/30 pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight animate-fade-in-up mb-6">
              Find Your <span className="text-primary">Dream Job</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Discover amazing opportunities from top companies across Australia
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search jobs, companies, or keywords..."
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-full border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90">
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
                  
                  {/* Filter (Search Input) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
                    <Input
                      placeholder="Skill, company, tag ..."
                      value={filterTerm}
                      onChange={(e) => setFilterTerm(e.target.value)}
                      className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20">
                        <SelectValue placeholder="All job types" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Posted At */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Posted At</label>
                    <Select value={postedAt} onValueChange={setPostedAt}>
                      <SelectTrigger className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20">
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        {postedAtOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <Input
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  {/* Radius */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Radius</label>
                    <Select value={radius} onValueChange={setRadius}>
                      <SelectTrigger className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20">
                        <SelectValue placeholder="within 25 km" />
                      </SelectTrigger>
                      <SelectContent>
                        {radiusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Only remote jobs */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="remote"
                        checked={remoteOnly}
                        onCheckedChange={(checked) => setRemoteOnly(checked === true)}
                      />
                      <label htmlFor="remote" className="text-sm font-medium text-gray-700">
                        Only remote jobs
                      </label>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary/20">
                        <SelectValue placeholder="Relevance" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                  <Button onClick={handleSearch} className="w-full rounded-lg bg-gray-800 hover:bg-gray-900 text-white">
                    Search
                  </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Showing {jobs.length} jobs
                  </h2>
                </div>

                {/* Job Listings */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {jobs.map((job, index) => {
                    const categoryIcons = [TrendingUp, Code, Building2, Settings, Users, Briefcase, Search, CheckCircle]
                    const CategoryIcon = categoryIcons[index % categoryIcons.length]
                    const categoryNames = ["Finance", "Software Engineering", "Human Resources", "Business Development", "Marketing", "Sales", "Design", "Operations"]
                    const categoryName = categoryNames[index % categoryNames.length]
                    
                    return (
                      <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                        <CardContent className="p-6">
                          {/* Category */}
                          <div className="flex items-center mb-4 group-hover:scale-105 transition-transform duration-300">
                            <CategoryIcon className="h-4 w-4 text-gray-400 mr-2 group-hover:text-primary transition-colors duration-300" />
                            <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">{categoryName}</span>
                          </div>
                          
                          {/* Job Title */}
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 group-hover:scale-105 transition-transform duration-300">
                            <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                              {job.title}
                            </Link>
                          </h3>
                          
                          {/* Location & Type */}
                          <div className="flex items-center text-gray-500 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                            <MapPin className="h-4 w-4 mr-1 group-hover:text-primary transition-colors duration-300" />
                            <span className="text-sm mr-4">{job.location}</span>
                            <span className="text-sm">{job.job_type.replace('-', ' ')}</span>
                          </div>

                          {/* Bottom Section */}
                          <div className="flex items-center justify-between">
                            <div className="group-hover:scale-105 transition-transform duration-300">
                              <div className="text-xs text-gray-400 mb-1">
                                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">by {job.company.name}</div>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                              <Building2 className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors duration-300" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                {jobs.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or browse all available jobs.
                    </p>
                    <Button onClick={clearFilters} className="rounded-lg">Clear Filters</Button>
                  </div>
                )}

                {/* Pagination */}
                {jobs.length > 0 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" disabled className="rounded-lg border-gray-200 hover:bg-gray-50">Previous</Button>
                      <Button variant="outline" className="rounded-lg border-gray-200 hover:bg-gray-50">1</Button>
                      <Button variant="outline" className="rounded-lg border-gray-200 hover:bg-gray-50">2</Button>
                      <Button variant="outline" className="rounded-lg border-gray-200 hover:bg-gray-50">3</Button>
                      <Button variant="outline" className="rounded-lg border-gray-200 hover:bg-gray-50">Next</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}