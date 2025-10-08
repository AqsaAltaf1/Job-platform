'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Briefcase, GraduationCap, Star, Search, Filter, Users } from 'lucide-react'
import Link from 'next/link'

interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  location?: string
  availability?: string
  bio?: string
  profile_picture_url?: string
  experience_years?: number
  salary_expectation?: number
  skills?: string[]
  created_at: string
  candidateProfile?: {
    id: string
    bio?: string
    location?: string
    availability?: string
    experience_years?: number
    salary_expectation?: number
    skills?: string[]
  }
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedExperience, setSelectedExperience] = useState("")
  const [selectedAvailability, setSelectedAvailability] = useState("")
  const [locations, setLocations] = useState<string[]>([])
  const [availabilities, setAvailabilities] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCandidates, setTotalCandidates] = useState(0)

  // Load candidates data on component mount and when page changes
  useEffect(() => {
    loadCandidates()
  }, [currentPage])

  const loadCandidates = async () => {
    try {
      setLoading(true)
      console.log('Loading candidates...')
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', '15')
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedLocation && selectedLocation !== "All Locations") {
        params.append('location', selectedLocation)
      }
      if (selectedExperience && selectedExperience !== "All Experience") {
        params.append('experience', selectedExperience)
      }
      if (selectedAvailability && selectedAvailability !== "All Availability") {
        params.append('availability', selectedAvailability)
      }
      
      const token = localStorage.getItem('jwt_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/candidates?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      console.log('Candidates API response:', data)
      
      if (data.success) {
        console.log('Candidates data:', data.candidates)
        console.log('First candidate details:', data.candidates[0])
        setCandidates(data.candidates)
        setTotalPages(data.pagination?.total_pages || 1)
        setTotalCandidates(data.pagination?.total_candidates || data.candidates.length)
        setLocations(["All Locations", ...(data.filters?.locations || [])])
        setAvailabilities(["All Availability", ...(data.filters?.availabilities || [])])
      } else {
        console.error('Candidates API returned success: false', data)
        console.error('Response status:', response.status)
        console.error('Response headers:', response.headers)
      }
    } catch (error) {
      console.error('Failed to load candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
    loadCandidates()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedLocation("")
    setSelectedExperience("")
    setSelectedAvailability("")
    setCurrentPage(1)
    loadCandidates()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Top Candidates</h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover talented professionals ready to join your team
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedExperience} onValueChange={setSelectedExperience}>
              <SelectTrigger>
                <SelectValue placeholder="All Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Experience">All Experience</SelectItem>
                <SelectItem value="0-1">0-1 years</SelectItem>
                <SelectItem value="2-3">2-3 years</SelectItem>
                <SelectItem value="4-5">4-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="All Availability" />
              </SelectTrigger>
              <SelectContent>
                {availabilities.map((availability) => (
                  <SelectItem key={availability} value={availability}>
                    {availability}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {totalCandidates} Candidate{totalCandidates !== 1 ? 's' : ''} Found
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select defaultValue="recent">
              <SelectTrigger className="w-40 rounded-full border-gray-200 focus:border-primary focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Candidates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {candidates.map((candidate, index) => (
              <Card key={candidate.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                <CardContent className="p-6">
                  {/* Candidate Avatar/Photo */}
                  <div className="flex items-center mb-4 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mr-3">
                      {candidate.profile_picture_url ? (
                        <img src={candidate.profile_picture_url} alt={`${candidate.first_name} ${candidate.last_name}`} className="w-8 h-8 object-contain rounded" />
                      ) : (
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {getInitials(candidate.first_name, candidate.last_name)}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                      {candidate.experience_years || 0} years exp
                    </span>
                  </div>
                  
                  {/* Candidate Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 group-hover:scale-105 transition-transform duration-300">
                    <Link href={`/candidates/${candidate.id}`} className="hover:text-primary transition-colors">
                      {candidate.first_name} {candidate.last_name}
                    </Link>
                  </h3>
                  
                  {/* Location & Availability */}
                  <div className="flex items-center text-gray-500 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                    <MapPin className="h-4 w-4 mr-1 group-hover:text-primary transition-colors duration-300" />
                    <span className="text-sm mr-4">{candidate.location || 'Location not specified'}</span>
                    <Briefcase className="h-4 w-4 mr-1 group-hover:text-primary transition-colors duration-300" />
                    <span className="text-sm">{candidate.availability || 'Not specified'}</span>
                  </div>

                  {/* Bio */}
                  {candidate.bio && (
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
                      {candidate.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {candidate.skills.slice(0, 3).map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{candidate.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Bottom Section */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="group-hover:scale-105 transition-transform duration-300">
                      <div className="text-xs text-gray-400 mb-1">
                        Joined {formatDate(candidate.created_at)}
                      </div>
                      <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                        {candidate.salary_expectation ? `$${candidate.salary_expectation}k expected` : 'Salary not specified'}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <Link href={`/candidates/${candidate.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {candidates.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No candidates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all available candidates.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
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
  )
}