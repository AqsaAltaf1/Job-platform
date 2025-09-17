"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Users, BookOpen, Clock, ArrowRight, Star } from "lucide-react"
import Link from "next/link"

export default function CareerAdvicePage() {
  const articles = [
    {
      id: 1,
      title: "How to Write a Standout Resume in 2024",
      excerpt: "Learn the latest resume trends and best practices to make your application stand out from the crowd.",
      category: "Resume Tips",
      readTime: "5 min read",
      author: "Sarah Johnson",
      date: "2 days ago",
      featured: true,
      image: "/placeholder.jpg"
    },
    {
      id: 2,
      title: "Interview Questions You Should Ask Employers",
      excerpt: "Turn the tables and show your interest by asking these strategic questions during your interview.",
      category: "Interview Tips",
      readTime: "7 min read",
      author: "Michael Chen",
      date: "1 week ago",
      featured: false,
      image: "/placeholder.jpg"
    },
    {
      id: 3,
      title: "Remote Work: How to Stay Productive and Connected",
      excerpt: "Master the art of remote work with these proven strategies for productivity and team collaboration.",
      category: "Remote Work",
      readTime: "6 min read",
      author: "Emma Wilson",
      date: "1 week ago",
      featured: false,
      image: "/placeholder.jpg"
    },
    {
      id: 4,
      title: "Salary Negotiation: Getting What You're Worth",
      excerpt: "Confidently negotiate your salary with these expert tips and strategies.",
      category: "Career Growth",
      readTime: "8 min read",
      author: "David Rodriguez",
      date: "2 weeks ago",
      featured: false,
      image: "/placeholder.jpg"
    },
    {
      id: 5,
      title: "Building Your Personal Brand Online",
      excerpt: "Create a strong online presence that attracts opportunities and showcases your expertise.",
      category: "Personal Branding",
      readTime: "9 min read",
      author: "Lisa Park",
      date: "2 weeks ago",
      featured: false,
      image: "/placeholder.jpg"
    },
    {
      id: 6,
      title: "Career Change: Making the Transition Successfully",
      excerpt: "Navigate a career change with confidence using this step-by-step guide.",
      category: "Career Change",
      readTime: "10 min read",
      author: "James Thompson",
      date: "3 weeks ago",
      featured: false,
      image: "/placeholder.jpg"
    }
  ]

  const categories = [
    "All Topics",
    "Resume Tips",
    "Interview Tips",
    "Remote Work",
    "Career Growth",
    "Personal Branding",
    "Career Change",
    "Networking",
    "Leadership"
  ]

  const featuredArticle = articles.find(article => article.featured)
  const regularArticles = articles.filter(article => !article.featured)

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
              Career <span className="text-primary">Advice</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Expert insights and tips to accelerate your career growth
            </p>
          </div>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search career advice articles..."
                  className="pl-12 h-14 text-lg rounded-full border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <Button size="lg" className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90">
                Search
              </Button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={category === "All Topics" ? "default" : "outline"}
                  className={`px-4 py-2 text-sm rounded-full cursor-pointer transition-all duration-300 hover:scale-105 ${
                    category === "All Topics" 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-16 bg-blue-50/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center animate-fade-in-up">Featured Article</h2>
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-white p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 bg-primary text-white rounded-full">{featuredArticle.category}</Badge>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300">{featuredArticle.title}</h3>
                    <p className="text-gray-600 mb-6 group-hover:text-gray-800 transition-colors duration-300">{featuredArticle.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 group-hover:text-gray-700 transition-colors duration-300">
                      <span>By {featuredArticle.author}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredArticle.readTime}
                      </div>
                      <span>•</span>
                      <span>{featuredArticle.date}</span>
                    </div>
                    <Button asChild className="rounded-full bg-primary hover:bg-primary/90 group-hover:scale-105 transition-transform duration-300">
                      <Link href={`/career-advice/${featuredArticle.id}`}>
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                    <BookOpen className="h-32 w-32 text-primary/50 group-hover:text-primary/70 transition-colors duration-300" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900 animate-fade-in-up">Latest Articles</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:border-primary focus:ring-primary/20">
                  <option>Latest</option>
                  <option>Most Popular</option>
                  <option>Trending</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article, index) => (
                <Card key={article.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs border-primary text-primary bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-500">4.8</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      <Link href={`/career-advice/${article.id}`} className="hover:text-primary transition-colors">
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3 text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                      {article.excerpt}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.readTime}
                      </div>
                      <span>{article.date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-16">
              <Button variant="outline" size="lg" className="rounded-full border-gray-200 hover:bg-gray-50">
                Load More Articles
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Stay Updated with Career Tips</h2>
            <p className="text-gray-600 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Get the latest career advice and job market insights delivered to your inbox weekly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Input 
                placeholder="Enter your email address" 
                type="email"
                className="flex-1 rounded-full border-gray-200 focus:border-primary focus:ring-primary/20"
              />
              <Button className="rounded-full bg-primary hover:bg-primary/90">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
