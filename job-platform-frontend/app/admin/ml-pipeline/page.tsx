'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { getApiUrl } from '@/lib/config';
import { 
  Settings, 
  PlayCircle, 
  PauseCircle, 
  RefreshCw, 
  Database, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface PipelineStatus {
  pipeline: {
    status: string;
    lastUpdate: string;
    version: string;
  };
  models: Array<{
    name: string;
    displayName: string;
    status: string;
    version: string;
    accuracy: number;
    lastTrained: string;
    nextTraining: string;
  }>;
  dataStats: {
    totalApplications: number;
    trainingSamples: number;
    testSamples: number;
    lastDataUpdate: string;
  };
  performance: {
    avgPredictionTime: string;
    successRate: number;
    dailyPredictions: number;
    weeklyPredictions: number;
  };
}

interface ModelHistory {
  model_name: string;
  versions: Array<{
    version: string;
    trained_at: string;
    accuracy: number;
    status: string;
  }>;
  performance_trend: Array<{
    date: string;
    accuracy: number;
    f1_score: number;
  }>;
}

export default function MLPipelineManagement() {
  const { user } = useAuth();
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const [modelHistory, setModelHistory] = useState<{ [key: string]: ModelHistory }>({});
  const [loading, setLoading] = useState(true);
  const [trainingModel, setTrainingModel] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('candidate_success');

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadPipelineData();
    }
  }, [user]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);

      // Load pipeline status
      const statusResponse = await fetch(getApiUrl('/ml/pipeline/status'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setPipelineStatus(statusData.status);
      }

      // Load model histories
      const models = ['candidate_success', 'job_matching'];
      const historyPromises = models.map(async (model) => {
        try {
          const response = await fetch(getApiUrl(`/ml/pipeline/history/${model}`), {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            return { model, history: data.history };
          }
        } catch (error) {
          console.error(`Error loading history for ${model}:`, error);
        }
        return null;
      });

      const histories = await Promise.all(historyPromises);
      const historyMap: { [key: string]: ModelHistory } = {};
      histories.forEach((item) => {
        if (item) {
          historyMap[item.model] = item.history;
        }
      });
      setModelHistory(historyMap);

    } catch (error) {
      console.error('Load pipeline data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async (modelName: string) => {
    try {
      setTrainingModel(modelName);
      
      const response = await fetch(getApiUrl(`/ml/pipeline/train/${modelName}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Training started:', data);
        // Refresh data after training
        setTimeout(() => {
          loadPipelineData();
        }, 2000);
      }
    } catch (error) {
      console.error('Train model error:', error);
    } finally {
      setTrainingModel(null);
    }
  };

  const evaluateModel = async (modelName: string) => {
    try {
      const response = await fetch(getApiUrl(`/ml/pipeline/evaluate/${modelName}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Evaluation results:', data);
        alert(`Model evaluation completed. Accuracy: ${(data.evaluation.metrics.accuracy * 100).toFixed(2)}%`);
      }
    } catch (error) {
      console.error('Evaluate model error:', error);
    }
  };

  const deployModel = async (modelName: string, version: string) => {
    try {
      const response = await fetch(getApiUrl(`/ml/pipeline/deploy/${modelName}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ version })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Deployment completed:', data);
        loadPipelineData();
      }
    } catch (error) {
      console.error('Deploy model error:', error);
    }
  };

  const extractTrainingData = async (modelName: string) => {
    try {
      const response = await fetch(getApiUrl(`/ml/pipeline/extract-data/${modelName}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Training data extracted: ${data.samples} samples`);
      }
    } catch (error) {
      console.error('Extract training data error:', error);
    }
  };

  const triggerRetraining = async () => {
    try {
      const response = await fetch(getApiUrl('/ml/pipeline/retrain'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          models: ['candidate_success', 'job_matching']
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Retraining triggered:', data);
        alert(`Retraining completed: ${data.summary.successful} successful, ${data.summary.failed} failed`);
        loadPipelineData();
      }
    } catch (error) {
      console.error('Trigger retraining error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'training':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
        return 'bg-green-500';
      case 'training':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only super administrators can access the ML Pipeline Management.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const performanceData = modelHistory[selectedModel]?.performance_trend || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">ML Pipeline Management</h1>
          <p className="text-muted-foreground">Manage and monitor machine learning models</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Pipeline Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pipeline Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {pipelineStatus.pipeline.status.toUpperCase()}
                    </div>
                    <p className="text-sm text-muted-foreground">Pipeline Status</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {pipelineStatus.models.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Models</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {pipelineStatus.dataStats.trainingSamples.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Training Samples</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {pipelineStatus.performance.dailyPredictions}
                    </div>
                    <p className="text-sm text-muted-foreground">Daily Predictions</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelineStatus?.models.map((model) => (
              <Card key={model.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{model.displayName}</CardTitle>
                  {getStatusIcon(model.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(model.accuracy * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                  <div className="mt-4">
                    <Badge className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      v{model.version}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Next training: {new Date(model.nextTraining).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Management</CardTitle>
              <CardDescription>Deploy, evaluate, and manage ML models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineStatus?.models.map((model) => (
                  <div key={model.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{model.displayName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Version {model.version} • Accuracy: {(model.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => evaluateModel(model.name)}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Evaluate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deployModel(model.name, model.version)}
                        disabled={model.status === 'deployed'}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Deploy
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => extractTrainingData(model.name)}
                      >
                        <Database className="h-4 w-4 mr-1" />
                        Extract Data
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Training</CardTitle>
              <CardDescription>Train and retrain machine learning models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Individual Model Training */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Individual Model Training</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pipelineStatus?.models.map((model) => (
                      <div key={model.name} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{model.displayName}</h4>
                          {trainingModel === model.name && (
                            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Current accuracy: {(model.accuracy * 100).toFixed(1)}%
                        </p>
                        <Button
                          onClick={() => trainModel(model.name)}
                          disabled={trainingModel === model.name}
                          className="w-full"
                        >
                          {trainingModel === model.name ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Training...
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Train Model
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Batch Retraining */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Batch Retraining</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground mb-4">
                        Retrain all models with the latest data. This process may take several minutes.
                      </p>
                      <Button onClick={triggerRetraining} className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retrain All Models
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>Track model performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Model Selection */}
                <div>
                  <label className="text-sm font-medium">Select Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md max-w-xs"
                  >
                    <option value="candidate_success">Candidate Success Predictor</option>
                    <option value="job_matching">Job-Candidate Matcher</option>
                  </select>
                </div>

                {/* Performance Chart */}
                {performanceData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Performance Trend</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="accuracy" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.3}
                          name="Accuracy"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="f1_score" 
                          stroke="#82ca9d" 
                          fill="#82ca9d" 
                          fillOpacity={0.3}
                          name="F1 Score"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Model Versions */}
                {modelHistory[selectedModel] && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Model Versions</h3>
                    <div className="space-y-2">
                      {modelHistory[selectedModel].versions.map((version) => (
                        <div key={version.version} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">Version {version.version}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              Accuracy: {(version.accuracy * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(version.status)}>
                              {version.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(version.trained_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
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
