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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [industries, setIndustries] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCompanies, setTotalCompanies] = useState(0)

  // Load companies data on component mount and when page changes
  useEffect(() => {
    loadCompanies()
  }, [currentPage])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      console.log('Loading companies...')
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', '15')
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedIndustry && selectedIndustry !== "All Industries") {
        params.append('industry', selectedIndustry)
      }
      if (selectedSize && selectedSize !== "All Sizes") {
        params.append('company_size', selectedSize)
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies?${params}`)
      const data = await response.json()
      console.log('Companies API response:', data)
      
      if (data.success) {
        console.log('Companies data:', data.companies)
        setCompanies(data.companies)
        setTotalPages(data.pagination?.total_pages || 1)
        setTotalCompanies(data.pagination?.total_companies || data.companies.length)
        setIndustries(["All Industries", ...(data.filters?.industries || [])])
        setSizes(["All Sizes", ...(data.filters?.company_sizes || [])])
      } else {
        console.error('Companies API returned success: false', data)
      }
    } catch (error) {
      console.error('Failed to load companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
    loadCompanies()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedIndustry("")
    setSelectedSize("")
    setCurrentPage(1)
    loadCompanies()
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
                    <SelectItem key={industry} value={industry} className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">
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
                    <SelectItem key={size} value={size} className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">
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


      {/* All Companies */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900 animate-fade-in-up">
                {totalCompanies} Compan{totalCompanies !== 1 ? 'ies' : 'y'} Found
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select defaultValue="name">
                  <SelectTrigger className="w-40 rounded-full border-gray-200 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Name</SelectItem>
                    <SelectItem value="size" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Company Size</SelectItem>
                    <SelectItem value="rating" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Rating</SelectItem>
                    <SelectItem value="jobs" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Open Jobs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Company Listings */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {companies.map((company, index) => (
                  <Card key={company.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                    <CardContent className="p-6">
                      {/* Company Logo/Initials */}
                      <div className="flex items-center mb-4 group-hover:scale-105 transition-transform duration-300">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mr-3">
                          {company.company_logo_url ? (
                            <img src={company.company_logo_url} alt={company.company_name} className="w-8 h-8 object-contain rounded" />
                          ) : (
                            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              {company.company_name ? company.company_name.substring(0, 2).toUpperCase() : 'CO'}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">{company.industry || 'General'}</span>
                      </div>
                      
                      {/* Company Name */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 group-hover:scale-105 transition-transform duration-300">
                        <Link href={`/companies/${company.id}`} className="hover:text-primary transition-colors">
                          {company.company_name}
                        </Link>
                      </h3>
                      
                      {/* Location & Size */}
                      <div className="flex items-center text-gray-500 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                        <MapPin className="h-4 w-4 mr-1 group-hover:text-primary transition-colors duration-300" />
                        <span className="text-sm mr-4">{company.location || 'Remote'}</span>
                        <Users className="h-4 w-4 mr-1 group-hover:text-primary transition-colors duration-300" />
                        <span className="text-sm">{company.company_size || 'Size not specified'}</span>
                      </div>

                      {/* Description */}
                      {company.description && (
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
                          {company.description}
                        </p>
                      )}

                      {/* Bottom Section */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="group-hover:scale-105 transition-transform duration-300">
                          <div className="text-xs text-gray-400 mb-1">
                            {new Date(company.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                            {company.active_jobs_count} active jobs
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                          asChild
                        >
                          <Link href={`/companies/${company.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/companies/${company.id}/jobs`}>
                            View Jobs ({company.active_jobs_count})
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {companies.length === 0 && !loading && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No companies found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse all available companies.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-16">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-full border-gray-200 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="rounded-full border-gray-200 hover:bg-gray-50"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-full border-gray-200 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
