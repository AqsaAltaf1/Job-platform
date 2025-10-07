'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Clock,
  Award,
  Target,
  Activity,
  Download,
  Filter,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  Brain,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  FileText,
  Database,
  Globe,
  Scale,
  Lightbulb,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { getApiUrl } from '@/lib/config'

interface DEIMetrics {
  diversity_metrics: {
    gender_distribution: {
      male: number
      female: number
      non_binary: number
      prefer_not_to_say: number
    }
    ethnicity_distribution: {
      [key: string]: number
    }
    age_distribution: {
      '18-25': number
      '26-35': number
      '36-45': number
      '46-55': number
      '55+': number
    }
    education_background: {
      [key: string]: number
    }
    geographic_distribution: {
      [key: string]: number
    }
  }
  inclusion_metrics: {
    retention_rate_by_demographic: {
      [key: string]: number
    }
    promotion_rate_by_demographic: {
      [key: string]: number
    }
    satisfaction_scores_by_demographic: {
      [key: string]: number
    }
    pay_equity_analysis: {
      gender_pay_gap: number
      ethnicity_pay_gap: number
      adjusted_pay_gap: number
    }
  }
  equity_metrics: {
    hiring_bias_indicators: {
      interview_success_rate_by_demographic: {
        [key: string]: number
      }
      time_to_hire_by_demographic: {
        [key: string]: number
      }
      offer_acceptance_rate_by_demographic: {
        [key: string]: number
      }
    }
    advancement_opportunities: {
      mentorship_participation: {
        [key: string]: number
      }
      leadership_development: {
        [key: string]: number
      }
      high_visibility_projects: {
        [key: string]: number
      }
    }
  }
}

interface HiringQualityMetrics {
  recruitment_effectiveness: {
    time_to_fill: number
    cost_per_hire: number
    source_effectiveness: {
      [key: string]: {
        applications: number
        hires: number
        quality_score: number
        cost: number
      }
    }
    candidate_experience_score: number
  }
  selection_quality: {
    interview_accuracy: number
    assessment_reliability: number
    reference_check_effectiveness: number
    background_check_completion_rate: number
  }
  onboarding_success: {
    new_hire_retention_30_days: number
    new_hire_retention_90_days: number
    time_to_productivity: number
    manager_satisfaction_score: number
    new_hire_satisfaction_score: number
  }
  long_term_outcomes: {
    employee_retention_1_year: number
    employee_retention_2_years: number
    promotion_rate_within_2_years: number
    performance_rating_distribution: {
      exceeds_expectations: number
      meets_expectations: number
      below_expectations: number
    }
    employee_engagement_score: number
  }
}

interface AnalyticsData {
  dei_metrics: DEIMetrics
  hiring_quality: HiringQualityMetrics
  trends: {
    monthly_hiring: Array<{
      month: string
      hires: number
      diversity_index: number
      quality_score: number
    }>
    quarterly_performance: Array<{
      quarter: string
      retention_rate: number
      satisfaction_score: number
      productivity_metric: number
    }>
  }
  benchmarks: {
    industry_averages: {
      diversity_index: number
      retention_rate: number
      time_to_fill: number
      cost_per_hire: number
    }
    company_goals: {
      diversity_target: number
      retention_target: number
      satisfaction_target: number
      productivity_target: number
    }
  }
}

