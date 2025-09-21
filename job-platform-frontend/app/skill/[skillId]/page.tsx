'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, ExternalLink, FileText, Github, Award, Briefcase, Calendar, User, Mail, Building } from 'lucide-react';
import { EnhancedSkill, SkillEvidence, PeerEndorsement } from '@/lib/types';

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [skill, setSkill] = useState<EnhancedSkill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const skillId = params.skillId as string;

  useEffect(() => {
    loadSkillDetails();
  }, [skillId]);

  const loadSkillDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5000/api/skills/${skillId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load skill details');
      }

      const data = await response.json();
      setSkill(data);
    } catch (error) {
      console.error('Error loading skill details:', error);
      setError('Failed to load skill details');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'github': return <Github className="h-3 w-3" />;
      case 'portfolio': return <ExternalLink className="h-3 w-3" />;
      case 'certificate': return <Award className="h-3 w-3" />;
      case 'project': return <Briefcase className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading skill details...</p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Skill not found'}</p>
          <Button onClick={() => router.push('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{skill.name}</h1>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={getLevelColor(skill.level)}>
                    {skill.level}
                  </Badge>
                  {skill.skill_rating && typeof skill.skill_rating === 'number' && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold text-gray-700">
                        {skill.skill_rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">average</span>
                    </div>
                  )}
                  <Badge variant="outline">
                    {skill.taxonomy_source}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-2">{skill.category}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {skill.years_experience} years experience
                  </span>
                  {skill.last_used && (
                    <span>Last used: {formatDate(skill.last_used)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evidence Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Evidence ({skill.evidence?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skill.evidence && skill.evidence.length > 0 ? (
                <div className="space-y-4">
                  {skill.evidence.map((evidence) => (
                    <div key={evidence.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEvidenceIcon(evidence.type)}
                          <h4 className="font-medium text-gray-900">{evidence.title}</h4>
                        </div>
                        <Badge variant="outline">{evidence.type}</Badge>
                      </div>
                      {evidence.description && (
                        <p className="text-sm text-gray-600 mb-3">{evidence.description}</p>
                      )}
                      {evidence.url && (
                        <a 
                          href={evidence.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Evidence
                        </a>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Added {formatDate(evidence.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No evidence added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Endorsements Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Endorsements ({skill.endorsements?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skill.endorsements && skill.endorsements.length > 0 ? (
                <div className="space-y-4">
                  {skill.endorsements.map((endorsement) => (
                    <div key={endorsement.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{endorsement.endorser_name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Badge className={getLevelColor(endorsement.skill_level)}>
                                {endorsement.skill_level}
                              </Badge>
                              <span>•</span>
                              <span className="capitalize">{endorsement.relationship}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < endorsement.star_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">({endorsement.star_rating}/5)</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{endorsement.endorsement_text}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {endorsement.endorser_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {endorsement.endorser_email}
                          </span>
                        )}
                        {endorsement.endorser_company && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {endorsement.endorser_company}
                          </span>
                        )}
                        <span>{formatDate(endorsement.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No endorsements yet</p>
                  <p className="text-sm">Request endorsements from colleagues to build credibility</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
