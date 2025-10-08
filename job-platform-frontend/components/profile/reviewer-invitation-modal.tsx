'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Mail, Copy, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ReviewerInvitation, EnhancedSkill } from '@/lib/types';
import { showToast } from '@/lib/toast';

interface ReviewerInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  onSave: () => void;
}

export default function ReviewerInvitationModal({ isOpen, onClose, candidateId, onSave }: ReviewerInvitationModalProps) {
  const [invitations, setInvitations] = useState<ReviewerInvitation[]>([]);
  const [skills, setSkills] = useState<EnhancedSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddInvitation, setShowAddInvitation] = useState(false);

  const [newInvitation, setNewInvitation] = useState({
    reviewer_email: '',
    reviewer_name: '',
    skills_to_review: [] as string[]
  });

  useEffect(() => {
    if (isOpen && candidateId) {
      loadInvitations();
      loadSkills();
    }
  }, [isOpen, candidateId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/candidates/${candidateId}/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/candidates/${candidateId}/skills`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const handleSaveInvitation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/candidates/${candidateId}/invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvitation),
      });

      if (response.ok) {
        const data = await response.json();
        setShowAddInvitation(false);
        setNewInvitation({
          reviewer_email: '',
          reviewer_name: '',
          skills_to_review: []
        });
        loadInvitations();
        onSave();
        
        // Show success message
        showToast.success('Invitation sent successfully!');
      } else {
        const errorData = await response.json();
        showToast.error(errorData.error || 'Failed to create invitation');
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      showToast.error('Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadInvitations();
        onSave();
      } else {
        const errorData = await response.json();
        showToast.error(errorData.error || 'Failed to delete invitation');
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
      showToast.error('Failed to delete invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skillId: string) => {
    setNewInvitation(prev => ({
      ...prev,
      skills_to_review: prev.skills_to_review.includes(skillId)
        ? prev.skills_to_review.filter(id => id !== skillId)
        : [...prev.skills_to_review, skillId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast.success('Link copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reviewer Invitations</h2>
            <p className="text-gray-600">Invite colleagues to review and endorse your skills</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="hover:bg-blue-900 hover:text-white hover:border-blue-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            </div>
          )}

          {!loading && (
            <>
              {/* Add Invitation Button */}
              <div className="mb-6">
                <Button
                  onClick={() => setShowAddInvitation(true)}
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>

              {/* Invitations List */}
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <Card key={invitation.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Mail className="h-4 w-4" />
                            <CardTitle className="text-lg">{invitation.reviewer_email}</CardTitle>
                            <Badge className={getStatusColor(invitation.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(invitation.status)}
                                {invitation.status}
                              </div>
                            </Badge>
                          </div>
                          {invitation.reviewer_name && (
                            <p className="text-gray-600 mb-2">{invitation.reviewer_name}</p>
                          )}
                          <div className="text-sm text-gray-500 mb-2">
                            <p>Expires: {formatDate(invitation.expires_at.toString())}</p>
                            {invitation.completed_at && (
                              <p>Completed: {formatDate(invitation.completed_at.toString())}</p>
                            )}
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-700 mb-1">Skills to review:</p>
                            <div className="flex flex-wrap gap-1">
                              {invitation.skills_to_review.map((skillId: string) => {
                                const skill = skills.find(s => s.id === skillId);
                                return skill ? (
                                  <Badge key={skillId} variant="outline" className="text-xs">
                                    {skill.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(`${window.location.origin}/review-skills/${invitation.invitation_token}`)}
                            className="hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`${window.location.origin}/review-skills/${invitation.invitation_token}`, '_blank')}
                            className="hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInvitation(invitation.id)}
                            className="hover:bg-red-600 hover:text-white hover:border-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}

                {invitations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No invitations sent yet. Invite colleagues to review and endorse your skills.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Add Invitation Form */}
        {showAddInvitation && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Send Reviewer Invitation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reviewer-email">Reviewer Email *</Label>
                  <Input
                    id="reviewer-email"
                    type="email"
                    value={newInvitation.reviewer_email}
                    onChange={(e) => setNewInvitation({ ...newInvitation, reviewer_email: e.target.value })}
                    placeholder="colleague@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="reviewer-name">Reviewer Name (Optional)</Label>
                  <Input
                    id="reviewer-name"
                    value={newInvitation.reviewer_name}
                    onChange={(e) => setNewInvitation({ ...newInvitation, reviewer_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Select Skills to Review *</Label>
                <p className="text-sm text-gray-600 mb-3">Choose which skills you'd like this person to review and endorse.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.id}`}
                        checked={newInvitation.skills_to_review.includes(skill.id)}
                        onCheckedChange={() => handleSkillToggle(skill.id)}
                      />
                      <Label htmlFor={`skill-${skill.id}`} className="text-sm font-normal">
                        {skill.name} ({skill.level})
                      </Label>
                    </div>
                  ))}
                </div>
                {skills.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No skills available. Add some skills first.</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveInvitation}
                disabled={loading || !newInvitation.reviewer_email || newInvitation.skills_to_review.length === 0}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddInvitation(false);
                  setNewInvitation({
                    reviewer_email: '',
                    reviewer_name: '',
                    skills_to_review: []
                  });
                }}
                className="hover:bg-blue-900 hover:text-white hover:border-blue-900"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
