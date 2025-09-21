'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Info,
  Save,
  RefreshCw
} from 'lucide-react';
import { showToast } from '@/lib/toast';

interface BiasReductionSettings {
  automatic_processing: boolean;
  consistency_monitoring: boolean;
  fallback_processing: boolean;
  openai_api_key_configured: boolean;
  consistency_threshold: number;
  processing_timeout: number;
  max_retries: number;
}

export default function BiasReductionSettings() {
  const [settings, setSettings] = useState<BiasReductionSettings>({
    automatic_processing: true,
    consistency_monitoring: true,
    fallback_processing: true,
    openai_api_key_configured: false,
    consistency_threshold: 70,
    processing_timeout: 30000,
    max_retries: 3
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from an API
      // For now, we'll use the default settings
      console.log('Loading bias reduction settings...');
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // In a real implementation, this would save to an API
      console.log('Saving bias reduction settings:', settings);
      showToast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testOpenAIConnection = async () => {
    try {
      showToast.loading('Testing OpenAI connection...');
      
      // Test with a simple request
      const response = await fetch('/api/bias-reduction/process-endorsement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          endorsementId: 'test-uuid',
          text: 'Test text for OpenAI connection',
          processingType: 'anonymization'
        })
      });

      if (response.ok) {
        showToast.success('OpenAI connection successful');
        setSettings(prev => ({ ...prev, openai_api_key_configured: true }));
      } else {
        showToast.error('OpenAI connection failed');
        setSettings(prev => ({ ...prev, openai_api_key_configured: false }));
      }
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      showToast.error('OpenAI connection test failed');
      setSettings(prev => ({ ...prev, openai_api_key_configured: false }));
    }
  };

  const handleSettingChange = (key: keyof BiasReductionSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Bias Reduction Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Configure bias reduction system parameters and behavior
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>OpenAI Integration</span>
              </div>
              <Badge className={settings.openai_api_key_configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {settings.openai_api_key_configured ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Automatic Processing</span>
              </div>
              <Badge className={settings.automatic_processing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {settings.automatic_processing ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
          
          {!settings.openai_api_key_configured && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                OpenAI API key is not configured. Add your API key to the environment variables to enable 
                advanced bias reduction features. Fallback processing will be used in the meantime.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Settings</CardTitle>
          <CardDescription>
            Configure how bias reduction processing works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="automatic-processing">Automatic Processing</Label>
                <p className="text-sm text-gray-500">
                  Automatically process all new endorsements for bias reduction
                </p>
              </div>
              <Switch
                id="automatic-processing"
                checked={settings.automatic_processing}
                onCheckedChange={(checked) => handleSettingChange('automatic_processing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="consistency-monitoring">Consistency Monitoring</Label>
                <p className="text-sm text-gray-500">
                  Monitor reviewer rating patterns for consistency
                </p>
              </div>
              <Switch
                id="consistency-monitoring"
                checked={settings.consistency_monitoring}
                onCheckedChange={(checked) => handleSettingChange('consistency_monitoring', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="fallback-processing">Fallback Processing</Label>
                <p className="text-sm text-gray-500">
                  Use regex-based anonymization when OpenAI is unavailable
                </p>
              </div>
              <Switch
                id="fallback-processing"
                checked={settings.fallback_processing}
                onCheckedChange={(checked) => handleSettingChange('fallback_processing', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threshold Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Threshold Settings</CardTitle>
          <CardDescription>
            Configure consistency and processing thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="consistency-threshold">Consistency Threshold</Label>
              <Input
                id="consistency-threshold"
                type="number"
                min="0"
                max="100"
                value={settings.consistency_threshold}
                onChange={(e) => handleSettingChange('consistency_threshold', parseInt(e.target.value))}
              />
              <p className="text-sm text-gray-500">
                Minimum consistency score (0-100) to consider a reviewer consistent
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processing-timeout">Processing Timeout (ms)</Label>
              <Input
                id="processing-timeout"
                type="number"
                min="1000"
                max="60000"
                value={settings.processing_timeout}
                onChange={(e) => handleSettingChange('processing_timeout', parseInt(e.target.value))}
              />
              <p className="text-sm text-gray-500">
                Maximum time to wait for OpenAI processing
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-retries">Max Retries</Label>
              <Input
                id="max-retries"
                type="number"
                min="1"
                max="5"
                value={settings.max_retries}
                onChange={(e) => handleSettingChange('max_retries', parseInt(e.target.value))}
              />
              <p className="text-sm text-gray-500">
                Maximum number of retry attempts for failed processing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>OpenAI Configuration</CardTitle>
          <CardDescription>
            Configure OpenAI API settings for advanced bias reduction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              To configure OpenAI API key, add <code>OPENAI_API_KEY=your_key_here</code> to your 
              environment variables and restart the server.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Button onClick={testOpenAIConnection} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Test OpenAI Connection
            </Button>
            
            <div className="text-sm text-gray-500">
              Status: {settings.openai_api_key_configured ? (
                <span className="text-green-600 font-medium">Connected</span>
              ) : (
                <span className="text-red-600 font-medium">Not Connected</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">NLP Anonymization</h4>
                <p className="text-sm text-blue-700">
                  Removes personal names, gendered pronouns, and biased terms from endorsement text
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Sentiment Normalization</h4>
                <p className="text-sm text-green-700">
                  Balances emotional language and ensures professional tone
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Consistency Monitoring</h4>
                <p className="text-sm text-yellow-700">
                  Tracks reviewer rating patterns and flags inconsistent behavior
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Fallback Processing</h4>
                <p className="text-sm text-purple-700">
                  Uses regex-based anonymization when OpenAI is unavailable
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
