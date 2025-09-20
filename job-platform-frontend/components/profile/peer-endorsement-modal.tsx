'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Star, User, Mail, Building } from 'lucide-react';
import { PeerEndorsement } from '@/lib/types';

interface PeerEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  onSave: () => void;
}

export default function PeerEndorsementModal({ isOpen, onClose, skillId, skillName, onSave }: PeerEndorsementModalProps) {
  const [endorsements, setEndorsements] = useState<PeerEndorsement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddEndorsement, setShowAddEndorsement] = useState(false);

  const [newInvitation, setNewInvitation] = useState({
    reviewer_name: '',
    reviewer_email: '',
    message: ''
  });

  useEffect(() => {
    if (isOpen && skillId) {
      loadEndorsements();
    }
  }, [isOpen, skillId]);

  const loadEndorsements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5000/api/skills/${skillId}/endorsements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEndorsements(data);
      }
    } catch (error) {
      console.error('Error loading endorsements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');

      // Get the current user's profile ID from the token or context
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      const userProfile = await response.json();
      const candidateId = userProfile.user?.candidateProfile?.id;

      if (!candidateId) {
        alert('Candidate profile not found. Please make sure you have a candidate profile set up.');
        return;
      }

      // Send invitation
      const invitationResponse = await fetch(`http://localhost:5000/api/candidates/${candidateId}/invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewer_name: newInvitation.reviewer_name,
          reviewer_email: newInvitation.reviewer_email,
          skills_to_review: [skillId],
          message: newInvitation.message
        }),
      });

      if (invitationResponse.ok) {
        const invitationData = await invitationResponse.json();
        setShowAddEndorsement(false);
        setNewInvitation({
          reviewer_name: '',
          reviewer_email: '',
          message: ''
        });
        alert(`Invitation sent successfully! The reviewer will receive an email with a link to provide their endorsement.`);
        onSave();
      } else {
        const errorData = await invitationResponse.json();
        alert(`Error: ${errorData.error || 'Failed to send invitation'}`);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Peer Endorsements</h2>
            <p className="text-gray-600">Endorsements for: {skillName}</p>
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
              {/* Request Endorsement Button */}
              <div className="mb-6">
                <Button
                  onClick={() => setShowAddEndorsement(true)}
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Request Endorsement
                </Button>
              </div>

              {/* Endorsements List */}
              <div className="space-y-4">
                {endorsements.map((endorsement) => (
                  <Card key={endorsement.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getRelationshipIcon(endorsement.relationship)}
                            <CardTitle className="text-lg">{endorsement.endorser_name}</CardTitle>
                            <Badge className={getLevelColor(endorsement.skill_level)}>
                              {endorsement.skill_level}
                            </Badge>
                            {endorsement.verified && (
                              <Badge className="bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{endorsement.endorser_email}</span>
                            </div>
                            {endorsement.endorser_position && (
                              <>
                                <span>•</span>
                                <span>{endorsement.endorser_position}</span>
                              </>
                            )}
                            {endorsement.endorser_company && (
                              <>
                                <span>•</span>
                                <span>{endorsement.endorser_company}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="capitalize">{endorsement.relationship}</span>
                          </div>
                          <p className="text-gray-700 italic">"{endorsement.endorsement_text}"</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}

                {endorsements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No endorsements yet. Request endorsements from colleagues, managers, or clients to validate your skills.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Request Endorsement Form */}
        {showAddEndorsement && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Request Endorsement</h3>
            <p className="text-gray-600 mb-4">
              Send an invitation to someone who can endorse your {skillName} skills. They will receive an email with a secure link to provide their endorsement.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reviewer-name">Reviewer Name *</Label>
                  <Input
                    id="reviewer-name"
                    value={newInvitation.reviewer_name}
                    onChange={(e) => setNewInvitation({ ...newInvitation, reviewer_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="reviewer-email">Reviewer Email *</Label>
                  <Input
                    id="reviewer-email"
                    type="email"
                    value={newInvitation.reviewer_email}
                    onChange={(e) => setNewInvitation({ ...newInvitation, reviewer_email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={newInvitation.message}
                  onChange={(e) => setNewInvitation({ ...newInvitation, message: e.target.value })}
                  placeholder="Add a personal message to include in the invitation email..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSendInvitation}
                disabled={loading || !newInvitation.reviewer_name || !newInvitation.reviewer_email}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddEndorsement(false);
                  setNewInvitation({
                    reviewer_name: '',
                    reviewer_email: '',
                    message: ''
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
