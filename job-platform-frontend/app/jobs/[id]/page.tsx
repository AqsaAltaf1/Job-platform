"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, DollarSign, Building2, Users, Star, Heart, Share2, ExternalLink, Calendar, User, Mail } from "lucide-react"
import Link from "next/link"
import { getJobById } from "@/lib/mock-data"
import { notFound } from "next/navigation"

interface JobPageProps {
  params: {
    id: string
  }
}

export default function JobPage({ params }: JobPageProps) {
  const job = getJobById(params.id)

  if (!job) {
    notFound()
  }

  const relatedJobs = [
    {
      id: "2",
      title: "UX/UI Designer",
      company: "Creative Studios",
      location: "New York, NY",
      salary: "$70k - $95k",
      type: "Full-time",
      posted: "2 days ago"
    },
    {
      id: "3",
      title: "Junior Full Stack Developer",
      company: "TechCorp Solutions",
      location: "Remote",
      salary: "$55k - $70k",
      type: "Full-time",
      posted: "1 week ago"
    }
  ]

    return (
    <div className="bg-background">
      {/* Job Header */}
      <section className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                  <div>
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-muted-foreground">{job.company.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-muted-foreground">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>{job.job_type.replace('-', ' ')}</span>
              </div>
              {job.salary_min && job.salary_max && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span>${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{job.company.size} employees</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-accent text-accent">
                {job.experience_level}
              </Badge>
              <Badge variant="outline">{job.company.industry}</Badge>
              <Badge variant="outline">{job.job_type.replace('-', ' ')}</Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground mb-4">{job.description}</p>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                      <div className="whitespace-pre-line text-muted-foreground">
                        {job.requirements}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>About {job.company.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{job.company.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Company Size</h4>
                      <p className="text-muted-foreground">{job.company.size} employees</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Industry</h4>
                      <p className="text-muted-foreground">{job.company.industry}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Location</h4>
                      <p className="text-muted-foreground">{job.company.location}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Website</h4>
                      <a 
                        href={job.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedJobs.map((relatedJob) => (
                      <div key={relatedJob.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <h4 className="font-semibold">
                            <Link href={`/jobs/${relatedJob.id}`} className="hover:text-primary transition-colors">
                              {relatedJob.title}
                            </Link>
                          </h4>
                          <p className="text-sm text-muted-foreground">{relatedJob.company}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{relatedJob.location}</span>
                            <span>{relatedJob.salary}</span>
                            <span>{relatedJob.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{relatedJob.posted}</p>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/jobs/${relatedJob.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Ready to apply?</h3>
                    <p className="text-sm text-muted-foreground">
                      Join {job.company.name} and take the next step in your career
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      Apply Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Save Job
                    </Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Posted {Math.floor(Math.random() * 7) + 1} days ago</p>
                    <p className="text-xs text-muted-foreground">
                      Applications close in {Math.floor(Math.random() * 30) + 1} days
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Experience Level</span>
                    <span className="font-medium">{job.experience_level}</span>
                      </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Job Type</span>
                    <span className="font-medium">{job.job_type.replace('-', ' ')}</span>
                      </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                  {job.salary_min && job.salary_max && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Salary</span>
                      <span className="font-medium">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{job.company.industry}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Company Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Company Size</span>
                    <span className="font-medium">{job.company.size} employees</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Founded</span>
                    <span className="font-medium">2018</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Open Jobs</span>
                    <span className="font-medium">{Math.floor(Math.random() * 20) + 1}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}