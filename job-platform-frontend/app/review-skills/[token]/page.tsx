'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, Mail, Building, CheckCircle, AlertCircle } from 'lucide-react';
import { showToast, toastMessages } from '@/lib/toast';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: string; // Set by candidate
  years_experience: number;
}

interface CandidateProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  coreSkills: Skill[];
}

interface Invitation {
  id: string;
  reviewer_name: string;
  reviewer_email: string;
  skills_to_review: string[];
  status: string;
  expires_at: string;
  candidateProfile: CandidateProfile;
}

interface EndorsementData {
  skill_id: string;
  relationship: 'colleague' | 'manager' | 'client' | 'peer' | 'other';
  endorsement_text: string;
  star_rating: number; // 1-5 stars
}

export default function ReviewSkillsPage({ params }: { params: { token: string } }) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [endorsements, setEndorsements] = useState<EndorsementData[]>([]);

  useEffect(() => {
    if (params.token) {
      loadInvitation();
    }
  }, [params.token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/invitations/${params.token}`);
      
      if (response.ok) {
        const data = await response.json();
        setInvitation(data);
        
        // Initialize endorsements for each skill
        const initialEndorsements = data.skills_to_review.map((skillId: string) => ({
          skill_id: skillId,
          relationship: 'colleague' as const,
          endorsement_text: '',
          star_rating: 3 // Default to 3 stars
        }));
        setEndorsements(initialEndorsements);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invitation not found or expired');
      }
    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleEndorsementChange = (skillId: string, field: keyof EndorsementData, value: string) => {
    setEndorsements(prev => 
      prev.map(endorsement => 
        endorsement.skill_id === skillId 
          ? { ...endorsement, [field]: value }
          : endorsement
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/review/${params.token}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endorsements }),
      });

      if (response.ok) {
        setSuccess(true);
        showToast.success(toastMessages.endorsementSubmittedSuccess);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || toastMessages.endorsementSubmittedError;
        setError(errorMessage);
        showToast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = toastMessages.endorsementSubmittedError;
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-gray-100 text-gray-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'manager': return <Building className="h-4 w-4" />;
      case 'colleague': return <User className="h-4 w-4" />;
      case 'client': return <User className="h-4 w-4" />;
      case 'peer': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">
              Your endorsements have been submitted successfully. The candidate will be notified of your feedback.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Not Found</h2>
            <p className="text-gray-600">This invitation link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const candidate = invitation.candidateProfile;
  const skillsToReview = candidate.coreSkills.filter(skill => 
    invitation.skills_to_review.includes(skill.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Professional Reference Request</CardTitle>
            <div className="text-center">
              <p className="text-gray-600">
                You've been invited to provide a professional reference for{' '}
                <span className="font-semibold">{candidate.first_name} {candidate.last_name}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This invitation expires on {new Date(invitation.expires_at).toLocaleDateString()}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Professional Reference Form */}
        <div className="space-y-6">
          {skillsToReview.map((skill) => {
            const endorsement = endorsements.find(e => e.skill_id === skill.id);
            if (!endorsement) return null;

            return (
              <Card key={skill.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Reference for {skill.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getLevelColor(skill.level)}>
                          {skill.level}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {skill.years_experience} years experience
                        </span>
                        <span className="text-sm text-gray-500">
                          (Candidate's self-assessment)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`relationship-${skill.id}`}>Your Relationship *</Label>
                      <Select
                        value={endorsement.relationship}
                        onValueChange={(value: 'colleague' | 'manager' | 'client' | 'peer' | 'other') => 
                          handleEndorsementChange(skill.id, 'relationship', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="colleague">Colleague</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="peer">Peer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Star Rating (1-5) *</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleEndorsementChange(skill.id, 'star_rating', star.toString())}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= endorsement.star_rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({endorsement.star_rating}/5)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`endorsement-text-${skill.id}`}>Endorsement Text *</Label>
                    <Textarea
                      id={`endorsement-text-${skill.id}`}
                      value={endorsement.endorsement_text}
                      onChange={(e) => handleEndorsementChange(skill.id, 'endorsement_text', e.target.value)}
                      placeholder="Describe how you've observed this person's skills and provide specific examples..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmit}
            disabled={submitting || endorsements.some(e => !e.endorsement_text.trim())}
            className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 text-lg"
          >
            {submitting ? 'Submitting...' : 'Submit Endorsements'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
