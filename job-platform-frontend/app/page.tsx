import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Users, Search, CheckCircle, MapPin, Clock, DollarSign, Building2, ArrowLeft, ArrowRight, Star, TrendingUp, Code, Settings } from "lucide-react"
import Link from "next/link"
import { getJobsWithCompany } from "@/lib/mock-data"

export default function HomePage() {
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
    <div className="bg-background relative overflow-hidden">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100/50 py-20 lg:py-32 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-blue-100/30 pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-800/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-10 animate-fade-in-up">
              <div className="space-y-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  Find Your <span className="text-primary">Dream Job</span> Today
          </h1>
                <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  Connect with top companies and discover amazing career opportunities across Australia
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="bg-white border-2 border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors duration-200" />
                    <Input 
                      placeholder="Job Title or Keyword" 
                      className="pl-12 h-14 text-lg border-0 focus:ring-0 bg-transparent focus:bg-gray-50 transition-all duration-200 rounded-full"
                    />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors duration-200" />
                    <Select defaultValue="all-locations">
                      <SelectTrigger className="pl-12 h-14 text-lg border-0 focus:ring-0 bg-transparent w-full md:w-64 focus:bg-gray-50 transition-all duration-200 rounded-full">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-locations">All Locations</SelectItem>
                        <SelectItem value="sydney">Sydney</SelectItem>
                        <SelectItem value="melbourne">Melbourne</SelectItem>
                        <SelectItem value="brisbane">Brisbane</SelectItem>
                        <SelectItem value="perth">Perth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="lg" className="h-14 w-14 bg-primary hover:bg-primary/90 text-white rounded-full p-0 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <Search className="h-6 w-6" />
            </Button>
                </div>
              </div>

              {/* Popular Searches */}
              <div className="space-y-4 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                <h3 className="text-lg font-semibold text-gray-900">Popular Searches</h3>
                <div className="flex flex-wrap gap-3">
                  {["designer", "web developer", "Writer", "Team leader", "Fullstack", "Web", "Financial Analyst", "Senior", "Software", "Techn"].map((term, index) => (
                    <Badge 
                      key={term} 
                      variant="outline" 
                      className="px-4 py-2 text-sm bg-blue-100 text-slate-900 border-blue-200 hover:bg-blue-200 hover:scale-105 cursor-pointer transition-all duration-200 animate-fade-in-up rounded-full"
                      style={{animationDelay: `${0.9 + index * 0.1}s`}}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative animate-fade-in-right">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl transform rotate-2 animate-float-enhanced"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 rounded-3xl transform -rotate-1 animate-float-enhanced" style={{animationDelay: '1s'}}></div>
              
              {/* Main Content */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 h-96 flex items-end animate-fade-in-up shadow-2xl border border-white/20" style={{animationDelay: '0.5s'}}>
                {/* Big dark circle behind image card */}
                <div className="absolute bottom-4 left-4 w-56 h-96 bg-gray-800/30 rounded-3xl blur-2xl"></div>
                
                {/* Person illustration */}
                <div className="absolute bottom-0 left-8 w-48 h-80 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl flex items-center justify-center animate-bounce-in shadow-lg relative z-10" style={{animationDelay: '1.2s'}}>
                  <div className="w-32 h-40 bg-white rounded-xl shadow-md flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gray-800/10 rounded-xl blur-sm"></div>
                    <Users className="h-12 w-12 text-primary relative z-10" />
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-blue-50/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up hover:scale-105 transition-all duration-300" style={{animationDelay: '0.1s'}}>
              <div className="text-4xl font-bold text-primary mb-2 animate-count-up">10,000+</div>
              <div className="text-muted-foreground">Active Jobs</div>
            </div>
            <div className="animate-fade-in-up hover:scale-105 transition-all duration-300" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl font-bold text-primary mb-2 animate-count-up">5,000+</div>
              <div className="text-muted-foreground">Companies</div>
            </div>
            <div className="animate-fade-in-up hover:scale-105 transition-all duration-300" style={{animationDelay: '0.3s'}}>
              <div className="text-4xl font-bold text-primary mb-2 animate-count-up">50,000+</div>
              <div className="text-muted-foreground">Job Seekers</div>
            </div>
            <div className="animate-fade-in-up hover:scale-105 transition-all duration-300" style={{animationDelay: '0.4s'}}>
              <div className="text-4xl font-bold text-primary mb-2 animate-count-up">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Search by Category
              </h2>
              <p className="text-xl text-gray-600">
                Search your career opportunity with our categories
              </p>
            </div>
            <a href="#" className="text-primary hover:text-primary/80 font-medium text-lg">
              All Categories &gt;
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {jobCategories.slice(0, 6).map((category, index) => {
              const icons = [Briefcase, Users, Building2, Search, CheckCircle, MapPin]
              const Icon = icons[index] || Briefcase
              return (
                <Card key={category.name} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-blue-50 hover:bg-white hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm group-hover:shadow-lg">
                      <Icon className="h-8 w-8 text-gray-700 group-hover:text-primary transition-all duration-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">{category.name}</h3>
                    <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                      {Math.floor(Math.random() * 5) + 1} open positions
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Featured Job Offers Section */}
      <section className="py-20 bg-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Job Offers
            </h2>
            <p className="text-xl text-gray-600">
              Search your career opportunity through 12,800 jobs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jobs.slice(0, 8).map((job, index) => {
              const categoryIcons = [TrendingUp, Code, Building2, Settings, Users, Briefcase, Search, CheckCircle]
              const CategoryIcon = categoryIcons[index % categoryIcons.length]
              const categoryNames = ["Finance", "Software Engineering", "Human Resources", "Business Development", "Marketing", "Sales", "Design", "Operations"]
              const categoryName = categoryNames[index % categoryNames.length]
              
              return (
                <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                  <CardContent className="p-6">
                    {/* Category */}
                    <div className="flex items-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      <CategoryIcon className="h-4 w-4 text-gray-400 mr-2 group-hover:text-primary transition-colors duration-300" />
                      <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">{categoryName}</span>
                    </div>
                    
                    {/* Job Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 group-hover:scale-105 transition-transform duration-300">
                      {job.title}
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
                        <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">{job.company.name}</div>
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
        </div>
      </section>

      {/* Find Best Companies Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Best Companies
            </h2>
            <p className="text-xl text-gray-600">
              Work for the best companies in the world
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {/* Company 1: CoderBotics */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm group-hover:bg-blue-600 transition-colors duration-300"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center group-hover:text-blue-600 transition-colors duration-300 group-hover:scale-105 transition-transform duration-300">CoderBotics</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  CoderBotics, Inc. is an American multinational corporation that is engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services. The company is...
                </p>
                <div className="text-center group-hover:scale-105 transition-transform duration-300">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">1 jobs</span>
                </div>
            </CardContent>
          </Card>

            {/* Company 2: Syspresoft */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:shadow-xl">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <div className="w-6 h-1 bg-blue-500 rounded-full mb-1"></div>
                    <div className="w-6 h-1 bg-blue-500 rounded-full mb-1"></div>
                    <div className="w-6 h-1 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Syspresoft</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Syspresoft, Inc. is an American multinational corporation that is engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services. The company is...
                </p>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-900">2 jobs</span>
                </div>
            </CardContent>
          </Card>

            {/* Company 3: Illuminate Studio */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:shadow-xl">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Illuminate Studio</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Illuminate Studio, Inc. is an American multinational corporation that is engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services. The company...
                </p>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-900">1 jobs</span>
                </div>
            </CardContent>
          </Card>

            {/* Company 4: Artistre Studio */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:shadow-xl">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <div className="w-6 h-6 bg-teal-500 rounded-sm transform rotate-45"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Artistre Studio</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Artistre Studio, Inc. is an American multinational corporation that is engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services. The company...
                </p>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-900">1 jobs</span>
                </div>
            </CardContent>
          </Card>
          </div>

          <div className="text-left">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
              All Companies
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20 bg-blue-50/40">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who found their dream jobs through our platform
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Sarah Johnson",
              role: "Software Engineer",
              company: "TechCorp",
              content: "Found my dream job in just 2 weeks! The platform made it so easy to connect with the right companies.",
              rating: 5
            },
            {
              name: "Michael Chen",
              role: "Marketing Manager",
              company: "Creative Agency",
              content: "Amazing experience! The job matching algorithm really understands what I was looking for.",
              rating: 5
            },
            {
              name: "Emma Wilson",
              role: "UX Designer",
              company: "StartupXYZ",
              content: "The quality of jobs on this platform is outstanding. Highly recommend to anyone job hunting!",
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                  </div>
            </div>
          </CardContent>
        </Card>
          ))}
        </div>
      </section>

      {/* Stay Up to Date Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Stay Up to Date
              </h2>
              <p className="text-xl text-gray-600">
                Subscribe to our newsletter to receive our weekly feed.
              </p>
            </div>

            <div className="relative">
              {/* Illustration */}
              <div className="flex items-center justify-center mb-12">
                <div className="relative">
                  {/* Person walking */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8">
                    <div className="w-16 h-20 bg-gray-200 rounded-full flex items-end justify-center">
                      <div className="w-12 h-12 bg-white rounded-full mb-2"></div>
                    </div>
                  </div>

                  {/* Envelope */}
                  <div className="relative w-32 h-24 bg-white border-2 border-gray-300 rounded-lg shadow-lg">
                    <div className="absolute top-2 left-2 right-2 bottom-2 bg-gray-50 rounded border"></div>
                    <div className="absolute top-1 right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Paper airplanes */}
                  <div className="absolute -top-4 -right-4 w-4 h-4 bg-blue-200 transform rotate-45"></div>
                  <div className="absolute top-8 -right-8 w-3 h-3 bg-blue-300 transform rotate-12"></div>
                  <div className="absolute -bottom-2 -left-4 w-3 h-3 bg-blue-200 transform -rotate-12"></div>
                </div>
              </div>

              {/* Email form */}
              <div className="max-w-md mx-auto flex gap-3">
                <Input 
                  placeholder="Enter your email..." 
                  type="email"
                  className="flex-1 h-12 border-2 border-gray-200 focus:border-primary rounded-full"
                />
                <Button size="lg" className="h-12 bg-primary hover:bg-primary/90 text-white px-6 rounded-full">
                  Subscribe &gt;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
