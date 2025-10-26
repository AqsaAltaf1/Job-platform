"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Users, Search, CheckCircle, MapPin, Clock, DollarSign, Building2, ArrowLeft, ArrowRight, Star, TrendingUp, Code, Settings, ArrowRight as Arrow } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getJobsWithCompany } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all-locations")

  useEffect(() => {
    // If user is logged in, redirect to appropriate dashboard based on role
    if (!loading && user) {
      let redirectPath = "/dashboard";
      if (user.role === "super_admin") {
        redirectPath = "/admin";
      } else if (user.role === "employer" || (user.role as any) === "team_member") {
        redirectPath = "/employer/dashboard";
      } else if (user.role === "candidate") {
        redirectPath = "/candidate/dashboard";
      }
      router.push(redirectPath);
    }
  }, [user, loading, router])

  const handleSearch = () => {
    // Build search parameters
    const params = new URLSearchParams()
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim())
    }
    if (selectedLocation && selectedLocation !== 'all-locations') {
      params.append('location', selectedLocation)
    }
    
    // Navigate to jobs page with search parameters
    const searchUrl = `/jobs${params.toString() ? `?${params.toString()}` : ''}`
    router.push(searchUrl)
  }

  const handleViewCompanies = () => {
    router.push('/companies')
  }

  const handleViewJobs = () => {
    router.push('/jobs')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Show loading or nothing while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, don't render the home page content
  if (user) {
    return null
  }

  const jobs = getJobsWithCompany()

  const jobCategories = [
    { name: "Marketing & Communications", count: 12 },
    { name: "Design & Graphics", count: 8 },
    { name: "Information Technology", count: 25 },
    { name: "Sales", count: 15 },
    { name: "Operations", count: 6 },
    { name: "Administration & Office Support", count: 10 },
    { name: "Health & Fitness", count: 4 },
    { name: "Education & Training", count: 7 },
    { name: "Entertainment", count: 5 },
    { name: "Product and Technology", count: 18 },
    { name: "Communications", count: 9 },
    { name: "Events", count: 3 },
  ]

  return (
    <div className="bg-white min-h-screen">

      {/* Hero Section - Brand Colors */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Brand background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Headline - Brand Typography */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl kinfolk-heading text-foreground leading-none mb-8">
              Find Your
              <br />
              <span className="kinfolk-italic text-primary">Dream Job</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl kinfolk-body text-muted-foreground mb-16 max-w-2xl mx-auto">
              Connect with meaningful work and discover career opportunities that align with your values
            </p>
            
            {/* Brand Search */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="flex items-center border-b-2 border-primary pb-2">
                <Search className="h-6 w-6 text-muted-foreground mr-4" />
                <Input 
                  placeholder="What kind of work are you looking for?" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-lg border-0 focus:ring-0 bg-transparent placeholder:text-muted-foreground"
                />
                <Button 
                  variant="ghost" 
                  onClick={handleSearch}
                  className="text-primary hover:text-primary/80 p-2"
                >
                  <Arrow className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Location Filter - Brand Colors */}
            <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground mb-20">
              <span>Location:</span>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-auto border-0 text-muted-foreground focus:ring-0 bg-transparent">
                  <SelectValue placeholder="Anywhere" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-locations">Anywhere</SelectItem>
                  <SelectItem value="sydney">Sydney</SelectItem>
                  <SelectItem value="melbourne">Melbourne</SelectItem>
                  <SelectItem value="brisbane">Brisbane</SelectItem>
                  <SelectItem value="perth">Perth</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Wellfound Style */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl kinfolk-heading text-foreground mb-4">
                Trusted by thousands of professionals
              </h2>
              <p className="text-lg kinfolk-body text-muted-foreground max-w-2xl mx-auto">
                Join a community of verified professionals and innovative companies
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="group">
                <div className="text-6xl md:text-7xl font-light text-primary mb-4 group-hover:scale-105 transition-transform duration-300">
                  8M+
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Matches Made</div>
                <div className="text-sm text-muted-foreground">Successful connections between candidates and companies</div>
              </div>
              
              <div className="group">
                <div className="text-6xl md:text-7xl font-light text-primary mb-4 group-hover:scale-105 transition-transform duration-300">
                  150K+
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Active Jobs</div>
                <div className="text-sm text-muted-foreground">Quality opportunities across all industries</div>
              </div>
              
              <div className="group">
                <div className="text-6xl md:text-7xl font-light text-accent mb-4 group-hover:scale-105 transition-transform duration-300">
                  10M+
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Verified Professionals</div>
                <div className="text-sm text-muted-foreground">Trusted candidates ready for meaningful work</div>
              </div>
            </div>

            {/* Trusted Companies */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h3 className="text-xl font-medium text-foreground mb-4">Trusted by leading companies</h3>
                <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                  <div className="text-2xl font-bold text-muted-foreground">TechCorp</div>
                  <div className="text-2xl font-bold text-muted-foreground">InnovateLab</div>
                  <div className="text-2xl font-bold text-muted-foreground">FutureWorks</div>
                  <div className="text-2xl font-bold text-muted-foreground">StartupHub</div>
                  <div className="text-2xl font-bold text-muted-foreground">GrowthCo</div>
                  <div className="text-2xl font-bold text-muted-foreground">ScaleUp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl kinfolk-heading text-foreground mb-6">
                Explore by Field
              </h2>
              <p className="text-lg kinfolk-body text-muted-foreground max-w-3xl mx-auto">
                Discover opportunities across different industries and specializations. Find your perfect match in technology, design, business, and more.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {jobCategories.slice(0, 6).map((category, index) => {
                const icons = [Briefcase, Users, Building2, Search, CheckCircle, MapPin]
                const Icon = icons[index] || Briefcase
                const colors = [
                  'from-primary to-primary/80',
                  'from-accent to-accent/80', 
                  'from-primary/80 to-accent/80',
                  'from-accent/80 to-primary/80',
                  'from-primary to-accent',
                  'from-accent to-primary'
                ]
                const colorClass = colors[index % colors.length]
                
                return (
                  <div key={category.name} className="group cursor-pointer bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-foreground">{Math.floor(Math.random() * 15) + 5}+</div>
                        <div className="text-xs text-muted-foreground">positions</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-light text-foreground group-hover:text-primary transition-colors duration-300 mb-3">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Explore opportunities</div>
                      <Arrow className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">12+</div>
                <div className="text-sm text-muted-foreground">Job Categories</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-accent mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Specializations</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Coverage</div>
              </div>
            </div>

            <div className="text-center">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 mr-4">
                View All Categories
                <Arrow className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={handleViewJobs} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                Browse Jobs
                <Arrow className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Companies Section - Enhanced Mix */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl kinfolk-heading text-foreground mb-6">
                Featured Companies
              </h2>
              <p className="text-lg kinfolk-body text-muted-foreground max-w-3xl mx-auto">
                Discover innovative companies that are shaping the future of work. From startups to scale-ups, find your next opportunity with organizations that value talent and growth.
              </p>
            </div>

            {/* Featured Company Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Company 1: CoderBotics */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary rounded-sm"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">3 open positions</div>
                    <div className="text-xs text-muted-foreground">Remote • Hybrid</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">CoderBotics</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Building the future of technology through innovative solutions and meaningful work. Join our team of passionate developers.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Series A</span>
                  </div>
                  <div className="text-xs text-muted-foreground">50-200 employees</div>
                </div>
              </div>

              {/* Company 2: Syspresoft */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-accent rounded-sm"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">5 open positions</div>
                    <div className="text-xs text-muted-foreground">On-site • Remote</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Syspresoft</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Creating software solutions that make a difference in people's lives. We're looking for talented individuals to join our mission.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Series B</span>
                  </div>
                  <div className="text-xs text-muted-foreground">200-500 employees</div>
                </div>
              </div>

              {/* Company 3: Illuminate Studio */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/80 to-accent/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">2 open positions</div>
                    <div className="text-xs text-muted-foreground">Remote First</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Illuminate Studio</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Illuminating ideas through creative design and thoughtful execution. Join our creative team and make an impact.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Bootstrapped</span>
                  </div>
                  <div className="text-xs text-muted-foreground">10-50 employees</div>
                </div>
              </div>
            </div>

            {/* Company Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Active Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-accent mb-2">2,000+</div>
                <div className="text-sm text-muted-foreground">Open Positions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Hiring Success Rate</div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={handleViewCompanies} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 mr-4">
                View All Companies
                <Arrow className="ml-2 h-4 w-4" />
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                Post Your Job
                <Arrow className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Section - Enhanced Mix */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl kinfolk-heading text-foreground mb-6">
                Partner Universities
              </h2>
              <p className="text-lg kinfolk-body text-muted-foreground max-w-3xl mx-auto">
                Connect with top universities and educational institutions. Discover academic partnerships, research opportunities, and talent pipelines from leading educational institutions.
              </p>
            </div>

            {/* Featured University Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* University 1: Stanford University */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary rounded-sm"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">15+ programs</div>
                    <div className="text-xs text-muted-foreground">Research • Innovation</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Stanford University</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Leading research university with world-class programs in engineering, business, and medicine. Partnering with industry leaders to drive innovation.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Private Research</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Palo Alto, CA</div>
                </div>
              </div>

              {/* University 2: MIT */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-accent rounded-sm"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">20+ programs</div>
                    <div className="text-xs text-muted-foreground">Technology • Science</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">MIT</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Massachusetts Institute of Technology - pioneering advances in science, technology, and engineering. Shaping the future through cutting-edge research.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Research Institute</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Cambridge, MA</div>
                </div>
              </div>

              {/* University 3: University of California */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/80 to-accent/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">25+ programs</div>
                    <div className="text-xs text-muted-foreground">Public Research</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">UC System</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  University of California system with multiple campuses across the state. Comprehensive programs in diverse fields with strong industry partnerships.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Public University</span>
                  </div>
                  <div className="text-xs text-muted-foreground">California, USA</div>
                </div>
              </div>
            </div>

            {/* University Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Partner Universities</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-accent mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Academic Programs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Student Placements</div>
              </div>
            </div>

            <div className="text-center">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 mr-4">
                View All Universities
                <Arrow className="ml-2 h-4 w-4" />
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                Partner With Us
                <Arrow className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section - Company Card Style */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl kinfolk-heading text-foreground mb-6">
                Featured Jobs
              </h2>
              <p className="text-lg kinfolk-body text-muted-foreground max-w-3xl mx-auto">
                Discover hand-picked opportunities from top companies. Find your next career move with roles that match your skills and aspirations.
              </p>
            </div>

            {/* Featured Job Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Job 1: Senior Software Engineer */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">$120k - $160k</div>
                    <div className="text-xs text-muted-foreground">Remote • Full-time</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Senior Software Engineer</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Join our engineering team to build scalable applications using modern technologies. Work with cutting-edge tools and collaborate with talented developers.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">TechCorp</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Posted 2 days ago</div>
                </div>
              </div>

              {/* Job 2: Product Manager */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">$100k - $140k</div>
                    <div className="text-xs text-muted-foreground">Hybrid • Full-time</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Product Manager</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Lead product strategy and development for our flagship platform. Work with cross-functional teams to deliver exceptional user experiences.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground">InnovateLab</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Posted 1 day ago</div>
                </div>
              </div>

              {/* Job 3: UX Designer */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/80 to-accent/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">$80k - $120k</div>
                    <div className="text-xs text-muted-foreground">Remote • Full-time</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">UX Designer</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Create intuitive and beautiful user experiences. Work with our design team to craft products that users love and that drive business results.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">DesignStudio</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Posted 3 days ago</div>
                </div>
              </div>

              {/* Job 4: Data Scientist */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/80 to-primary/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">$110k - $150k</div>
                    <div className="text-xs text-muted-foreground">On-site • Full-time</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Data Scientist</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Analyze complex datasets to drive business insights. Work with machine learning models and help shape our data-driven decision making.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground">DataCorp</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Posted 4 days ago</div>
                </div>
              </div>

              {/* Job 5: Marketing Manager */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">$90k - $130k</div>
                    <div className="text-xs text-muted-foreground">Hybrid • Full-time</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Marketing Manager</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Lead our marketing initiatives and drive growth. Develop strategies that connect with our audience and expand our market presence.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">GrowthCo</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Posted 1 day ago</div>
                </div>
              </div>

              {/* Job 6: DevOps Engineer */}
              <div className="group cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accent font-medium">$100k - $140k</div>
                    <div className="text-xs text-muted-foreground">Remote • Full-time</div>
                  </div>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3 group-hover:text-primary transition-colors duration-300">DevOps Engineer</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Build and maintain our cloud infrastructure. Ensure our systems are scalable, secure, and performant. Work with cutting-edge technologies.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground">CloudTech</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Posted 2 days ago</div>
                </div>
              </div>
            </div>

            {/* Job Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">2,500+</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-accent mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Companies Hiring</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">24h</div>
                <div className="text-sm text-muted-foreground">Average Response</div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={handleViewJobs} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 mr-4">
                View All Jobs
                <Arrow className="ml-2 h-4 w-4" />
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                Get Job Alerts
                <Arrow className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl kinfolk-heading text-foreground mb-6">
                Stay Connected
              </h2>
              <p className="text-lg kinfolk-body text-muted-foreground max-w-3xl mx-auto">
                Get the latest job opportunities, career insights, and industry trends delivered to your inbox. Join thousands of professionals who stay ahead of the curve.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-12 shadow-lg">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center border-b-2 border-primary pb-4 mb-6">
                  <Input 
                    placeholder="Enter your email address" 
                    type="email"
                    className="flex-1 text-xl border-0 focus:ring-0 bg-transparent placeholder:text-muted-foreground"
                  />
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 ml-4"
                  >
                    Subscribe
                    <Arrow className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm text-muted-foreground">Weekly job alerts</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Career insights</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-sm text-muted-foreground">Industry trends</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-6 text-center">
                  We respect your privacy. Unsubscribe at any time. No spam, ever.
                </p>
              </div>
            </div>

            {/* Newsletter Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">25K+</div>
                <div className="text-sm text-muted-foreground">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-accent mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Open Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light text-primary mb-2">Weekly</div>
                <div className="text-sm text-muted-foreground">Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
