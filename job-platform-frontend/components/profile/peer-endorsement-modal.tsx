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
import { showToast, toastMessages } from '@/lib/toast';

interface PeerEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  onSave: () => void;
}

export default function PeerEndorsementModal({ isOpen, onClose, skillId, skillName, onSave }: PeerEndorsementModalProps) {
  const [endorsements, setEndorsements] = useState<PeerEndorsement[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddEndorsement, setShowAddEndorsement] = useState(false);

  const [newInvitation, setNewInvitation] = useState({
    reviewer_name: '',
    reviewer_email: '',
    message: ''
  });
  const [emailValidationMessage, setEmailValidationMessage] = useState('');

  useEffect(() => {
    if (isOpen && skillId) {
      loadEndorsements();
      loadPendingInvitations();
    }
  }, [isOpen, skillId]);

  const loadEndorsements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/skills/${skillId}/endorsements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Endorsements loaded:', data);
        setEndorsements(data);
      }
    } catch (error) {
      console.error('Error loading endorsements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvitations = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      
      // Get the current user's profile ID
      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return;
      }

      const userProfile = await response.json();
      const candidateId = userProfile.user?.candidateProfile?.id;

      if (!candidateId) {
        return;
      }

      // Get pending invitations for this candidate
      const invitationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/candidates/${candidateId}/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (invitationsResponse.ok) {
        const invitations = await invitationsResponse.json();
        console.log('All invitations loaded:', invitations);
        // Filter for pending invitations that include this skill
        const pendingForThisSkill = invitations.filter((inv: any) => 
          inv.status === 'pending' && 
          inv.skills_to_review && 
          JSON.parse(inv.skills_to_review).includes(skillId)
        );
        console.log('Pending invitations for this skill:', pendingForThisSkill);
        setPendingInvitations(pendingForThisSkill);
      }
    } catch (error) {
      console.error('Error loading pending invitations:', error);
    }
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailValidationMessage('');
      return;
    }

    // Check if invitation already exists for this email
    const existingInvitation = pendingInvitations.find(inv => 
      inv.reviewer_email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingInvitation) {
      setEmailValidationMessage('You are already invited for this invitation to that email, use different');
      return;
    }
    
    // Check if endorsement already exists for this email
    const existingEndorsement = endorsements.find(endorsement => 
      endorsement.endorser_email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingEndorsement) {
      setEmailValidationMessage('This email has already provided an endorsement for this skill, use different');
      return;
    }

    setEmailValidationMessage('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setNewInvitation(prev => ({ ...prev, reviewer_email: email }));
    validateEmail(email);
  };

  const handleSendInvitation = async () => {
    try {
      setLoading(true);
      
      // Check if there's a validation error
      if (emailValidationMessage) {
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('jwt_token');

      // Get the current user's profile ID from the token or context
      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/profile', {
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
        showToast.error('Candidate profile not found. Please make sure you have a candidate profile set up.');
        return;
      }

      // Send invitation
      const invitationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/candidates/${candidateId}/invitations`, {
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
        setEmailValidationMessage('');
        showToast.success('Invitation sent successfully! The reviewer will receive an email with a link to provide their endorsement.');
        loadPendingInvitations(); // Reload pending invitations
        onSave();
      } else {
        const errorData = await invitationResponse.json();
        console.log('Backend error response:', errorData);
        showToast.error(errorData.error || toastMessages.endorsementInvitationError);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      showToast.error(toastMessages.endorsementInvitationError);
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

              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Invitations</h3>
                  <div className="space-y-3">
                    {pendingInvitations.map((invitation) => (
                      <Card key={invitation.id} className="border border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-yellow-600" />
                              <div>
                                <p className="font-medium text-gray-900">{invitation.reviewer_name}</p>
                                <p className="text-sm text-gray-600">{invitation.reviewer_email}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                              Pending
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Endorsements List */}
              <div className="space-y-4">
                {endorsements.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> You cannot send invitations to email addresses that have already provided endorsements for this skill.
                    </p>
                  </div>
                )}
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
                    onChange={handleEmailChange}
                    placeholder="john@example.com"
                    className={emailValidationMessage ? 'border-red-500' : ''}
                  />
                  {emailValidationMessage && (
                    <p className="text-sm text-red-600 mt-1">{emailValidationMessage}</p>
                  )}
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
                disabled={loading || !newInvitation.reviewer_name || !newInvitation.reviewer_email || !!emailValidationMessage}
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
                  setEmailValidationMessage('');
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
