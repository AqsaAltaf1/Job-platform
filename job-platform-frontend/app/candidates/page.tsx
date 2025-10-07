"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { getApiUrl } from "@/lib/config"
import { toast } from "sonner"
import { 
  Search, 
  Filter, 
  Eye, 
  MapPin, 
  Briefcase, 
  Star,
  Users,
  GraduationCap,
  Award,
  Calendar
} from "lucide-react"
import Link from "next/link"

interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  location?: string
  availability?: string
  bio?: string
  profile_picture?: string
  created_at: string
  updated_at: string
  candidate_profile?: {
    id: string
    years_of_experience?: number
    current_position?: string
    expected_salary?: number
    coreSkills?: Array<{
      id: string
      name: string
      level: string
      category: string
    }>
    experiences?: Array<{
      id: string
      title: string
      company: string
      start_date: string
      end_date?: string
    }>
    educations?: Array<{
      id: string
      degree: string
      institution: string
      graduation_year: number
    }>
  }
}

export default function CandidatesPage() {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")

  useEffect(() => {
    console.log('User role:', user?.role)
    console.log('User:', user)
    if (user?.role === "employer" || user?.role === "team_member") {
      console.log('User has permission to view candidates, fetching...')
      fetchCandidates()
    } else {
      console.log('User does not have permission to view candidates')
    }
  }, [user])

  useEffect(() => {
    filterAndSortCandidates()
  }, [candidates, searchTerm, sortBy, filterBy, experienceFilter])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      console.log('Fetching candidates with token:', token ? 'Token exists' : 'No token')
      console.log('API URL:', getApiUrl('/candidates'))
      
      const response = await fetch(getApiUrl('/candidates'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('API Response data:', data)
        setCandidates(data.data?.candidates || [])
        console.log('Set candidates:', data.data?.candidates || [])
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        toast.error(`Failed to fetch candidates: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching candidates:', error)
      toast.error('Failed to fetch candidates')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCandidates = () => {
    let filtered = [...candidates]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate => 
        candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.candidate_profile?.current_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.candidate_profile?.coreSkills?.some(skill => 
          skill.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Experience filter
    if (experienceFilter !== "all") {
      filtered = filtered.filter(candidate => {
        const years = candidate.candidate_profile?.years_of_experience || 0
        switch (experienceFilter) {
          case "0-1":
            return years >= 0 && years <= 1
          case "2-5":
            return years >= 2 && years <= 5
          case "6-10":
            return years >= 6 && years <= 10
          case "10+":
            return years > 10
          default:
            return true
        }
      })
    }

    // Sort candidates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name":
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        case "experience":
          const aExp = a.candidate_profile?.years_of_experience || 0
          const bExp = b.candidate_profile?.years_of_experience || 0
          return bExp - aExp
        default:
          return 0
      }
    })

    setFilteredCandidates(filtered)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Show access denied for non-employers
  if (user?.role !== "employer" && user?.role !== "team_member") {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center min-h-screen">
          <Card className="w-96">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Access denied. This page is only available for employers and team members.
              </p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Candidates</h1>
          <p className="text-muted-foreground">
            Discover talented candidates and view their profiles
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search candidates by name, email, position, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Newest First</SelectItem>
                  <SelectItem value="oldest" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Oldest First</SelectItem>
                  <SelectItem value="name" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Name A-Z</SelectItem>
                  <SelectItem value="experience" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">Experience</SelectItem>
                </SelectContent>
              </Select>

              {/* Experience Filter */}
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">All Experience</SelectItem>
                  <SelectItem value="0-1" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">0-1 Years</SelectItem>
                  <SelectItem value="2-5" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">2-5 Years</SelectItem>
                  <SelectItem value="6-10" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">6-10 Years</SelectItem>
                  <SelectItem value="10+" className="hover:bg-primary hover:text-white focus:bg-primary focus:text-white">10+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </p>
        </div>

        {/* Candidates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search criteria" : "No candidates are available at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-12 w-12">
                      {candidate.profile_picture ? (
                        <img 
                          src={candidate.profile_picture} 
                          alt={`${candidate.first_name} ${candidate.last_name}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarFallback>
                          {getInitials(candidate.first_name, candidate.last_name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {candidate.first_name} {candidate.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {candidate.candidate_profile?.current_position || "Position not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="space-y-2 mb-4">
                    {candidate.candidate_profile?.years_of_experience !== undefined && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {candidate.candidate_profile.years_of_experience} years experience
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {candidate.location}
                      </div>
                    )}
                    {candidate.availability && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {candidate.availability}
                      </div>
                    )}
                  </div>

                  {/* Skills Preview */}
                  {candidate.candidate_profile?.coreSkills && candidate.candidate_profile.coreSkills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {candidate.candidate_profile.coreSkills.slice(0, 3).map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                        {candidate.candidate_profile.coreSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.candidate_profile.coreSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio Preview */}
                  {candidate.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {candidate.bio}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Joined {formatDate(candidate.created_at)}
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/profile/${candidate.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
