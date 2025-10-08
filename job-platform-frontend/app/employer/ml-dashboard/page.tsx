'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';
import { getApiUrl } from '@/lib/config';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Zap, 
  BarChart3, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Star
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ModelMetrics {
  models: {
    candidateSuccess: {
      name: string;
      accuracy: number;
      precision: number;
      recall: number;
      status: string;
      lastTrained: string;
    };
    jobMatching: {
      name: string;
      accuracy: number;
      precision: number;
      recall: number;
      status: string;
      lastTrained: string;
    };
    retentionPredictor: {
      name: string;
      accuracy: number;
      precision: number;
      recall: number;
      status: string;
      lastTrained: string;
    };
  };
  usage: {
    totalPredictions: number;
    successPredictions: number;
    compatibilityScores: number;
    retentionPredictions: number;
    nlpAnalyses: number;
  };
  performance: {
    averageResponseTime: string;
    successRate: number;
    errorRate: number;
  };
}

interface CandidateMatch {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  compatibilityScore: number;
  successProbability: number;
  recommendation: string;
  appliedAt: string;
  status: string;
}

export default function MLDashboard() {
  const { user } = useAuth();
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [topMatches, setTopMatches] = useState<CandidateMatch[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nlpText, setNlpText] = useState('');
  const [nlpAnalysis, setNlpAnalysis] = useState<any>(null);
  const [nlpLoading, setNlpLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'employer' || user?.role === 'team_member') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load model metrics
      const metricsResponse = await fetch(getApiUrl('/ml/model-metrics'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setModelMetrics(metricsData.metrics);
      }

      // Load employer jobs for candidate matching
      const jobsResponse = await fetch(getApiUrl('/employer/jobs'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs || []);
        
        // Auto-select first job if available
        if (jobsData.jobs && jobsData.jobs.length > 0) {
          setSelectedJobId(jobsData.jobs[0].id);
          loadTopMatches(jobsData.jobs[0].id);
        }
      }

    } catch (error) {
      console.error('Load ML dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopMatches = async (jobId: string) => {
    try {
      const response = await fetch(getApiUrl(`/ml/top-matches/${jobId}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTopMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Load top matches error:', error);
    }
  };

  const performNLPAnalysis = async () => {
    if (!nlpText.trim()) return;

    try {
      setNlpLoading(true);
      const response = await fetch(getApiUrl('/ml/nlp-analysis'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: nlpText,
          analysis_type: 'comprehensive'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNlpAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('NLP analysis error:', error);
    } finally {
      setNlpLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'excellent_match': return 'bg-green-500';
      case 'good_match': return 'bg-blue-500';
      case 'moderate_match': return 'bg-yellow-500';
      case 'poor_match': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'excellent_match': return 'Excellent Match';
      case 'good_match': return 'Good Match';
      case 'moderate_match': return 'Moderate Match';
      case 'poor_match': return 'Poor Match';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const usageData = modelMetrics ? [
    { name: 'Success Predictions', value: modelMetrics.usage.successPredictions },
    { name: 'Compatibility Scores', value: modelMetrics.usage.compatibilityScores },
    { name: 'Retention Predictions', value: modelMetrics.usage.retentionPredictions },
    { name: 'NLP Analyses', value: modelMetrics.usage.nlpAnalyses }
  ] : [];

  const performanceData = modelMetrics ? [
    { name: 'Candidate Success', accuracy: modelMetrics.models.candidateSuccess.accuracy * 100 },
    { name: 'Job Matching', accuracy: modelMetrics.models.jobMatching.accuracy * 100 },
    { name: 'Retention Prediction', accuracy: modelMetrics.models.retentionPredictor.accuracy * 100 }
  ] : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">AI & ML Dashboard</h1>
          <p className="text-muted-foreground">Advanced hiring intelligence and predictions</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="matching">Smart Matching</TabsTrigger>
          <TabsTrigger value="nlp">NLP Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Model Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modelMetrics && Object.entries(modelMetrics.models).map(([key, model]) => (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
                  {model.status === 'active' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(model.accuracy * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precision</span>
                      <span>{(model.precision * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Recall</span>
                      <span>{(model.recall * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {model.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Usage</CardTitle>
                <CardDescription>Prediction requests by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {usageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Accuracy comparison across models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          {modelMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {modelMetrics.performance.averageResponseTime}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(modelMetrics.performance.successRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {modelMetrics.usage.totalPredictions.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Predictions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Candidate Success Predictions
              </CardTitle>
              <CardDescription>
                AI-powered predictions for candidate hiring success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select a job to view candidate success predictions and detailed analysis.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Select Job</label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => {
                      setSelectedJobId(e.target.value);
                      loadTopMatches(e.target.value);
                    }}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Select a job...</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => selectedJobId && loadTopMatches(selectedJobId)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Predictions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Smart Candidate Matching
              </CardTitle>
              <CardDescription>
                AI-powered job-candidate compatibility analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topMatches.length > 0 ? (
                <div className="space-y-4">
                  {topMatches.map((match) => (
                    <div key={match.applicationId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{match.candidateName}</h3>
                          <p className="text-sm text-muted-foreground">{match.candidateEmail}</p>
                        </div>
                        <Badge className={getRecommendationColor(match.recommendation)}>
                          {getRecommendationText(match.recommendation)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Compatibility Score</span>
                            <span className="text-sm font-medium">{match.compatibilityScore}%</span>
                          </div>
                          <Progress value={match.compatibilityScore} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Success Probability</span>
                            <span className="text-sm font-medium">{match.successProbability}%</span>
                          </div>
                          <Progress value={match.successProbability} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                        <span>Applied: {new Date(match.appliedAt).toLocaleDateString()}</span>
                        <Badge variant="outline">{match.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {selectedJobId ? 'No applications found for this job' : 'Select a job to view candidate matches'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nlp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Advanced NLP Analysis
              </CardTitle>
              <CardDescription>
                Deep text analysis for bias detection and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Text to Analyze</label>
                  <textarea
                    value={nlpText}
                    onChange={(e) => setNlpText(e.target.value)}
                    placeholder="Paste job description, cover letter, or any text for analysis..."
                    className="w-full mt-1 p-3 border rounded-md h-32 resize-none"
                  />
                </div>
                
                <Button 
                  onClick={performNLPAnalysis} 
                  disabled={!nlpText.trim() || nlpLoading}
                  className="w-full"
                >
                  {nlpLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Text
                    </>
                  )}
                </Button>

                {nlpAnalysis && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium">Analysis Results</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(nlpAnalysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
