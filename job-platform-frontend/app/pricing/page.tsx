"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Users, Briefcase, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for small businesses and startups",
      features: [
        "Post up to 3 jobs",
        "Basic job management",
        "Standard applications",
        "Email support",
        "Basic analytics"
      ],
      limitations: [
        "Limited to 3 active jobs",
        "No advanced features"
      ],
      popular: false,
      cta: "Get Started Free",
      href: "/register?plan=starter"
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      description: "Ideal for growing companies",
      features: [
        "Post unlimited jobs",
        "Advanced job management",
        "Priority applications",
        "Dedicated support",
        "Advanced analytics",
        "Company branding",
        "Bulk job posting",
        "Custom application forms"
      ],
      limitations: [],
      popular: true,
      cta: "Start Free Trial",
      href: "/register?plan=professional"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations with complex needs",
      features: [
        "Everything in Professional",
        "White-label solution",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced reporting",
        "Multi-location support",
        "Custom workflows",
        "SSO integration"
      ],
      limitations: [],
      popular: false,
      cta: "Contact Sales",
      href: "/contact?plan=enterprise"
    }
  ]

  const features = [
    {
      icon: Briefcase,
      title: "Job Posting",
      description: "Post and manage job listings with ease"
    },
    {
      icon: Users,
      title: "Candidate Management",
      description: "Track and manage applications efficiently"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reporting",
      description: "Get insights into your hiring performance"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security and compliance"
    },
    {
      icon: Zap,
      title: "Fast Setup",
      description: "Get started in minutes, not weeks"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director",
      company: "TechCorp Solutions",
      content: "JobPlatform has transformed our hiring process. We've reduced time-to-hire by 40% and found amazing candidates.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Founder",
      company: "StartupXYZ",
      content: "The free plan was perfect for us to get started. Now we're on Professional and couldn't be happier.",
      rating: 5
    },
    {
      name: "Emma Wilson",
      role: "Talent Acquisition Manager",
      company: "Global Corp",
      content: "Enterprise features like API access and custom integrations have streamlined our entire recruitment workflow.",
      rating: 5
    }
  ]

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
              Simple <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Choose the perfect plan for your hiring needs. Start free, upgrade anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div className="relative">
                  {plan.popular && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-50">
                      <Badge className="bg-primary text-white px-6 py-2 rounded-full shadow-xl border-2 border-white text-base font-semibold">
                        <Star className="h-4 w-4 mr-2" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <Card className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 animate-fade-in-up ${plan.popular ? 'bg-white shadow-lg scale-105 border-2 border-blue-200' : 'bg-white hover:bg-blue-50/30'}`} style={{animationDelay: `${0.1 + index * 0.2}s`}}>
                  
                  <CardHeader className="text-center pb-6 relative z-10">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-primary/10' : 'bg-blue-100'} transition-all duration-300`}>
                      <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">{plan.price}</span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    </div>
                    <CardDescription className="mt-2 text-gray-600">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center group-hover:scale-105 transition-transform duration-300">
                          <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full rounded-full ${plan.popular ? 'bg-primary hover:bg-primary/90 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href={plan.href} className="group-hover:scale-105 transition-transform duration-300">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Everything you need to hire great talent</h2>
              <p className="text-xl text-gray-600 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                Powerful features designed to streamline your recruitment process
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center group hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-8 w-8 text-primary group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Loved by thousands of companies</h2>
              <p className="text-xl text-gray-600 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                See what our customers have to say about JobPlatform
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.2}s`}}>
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 group-hover:text-gray-800 transition-colors duration-300">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-6">
              {[
                {
                  question: "Can I change plans anytime?",
                  answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
                },
                {
                  question: "Is there a free trial?",
                  answer: "Yes, all paid plans come with a 14-day free trial. No credit card required to start."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
                },
                {
                  question: "Do you offer custom pricing?",
                  answer: "Yes, we offer custom pricing for Enterprise plans. Contact our sales team for a personalized quote."
                }
              ].map((faq, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                  <CardContent className="p-8">
                    <h3 className="font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">{faq.question}</h3>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Ready to start hiring?</h2>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Join thousands of companies already using JobPlatform to find their next great hire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Button size="lg" asChild className="rounded-full bg-primary hover:bg-primary/90">
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full border-gray-200 hover:bg-gray-50">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
