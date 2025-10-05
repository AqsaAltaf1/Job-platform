'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getApiUrl } from '@/lib/config';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  User, 
  Mail, 
  Calendar, 
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface Prediction {
  successProbability: number;
  strengths: string[];
  concerns: string[];
  recommendation: string;
  confidenceLevel: string;
  reasoning: string;
}

interface Compatibility {
  overallScore: number;
  breakdown: {
    skills: number;
    experience: number;
    culturalFit: number;
    location: number;
    salary: number;
  };
  recommendation: string;
  matchStrengths: string[];
  potentialConcerns: string[];
}

interface Retention {
  retentionProbability: number;
  riskFactors: string[];
  retentionDrivers: string[];
  recommendations: string[];
  confidenceLevel: string;
}

interface SmartMatchingProps {
  applicationId: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  onClose?: () => void;
}

export default function SmartMatching({ 
  applicationId, 
  candidateId, 
  jobId, 
  candidateName, 
  candidateEmail,
  onClose 
}: SmartMatchingProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [compatibility, setCompatibility] = useState<Compatibility | null>(null);
  const [retention, setRetention] = useState<Retention | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prediction' | 'compatibility' | 'retention'>('prediction');

  useEffect(() => {
    loadMLAnalysis();
  }, [candidateId, jobId]);

  const loadMLAnalysis = async () => {
    try {
      setLoading(true);

      // Load all ML analyses in parallel
      const [predictionRes, compatibilityRes, retentionRes] = await Promise.all([
        fetch(getApiUrl(`/ml/predict-success/${candidateId}/${jobId}`), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(getApiUrl(`/ml/compatibility/${candidateId}/${jobId}`), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(getApiUrl(`/ml/predict-retention/${candidateId}/${jobId}`), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (predictionRes.ok) {
        const predictionData = await predictionRes.json();
        setPrediction(predictionData.prediction);
      }

      if (compatibilityRes.ok) {
        const compatibilityData = await compatibilityRes.json();
        setCompatibility(compatibilityData.compatibility);
      }

      if (retentionRes.ok) {
        const retentionData = await retentionRes.json();
        setRetention(retentionData.retention);
      }

    } catch (error) {
      console.error('Load ML analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'hire':
      case 'excellent_match':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'consider':
      case 'good_match':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'moderate_match':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'pass':
      case 'poor_match':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'hire':
      case 'excellent_match':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'consider':
      case 'good_match':
        return <Star className="h-5 w-5 text-blue-600" />;
      case 'moderate_match':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'pass':
      case 'poor_match':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Analyzing candidate with AI...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Candidate Analysis</h2>
            <p className="text-muted-foreground">
              <User className="h-4 w-4 inline mr-1" />
              {candidateName} • <Mail className="h-4 w-4 inline mr-1" />{candidateEmail}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('prediction')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'prediction'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Success Prediction
        </button>
        <button
          onClick={() => setActiveTab('compatibility')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'compatibility'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Star className="h-4 w-4 inline mr-2" />
          Compatibility
        </button>
        <button
          onClick={() => setActiveTab('retention')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'retention'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Retention Prediction
        </button>
      </div>

      {/* Success Prediction Tab */}
      {activeTab === 'prediction' && prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Success Probability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {prediction.successProbability}%
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getRecommendationColor(prediction.recommendation)}`}>
                  {getRecommendationIcon(prediction.recommendation)}
                  <span className="font-medium capitalize">{prediction.recommendation}</span>
                </div>
              </div>
              
              <Progress value={prediction.successProbability} className="h-3 mb-4" />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
              
              <div className="mt-4">
                <div className={`text-sm font-medium ${getConfidenceColor(prediction.confidenceLevel)}`}>
                  Confidence: {prediction.confidenceLevel.toUpperCase()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Key Strengths</h4>
                <ul className="space-y-1">
                  {prediction.strengths.map((strength, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-600 mb-2">Potential Concerns</h4>
                <ul className="space-y-1">
                  {prediction.concerns.map((concern, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>AI Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {prediction.reasoning}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compatibility Tab */}
      {activeTab === 'compatibility' && compatibility && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                Overall Compatibility Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {compatibility.overallScore}%
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getRecommendationColor(compatibility.recommendation)}`}>
                  {getRecommendationIcon(compatibility.recommendation)}
                  <span className="font-medium capitalize">{compatibility.recommendation.replace('_', ' ')}</span>
                </div>
              </div>
              
              <Progress value={compatibility.overallScore} className="h-3" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(compatibility.breakdown).map(([category, score]) => (
              <Card key={category}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{score}%</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <Progress value={score} className="h-2 mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Match Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {compatibility.matchStrengths.map((strength, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Potential Concerns</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {compatibility.potentialConcerns.map((concern, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Retention Prediction Tab */}
      {activeTab === 'retention' && retention && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                12-Month Retention Probability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {retention.retentionProbability}%
                </div>
                <div className={`text-sm font-medium ${getConfidenceColor(retention.confidenceLevel)}`}>
                  Confidence: {retention.confidenceLevel.toUpperCase()}
                </div>
              </div>
              
              <Progress value={retention.retentionProbability} className="h-3 mb-4" />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Low Retention</span>
                <span>High Retention</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Retention Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {retention.retentionDrivers.map((driver, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {driver}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Risk Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {retention.riskFactors.map((risk, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {retention.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <Star className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    {recommendation}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center gap-4">
            <Button onClick={loadMLAnalysis} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              disabled={!prediction || prediction.recommendation === 'pass'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Move to Next Stage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
