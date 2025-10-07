"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Users, Briefcase, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getApiUrl } from "@/lib/config"

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly' | 'one_time';
  features: string[];
  limits: {
    max_job_postings?: number;
    max_applications?: number;
    max_team_members?: number;
  };
  is_popular: boolean;
  sort_order: number;
}

interface FeatureWithIcon {
  text: string;
  icon: any;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Static features with icons
  const staticFeatures: { free: FeatureWithIcon[], paid: FeatureWithIcon[] } = {
    free: [
      { text: 'Post up to 3 jobs', icon: Briefcase },
      { text: 'Basic job management', icon: Users },
      { text: 'Standard applications', icon: Check },
      { text: 'Email support', icon: Shield },
      { text: 'Basic analytics', icon: TrendingUp }
    ],
    paid: [
      { text: 'Unlimited job postings', icon: Briefcase },
      { text: 'Unlimited applications', icon: Users },
      { text: 'Advanced analytics', icon: TrendingUp },
      { text: 'Priority support', icon: Shield },
      { text: 'Team collaboration tools', icon: Zap },
      { text: 'Custom branding', icon: Star },
      { text: 'API access', icon: Check },
      { text: 'Advanced reporting', icon: TrendingUp },
      { text: 'Bulk operations', icon: Briefcase },
      { text: 'White-label options', icon: Shield }
    ]
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(getApiUrl('/subscription-plans'));
        const data = await response.json();
        
        if (data.success) {
          setPlans(data.plans);
        } else {
          setError('Failed to load pricing plans');
        }
      } catch (err) {
        setError('Failed to load pricing plans');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Create static free plan
  const freePlan = {
    id: 'free',
    name: 'Free',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for small businesses and startups',
    features: staticFeatures.free,
    limitations: [
      'Limited to 3 active jobs',
      'No advanced features'
    ],
    popular: false,
    cta: 'Get Started Free',
    href: '/register?plan=free'
  };

  // Transform plans for display
  const transformedPlans = plans.map(plan => {
    // Use static features instead of database features
    const features = plan.price === 0 ? staticFeatures.free : staticFeatures.paid;
    
    return {
      id: plan.id,
      name: plan.display_name || plan.name,
      price: plan.price === 0 ? "Free" : `$${plan.price}`,
      period: plan.price === 0 ? "forever" : 
              plan.billing_cycle === 'one_time' ? "one-time" :
              plan.billing_cycle === 'monthly' ? "per month" :
              plan.billing_cycle === 'yearly' ? "per year" : "per month",
      description: plan.description || "Perfect for your business needs",
      features: features,
      limitations: [],
      popular: plan.is_popular,
      cta: plan.price === 0 ? "Get Started Free" : "Subscribe",
      href: plan.price === 0 ? "/register" : `/register?plan=${plan.id}`
    };
  });

  // Combine free plan with dynamic plans
  const allPlans = [freePlan, ...transformedPlans];

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
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading pricing plans...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : allPlans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No pricing plans available at the moment.</p>
                <Button asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            ) : (
              <div className={`grid gap-8 ${allPlans.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : allPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'}`}>
                {allPlans.map((plan, index) => (
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
                      {plan.features.map((feature, featureIndex) => {
                        const featureWithIcon = feature as FeatureWithIcon;
                        const IconComponent = featureWithIcon.icon || Check;
                        const featureText = featureWithIcon.text || (typeof feature === 'string' ? feature : '');
                        return (
                          <li key={featureIndex} className="flex items-center group-hover:scale-105 transition-transform duration-300">
                            <IconComponent className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">{featureText}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <Button 
                      className={`w-full rounded-full ${plan.popular ? 'bg-primary hover:bg-primary/90 text-white' : plan.cta === 'Subscribe' ? 'bg-primary hover:bg-primary/90 text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                      variant={plan.popular ? "default" : plan.cta === 'Subscribe' ? "default" : "outline"}
                      asChild
                    >
                      <Link href={plan.href} className="group-hover:scale-105 transition-transform duration-300">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                  </Card>
                </div>
                ))}
              </div>
            )}
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
              <Button size="lg" asChild className="rounded-full bg-primary hover:bg-primary/90 text-white">
                <Link href="/register">Subscribe Now</Link>
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
