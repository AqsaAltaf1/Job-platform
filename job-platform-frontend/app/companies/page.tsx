"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, MapPin, Users, Star, Search, Filter, ExternalLink, Heart } from "lucide-react"
import Link from "next/link"
import { companiesAPI } from "@/lib/api"

interface Company {
  id: string
  company_name: string
  description?: string
  website?: string
  industry?: string
  company_size?: string
  location: string
  city?: string
  state?: string
  country?: string
  active_jobs_count: number
  created_at: string
  updated_at: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [industries, setIndustries] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])

  // Load companies data on component mount
  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await companiesAPI.getCompanies()
      if (response.success) {
        setCompanies(response.companies)
        setAllCompanies(response.companies)
        setIndustries(["All Industries", ...(response.filters?.industries || [])])
        setSizes(["All Sizes", ...(response.filters?.company_sizes || [])])
      }
    } catch (error) {
      console.error('Failed to load companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    let filteredCompanies = allCompanies

    if (searchTerm) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedIndustry && selectedIndustry !== "All Industries") {
      filteredCompanies = filteredCompanies.filter(company =>
        company.industry === selectedIndustry
      )
    }

    if (selectedSize && selectedSize !== "All Sizes") {
      filteredCompanies = filteredCompanies.filter(company =>
        company.company_size === selectedSize
      )
    }

    setCompanies(filteredCompanies)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedIndustry("")
    setSelectedSize("")
    setCompanies(allCompanies)
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
              Explore <span className="text-primary">Companies</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Discover amazing companies and learn about their culture, benefits, and opportunities
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-full border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90">
                Search Companies
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="rounded-full border-gray-200 focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="rounded-full border-gray-200 focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder="Company Size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters} className="h-10 rounded-full border-gray-200 hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-16 bg-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center animate-fade-in-up">Featured Companies</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {loading ? (
                <div className="col-span-2 text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading featured companies...</p>
                </div>
              ) : companies.length > 0 ? (
                companies.slice(0, 2).map((company, index) => (
                <Card key={company.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.2}s`}}>
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                          <Building2 className="h-8 w-8 text-primary group-hover:text-primary transition-colors duration-300" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 group-hover:scale-105 transition-transform duration-300">{company.company_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                            <MapPin className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
                            {company.location}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:scale-110 transition-transform duration-300">
                        <Heart className="h-4 w-4 group-hover:text-red-500 transition-colors duration-300" />
                      </Button>
                    </div>
                    <p className="text-gray-600 mb-6 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
                      {company.description}
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
                            {company.company_size || 'Size not specified'} employees
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            4.8
                          </div>
                        </div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" asChild className="rounded-full border-gray-200 hover:bg-gray-50 group-hover:scale-105 transition-transform duration-300">
                          <Link href={`/companies/${company.id}`}>View Profile</Link>
                        </Button>
                        <Button size="sm" asChild className="rounded-full bg-primary hover:bg-primary/90 group-hover:scale-105 transition-transform duration-300">
                          <Link href={`/companies/${company.id}/jobs`}>View Jobs ({company.active_jobs_count})</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No companies available</h3>
                  <p className="text-muted-foreground">
                    Check back later for featured companies.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* All Companies */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900 animate-fade-in-up">
                {companies.length} Compan{companies.length !== 1 ? 'ies' : 'y'} Found
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select defaultValue="name">
                  <SelectTrigger className="w-40 rounded-full border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Company Size</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="jobs">Open Jobs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Company Listings */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading companies...</p>
                </div>
              ) : companies.length > 0 ? (
                companies.map((company, index) => (
                <Card key={company.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                          <Building2 className="h-8 w-8 text-primary group-hover:text-primary transition-colors duration-300" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 group-hover:scale-105 transition-transform duration-300">{company.company_name}</h3>
                          <div className="flex items-center gap-6 text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
                              {company.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
                              {company.company_size || 'Size not specified'} employees
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              4.8
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-primary text-primary bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300">{company.industry}</Badge>
                        <Button variant="outline" size="sm" asChild className="rounded-full border-gray-200 hover:bg-gray-50 group-hover:scale-105 transition-transform duration-300">
                          <Link href={`/companies/${company.id}`}>
                            View Profile
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" asChild className="rounded-full bg-primary hover:bg-primary/90 group-hover:scale-105 transition-transform duration-300">
                          <Link href={`/companies/${company.id}/jobs`}>
                            View Jobs ({company.active_jobs_count})
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No companies found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or browse all available companies.
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {companies.length > 0 && (
              <div className="flex justify-center mt-16">
                <div className="flex items-center space-x-3">
                  <Button variant="outline" disabled className="rounded-full border-gray-200 hover:bg-gray-50">Previous</Button>
                  <Button variant="outline" className="rounded-full border-gray-200 hover:bg-gray-50">1</Button>
                  <Button variant="outline" className="rounded-full border-gray-200 hover:bg-gray-50">2</Button>
                  <Button variant="outline" className="rounded-full border-gray-200 hover:bg-gray-50">3</Button>
                  <Button variant="outline" className="rounded-full border-gray-200 hover:bg-gray-50">Next</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