export default function AdvancedAnalytics() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('12_months')
  const [selectedMetric, setSelectedMetric] = useState('overview')

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user, selectedTimeframe])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Mock data for now - replace with actual API calls
      setAnalyticsData({
        dei_metrics: {
          diversity_metrics: {
            gender_distribution: {
              male: 45,
              female: 50,
              non_binary: 3,
              prefer_not_to_say: 2
            },
            ethnicity_distribution: {
              'White': 60,
              'Asian': 20,
              'Hispanic/Latino': 10,
              'Black/African American': 7,
              'Other': 3
            },
            age_distribution: {
              '18-25': 15,
              '26-35': 40,
              '36-45': 30,
              '46-55': 12,
              '55+': 3
            },
            education_background: {
              'Bachelor\'s Degree': 65,
              'Master\'s Degree': 25,
              'PhD': 5,
              'Associate Degree': 3,
              'High School': 2
            },
            geographic_distribution: {
              'North America': 70,
              'Europe': 15,
              'Asia': 10,
              'Other': 5
            }
          },
          inclusion_metrics: {
            retention_rate_by_demographic: {
              'Overall': 85,
              'Female': 88,
              'Male': 82,
              'Underrepresented Minorities': 83,
              'LGBTQ+': 87
            },
            promotion_rate_by_demographic: {
              'Overall': 25,
              'Female': 28,
              'Male': 22,
              'Underrepresented Minorities': 24,
              'LGBTQ+': 26
            },
            satisfaction_scores_by_demographic: {
              'Overall': 4.2,
              'Female': 4.3,
              'Male': 4.1,
              'Underrepresented Minorities': 4.2,
              'LGBTQ+': 4.4
            },
            pay_equity_analysis: {
              gender_pay_gap: 2.3,
              ethnicity_pay_gap: 3.1,
              adjusted_pay_gap: 1.2
            }
          },
          equity_metrics: {
            hiring_bias_indicators: {
              interview_success_rate_by_demographic: {
                'Overall': 35,
                'Female': 38,
                'Male': 32,
                'Underrepresented Minorities': 33,
                'LGBTQ+': 36
              },
              time_to_hire_by_demographic: {
                'Overall': 28,
                'Female': 26,
                'Male': 30,
                'Underrepresented Minorities': 29,
                'LGBTQ+': 27
              },
              offer_acceptance_rate_by_demographic: {
                'Overall': 78,
                'Female': 82,
                'Male': 74,
                'Underrepresented Minorities': 76,
                'LGBTQ+': 80
              }
            },
            advancement_opportunities: {
              mentorship_participation: {
                'Overall': 60,
                'Female': 65,
                'Male': 55,
                'Underrepresented Minorities': 58,
                'LGBTQ+': 62
              },
              leadership_development: {
                'Overall': 40,
                'Female': 45,
                'Male': 35,
                'Underrepresented Minorities': 38,
                'LGBTQ+': 42
              },
              high_visibility_projects: {
                'Overall': 55,
                'Female': 58,
                'Male': 52,
                'Underrepresented Minorities': 54,
                'LGBTQ+': 56
              }
            }
          }
        },
        hiring_quality: {
          recruitment_effectiveness: {
            time_to_fill: 28,
            cost_per_hire: 4500,
            source_effectiveness: {
              'LinkedIn': { applications: 150, hires: 12, quality_score: 4.2, cost: 2000 },
              'Employee Referrals': { applications: 45, hires: 8, quality_score: 4.6, cost: 500 },
              'University Recruiting': { applications: 80, hires: 5, quality_score: 3.8, cost: 3000 },
              'Job Boards': { applications: 200, hires: 6, quality_score: 3.5, cost: 1500 }
            },
            candidate_experience_score: 4.3
          },
          selection_quality: {
            interview_accuracy: 78,
            assessment_reliability: 82,
            reference_check_effectiveness: 85,
            background_check_completion_rate: 98
          },
          onboarding_success: {
            new_hire_retention_30_days: 95,
            new_hire_retention_90_days: 88,
            time_to_productivity: 45,
            manager_satisfaction_score: 4.1,
            new_hire_satisfaction_score: 4.2
          },
          long_term_outcomes: {
            employee_retention_1_year: 85,
            employee_retention_2_years: 72,
            promotion_rate_within_2_years: 25,
            performance_rating_distribution: {
              exceeds_expectations: 35,
              meets_expectations: 55,
              below_expectations: 10
            },
            employee_engagement_score: 4.2
          }
        },
        trends: {
          monthly_hiring: [
            { month: 'Jan 2024', hires: 8, diversity_index: 0.72, quality_score: 4.1 },
            { month: 'Feb 2024', hires: 12, diversity_index: 0.75, quality_score: 4.2 },
            { month: 'Mar 2024', hires: 15, diversity_index: 0.78, quality_score: 4.3 },
            { month: 'Apr 2024', hires: 10, diversity_index: 0.76, quality_score: 4.2 },
            { month: 'May 2024', hires: 18, diversity_index: 0.80, quality_score: 4.4 },
            { month: 'Jun 2024', hires: 14, diversity_index: 0.82, quality_score: 4.3 }
          ],
          quarterly_performance: [
            { quarter: 'Q1 2024', retention_rate: 82, satisfaction_score: 4.0, productivity_metric: 85 },
            { quarter: 'Q2 2024', retention_rate: 85, satisfaction_score: 4.2, productivity_metric: 88 },
            { quarter: 'Q3 2024', retention_rate: 87, satisfaction_score: 4.3, productivity_metric: 90 }
          ]
        },
        benchmarks: {
          industry_averages: {
            diversity_index: 0.65,
            retention_rate: 78,
            time_to_fill: 35,
            cost_per_hire: 5200
          },
          company_goals: {
            diversity_target: 0.80,
            retention_target: 90,
            satisfaction_target: 4.5,
            productivity_target: 95
          }
        }
      })

    } catch (error) {
      console.error('Error fetching analytics data:', error)
      showToast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number, isPercentage = false) => {
    const maxScore = isPercentage ? 100 : 5
    const normalizedScore = score / maxScore
    
    if (normalizedScore >= 0.8) return 'text-green-600 bg-green-100'
    if (normalizedScore >= 0.6) return 'text-blue-600 bg-blue-100'
    if (normalizedScore >= 0.4) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  const exportAnalyticsReport = () => {
    if (!analyticsData) return

    const report = {
      ...analyticsData,
      generated_at: new Date().toISOString(),
      timeframe: selectedTimeframe,
      insights: generateInsights(analyticsData)
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `advanced-analytics-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
    showToast.success('Analytics report downloaded')
  }

  const generateInsights = (data: AnalyticsData) => {
    const insights = []
    
    // DEI Insights
    if (data.dei_metrics.inclusion_metrics.pay_equity_analysis.adjusted_pay_gap < 2) {
      insights.push('✅ Pay equity is within acceptable range')
    } else {
      insights.push('⚠️ Pay equity gap needs attention')
    }

    if (data.dei_metrics.inclusion_metrics.retention_rate_by_demographic['Female'] > 
        data.dei_metrics.inclusion_metrics.retention_rate_by_demographic['Male']) {
      insights.push('✅ Female retention rate is higher than male retention rate')
    }

    // Hiring Quality Insights
    if (data.hiring_quality.recruitment_effectiveness.time_to_fill < 30) {
      insights.push('✅ Time to fill is below industry average')
    } else {
      insights.push('⚠️ Time to fill could be improved')
    }

    if (data.hiring_quality.long_term_outcomes.employee_retention_1_year > 80) {
      insights.push('✅ Strong 1-year retention rate')
    }

    return insights
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600 mt-1">
            DEI outcomes, hiring quality metrics, and performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnalyticsReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diversity Index</p>
                <p className="text-2xl font-bold text-primary">0.78</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+5% vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-primary">85%</p>
              </div>
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+3% vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time to Fill</p>
                <p className="text-2xl font-bold text-primary">28 days</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">-7 days vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost per Hire</p>
                <p className="text-2xl font-bold text-primary">$4,500</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">-$700 vs last quarter</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="dei" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dei">DEI Analytics</TabsTrigger>
          <TabsTrigger value="hiring">Hiring Quality</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>

        {/* DEI Analytics Tab */}
        <TabsContent value="dei" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diversity Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Diversity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Gender Distribution */}
                <div>
                  <h4 className="font-semibold mb-3">Gender Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.dei_metrics.diversity_metrics.gender_distribution).map(([gender, percentage]) => (
                      <div key={gender} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{gender.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm font-medium w-8">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ethnicity Distribution */}
                <div>
                  <h4 className="font-semibold mb-3">Ethnicity Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.dei_metrics.diversity_metrics.ethnicity_distribution).map(([ethnicity, percentage]) => (
                      <div key={ethnicity} className="flex items-center justify-between">
                        <span className="text-sm">{ethnicity}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm font-medium w-8">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inclusion Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Inclusion Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Retention by Demographic */}
                <div>
                  <h4 className="font-semibold mb-3">Retention Rate by Demographic</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.dei_metrics.inclusion_metrics.retention_rate_by_demographic).map(([demographic, rate]) => (
                      <div key={demographic} className="flex items-center justify-between">
                        <span className="text-sm">{demographic}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={rate} className="w-20 h-2" />
                          <span className="text-sm font-medium w-8">{rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pay Equity */}
                <div>
                  <h4 className="font-semibold mb-3">Pay Equity Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gender Pay Gap</span>
                      <Badge className={getScoreColor(100 - analyticsData.dei_metrics.inclusion_metrics.pay_equity_analysis.gender_pay_gap * 10, true)}>
                        {analyticsData.dei_metrics.inclusion_metrics.pay_equity_analysis.gender_pay_gap}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ethnicity Pay Gap</span>
                      <Badge className={getScoreColor(100 - analyticsData.dei_metrics.inclusion_metrics.pay_equity_analysis.ethnicity_pay_gap * 10, true)}>
                        {analyticsData.dei_metrics.inclusion_metrics.pay_equity_analysis.ethnicity_pay_gap}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Adjusted Pay Gap</span>
                      <Badge className={getScoreColor(100 - analyticsData.dei_metrics.inclusion_metrics.pay_equity_analysis.adjusted_pay_gap * 10, true)}>
                        {analyticsData.dei_metrics.inclusion_metrics.pay_equity_analysis.adjusted_pay_gap}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equity Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Equity & Advancement Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hiring Bias Indicators */}
                <div>
                  <h4 className="font-semibold mb-3">Hiring Bias Indicators</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Interview Success Rate</p>
                      <div className="space-y-2">
                        {Object.entries(analyticsData.dei_metrics.equity_metrics.hiring_bias_indicators.interview_success_rate_by_demographic).map(([demographic, rate]) => (
                          <div key={demographic} className="flex items-center justify-between">
                            <span className="text-sm">{demographic}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={rate} className="w-20 h-2" />
                              <span className="text-sm font-medium w-8">{rate}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advancement Opportunities */}
                <div>
                  <h4 className="font-semibold mb-3">Advancement Opportunities</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Mentorship Participation</p>
                      <div className="space-y-2">
                        {Object.entries(analyticsData.dei_metrics.equity_metrics.advancement_opportunities.mentorship_participation).map(([demographic, rate]) => (
                          <div key={demographic} className="flex items-center justify-between">
                            <span className="text-sm">{demographic}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={rate} className="w-20 h-2" />
                              <span className="text-sm font-medium w-8">{rate}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hiring Quality Tab */}
        <TabsContent value="hiring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recruitment Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recruitment Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Time to Fill</p>
                    <p className="text-2xl font-bold text-primary">{analyticsData.hiring_quality.recruitment_effectiveness.time_to_fill} days</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Cost per Hire</p>
                    <p className="text-2xl font-bold text-primary">${analyticsData.hiring_quality.recruitment_effectiveness.cost_per_hire.toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Candidate Experience Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={analyticsData.hiring_quality.recruitment_effectiveness.candidate_experience_score * 20} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{analyticsData.hiring_quality.recruitment_effectiveness.candidate_experience_score}/5</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Source Effectiveness</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.hiring_quality.recruitment_effectiveness.source_effectiveness).map(([source, data]) => (
                      <div key={source} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{source}</p>
                          <p className="text-xs text-gray-600">{data.hires} hires from {data.applications} applications</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getScoreColor(data.quality_score)}>
                            {data.quality_score}/5
                          </Badge>
                          <p className="text-xs text-gray-600">${data.cost}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Quality */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Selection Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Interview Accuracy</p>
                    <div className="flex items-center gap-2">
                      <Progress value={analyticsData.hiring_quality.selection_quality.interview_accuracy} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{analyticsData.hiring_quality.selection_quality.interview_accuracy}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Assessment Reliability</p>
                    <div className="flex items-center gap-2">
                      <Progress value={analyticsData.hiring_quality.selection_quality.assessment_reliability} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{analyticsData.hiring_quality.selection_quality.assessment_reliability}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reference Check Effectiveness</p>
                    <div className="flex items-center gap-2">
                      <Progress value={analyticsData.hiring_quality.selection_quality.reference_check_effectiveness} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{analyticsData.hiring_quality.selection_quality.reference_check_effectiveness}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Background Check Completion</p>
                    <div className="flex items-center gap-2">
                      <Progress value={analyticsData.hiring_quality.selection_quality.background_check_completion_rate} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{analyticsData.hiring_quality.selection_quality.background_check_completion_rate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Long-term Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Long-term Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Retention Rates</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">1 Year</span>
                      <div className="flex items-center gap-2">
                        <Progress value={analyticsData.hiring_quality.long_term_outcomes.employee_retention_1_year} className="w-20 h-2" />
                        <span className="text-sm font-medium w-8">{analyticsData.hiring_quality.long_term_outcomes.employee_retention_1_year}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">2 Years</span>
                      <div className="flex items-center gap-2">
                        <Progress value={analyticsData.hiring_quality.long_term_outcomes.employee_retention_2_years} className="w-20 h-2" />
                        <span className="text-sm font-medium w-8">{analyticsData.hiring_quality.long_term_outcomes.employee_retention_2_years}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Performance Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.hiring_quality.long_term_outcomes.performance_rating_distribution).map(([rating, percentage]) => (
                      <div key={rating} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{rating.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm font-medium w-8">{percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Engagement & Growth</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Employee Engagement</p>
                      <div className="flex items-center gap-2">
                        <Progress value={analyticsData.hiring_quality.long_term_outcomes.employee_engagement_score * 20} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{analyticsData.hiring_quality.long_term_outcomes.employee_engagement_score}/5</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Promotion Rate (2 years)</p>
                      <div className="flex items-center gap-2">
                        <Progress value={analyticsData.hiring_quality.long_term_outcomes.promotion_rate_within_2_years} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{analyticsData.hiring_quality.long_term_outcomes.promotion_rate_within_2_years}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends & Insights Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Hiring Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Hiring Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.trends.monthly_hiring.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{month.month}</p>
                        <p className="text-xs text-gray-600">{month.hires} hires</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Diversity</p>
                          <Badge className={getScoreColor(month.diversity_index * 100, true)}>
                            {month.diversity_index.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Quality</p>
                          <Badge className={getScoreColor(month.quality_score)}>
                            {month.quality_score}/5
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Quarterly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.trends.quarterly_performance.map((quarter, index) => (
                    <div key={quarter.quarter} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">{quarter.quarter}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Retention</p>
                          <div className="flex items-center justify-center gap-1">
                            <Progress value={quarter.retention_rate} className="w-12 h-2" />
                            <span className="text-sm font-medium">{quarter.retention_rate}%</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Satisfaction</p>
                          <div className="flex items-center justify-center gap-1">
                            <Progress value={quarter.satisfaction_score * 20} className="w-12 h-2" />
                            <span className="text-sm font-medium">{quarter.satisfaction_score}/5</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Productivity</p>
                          <div className="flex items-center justify-center gap-1">
                            <Progress value={quarter.productivity_metric} className="w-12 h-2" />
                            <span className="text-sm font-medium">{quarter.productivity_metric}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benchmarks & Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Benchmarks & Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Industry Benchmarks</h4>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.benchmarks.industry_averages).map(([metric, value]) => (
                      <div key={metric} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{metric.replace('_', ' ')}</span>
                        <Badge variant="outline">
                          {typeof value === 'number' ? (metric.includes('cost') ? `$${value.toLocaleString()}` : 
                            metric.includes('time') ? `${value} days` : 
                            metric.includes('index') ? value.toFixed(2) : `${value}%`) : value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Company Goals</h4>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.benchmarks.company_goals).map(([goal, target]) => (
                      <div key={goal} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{goal.replace('_', ' ')}</span>
                        <Badge className="bg-primary/10 text-primary">
                          {typeof target === 'number' ? (goal.includes('target') ? `${target}%` : target.toFixed(1)) : target}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Key Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generateInsights(analyticsData).map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Analytics Insights:</strong> Use these metrics to identify areas for improvement in your hiring process, 
          track progress toward DEI goals, and ensure high-quality candidate selection and retention.
        </AlertDescription>
      </Alert>
    </div>
  )
}
