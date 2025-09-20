'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Star, ExternalLink, FileText, Github, Award, Briefcase, Eye } from 'lucide-react';
import { EnhancedSkill, SkillEvidence, PeerEndorsement } from '@/lib/types';
import { showToast, toastMessages } from '@/lib/toast';

interface EnhancedSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  onSave: () => void;
  editingSkill?: EnhancedSkill | null;
}

export default function EnhancedSkillsModal({ isOpen, onClose, candidateId, onSave, editingSkill: editingSkillProp }: EnhancedSkillsModalProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<EnhancedSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<EnhancedSkill | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showEndorsementModal, setShowEndorsementModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<EnhancedSkill | null>(null);

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: '',
    taxonomy_source: 'custom' as 'ESCO' | 'O*NET' | 'custom',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    years_experience: 0,
    last_used: ''
  });

  useEffect(() => {
    if (isOpen && candidateId) {
      loadSkills();
    }
  }, [isOpen, candidateId]);

  // Handle editing skill prop
  useEffect(() => {
    if (editingSkillProp) {
      setEditingSkill(editingSkillProp);
      setNewSkill({
        name: editingSkillProp.name,
        category: editingSkillProp.category,
        taxonomy_source: editingSkillProp.taxonomy_source,
        level: editingSkillProp.level,
        years_experience: editingSkillProp.years_experience,
        last_used: editingSkillProp.last_used ? new Date(editingSkillProp.last_used).toISOString().split('T')[0] : ''
      });
      setShowAddSkill(true);
    } else {
      setEditingSkill(null);
      setNewSkill({
        name: '',
        category: '',
        taxonomy_source: 'custom',
        level: 'beginner',
        years_experience: 0,
        last_used: ''
      });
    }
  }, [editingSkillProp]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5000/api/candidates/${candidateId}/skills`, {
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
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSkill = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const skillData = {
        ...newSkill,
        last_used: newSkill.last_used ? new Date(newSkill.last_used).toISOString() : null
      };

      const url = editingSkill 
        ? `http://localhost:5000/api/skills/${editingSkill.id}`
        : `http://localhost:5000/api/candidates/${candidateId}/skills`;
      
      const method = editingSkill ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillData),
      });

      if (response.ok) {
        setShowAddSkill(false);
        setEditingSkill(null);
        setNewSkill({
          name: '',
          category: '',
          taxonomy_source: 'custom',
          level: 'beginner',
          years_experience: 0,
          last_used: ''
        });
        loadSkills();
        onSave();
        showToast.success(editingSkill ? toastMessages.skillUpdatedSuccess : toastMessages.skillAddedSuccess);
      } else {
        const errorData = await response.json();
        showToast.error(errorData.error || toastMessages.skillAddedError);
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      showToast.error(toastMessages.skillAddedError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch(`http://localhost:5000/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadSkills();
        onSave();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete skill'}`);
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSkill = (skill: EnhancedSkill) => {
    setEditingSkill(skill);
    setNewSkill({
      name: skill.name,
      category: skill.category,
      taxonomy_source: skill.taxonomy_source,
      level: skill.level || 'beginner',
      years_experience: skill.years_experience,
      last_used: skill.last_used ? new Date(skill.last_used).toISOString().split('T')[0] : ''
    });
    setShowAddSkill(true);
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

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'work_sample': return <FileText className="h-4 w-4" />;
      case 'github_repo': return <Github className="h-4 w-4" />;
      case 'portfolio_link': return <ExternalLink className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'project': return <Briefcase className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Skills & Competencies</h2>
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
              {/* Add Skill Button */}
              <div className="mb-6">
                <Button
                  onClick={() => setShowAddSkill(true)}
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Core Skill
                </Button>
              </div>

              {/* Skills List */}
              <div className="space-y-4">
                {skills.map((skill) => (
                  <Card key={skill.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{skill.name}</CardTitle>
                            <Badge className={getLevelColor(skill.level)}>
                              {skill.level}
                            </Badge>
                            {skill.skill_rating && typeof skill.skill_rating === 'number' && (
                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-semibold text-yellow-800">
                                  {skill.skill_rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-yellow-600">avg</span>
                              </div>
                            )}
                            <Badge variant="outline">
                              {skill.taxonomy_source}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{skill.category}</span>
                            <span>•</span>
                            <span>{skill.years_experience} years</span>
                            <span>•</span>
                            <span className="text-gray-600">Self-assessed level</span>
                            {skill.skill_rating && typeof skill.skill_rating === 'number' && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="font-medium text-gray-700">
                                    {skill.skill_rating.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-gray-500">avg rating</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/skill/${skill.id}`)}
                            className="hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSkill(skill);
                              setShowEvidenceModal(true);
                            }}
                            className="hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            Evidence
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSkill(skill);
                              setShowEndorsementModal(true);
                            }}
                            className="hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            Endorsements
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSkill(skill)}
                            className="hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="hover:bg-red-600 hover:text-white hover:border-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Rating Summary */}
                      {skill.skill_rating && typeof skill.skill_rating === 'number' && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-yellow-500 fill-current" />
                              <span className="text-lg font-bold text-yellow-800">
                                {skill.skill_rating.toFixed(1)}/5.0
                              </span>
                              <span className="text-sm text-yellow-600">Average Rating</span>
                            </div>
                            <div className="text-sm text-yellow-700">
                              {skill.endorsements?.length || 0} endorsement{(skill.endorsements?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Evidence Preview */}
                      {skill.evidence && skill.evidence.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Evidence:</h4>
                          <div className="flex flex-wrap gap-2">
                            {skill.evidence.slice(0, 3).map((evidence) => (
                              <div key={evidence.id} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded">
                                {getEvidenceIcon(evidence.type)}
                                <span>{evidence.title}</span>
                              </div>
                            ))}
                            {skill.evidence.length > 3 && (
                              <span className="text-xs text-gray-500">+{skill.evidence.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Endorsements Preview */}
                      {skill.endorsements && skill.endorsements.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Endorsements:</h4>
                          <div className="space-y-2">
                            {skill.endorsements.slice(0, 2).map((endorsement, index) => (
                              <div key={index} className="text-xs text-gray-600 border-l-2 border-blue-200 pl-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{endorsement.endorser_name}</span>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < endorsement.star_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <Badge className={getLevelColor(endorsement.skill_level)}>
                                    {endorsement.skill_level}
                                  </Badge>
                                </div>
                                <p className="text-gray-500 mt-1 line-clamp-2">{endorsement.endorsement_text}</p>
                              </div>
                            ))}
                            {skill.endorsements.length > 2 && (
                              <div className="text-xs text-blue-600">
                                +{skill.endorsements.length - 2} more endorsement{skill.endorsements.length - 2 !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {skills.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No skills added yet. Add your core skills to showcase your competencies.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Add/Edit Skill Form */}
        {showAddSkill && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="skill-name">Skill Name</Label>
                <Input
                  id="skill-name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="e.g., React, Python, Project Management"
                />
              </div>
              <div>
                <Label htmlFor="skill-category">Category</Label>
                <Input
                  id="skill-category"
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  placeholder="e.g., Frontend Development, Data Science"
                />
              </div>
              <div>
                <Label htmlFor="taxonomy-source">Taxonomy Source</Label>
                <Select
                  value={newSkill.taxonomy_source}
                  onValueChange={(value: 'ESCO' | 'O*NET' | 'custom') => 
                    setNewSkill({ ...newSkill, taxonomy_source: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="ESCO">ESCO</SelectItem>
                    <SelectItem value="O*NET">O*NET</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="skill-level">Your Skill Level</Label>
                <Select
                  value={newSkill.level}
                  onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'expert') => 
                    setNewSkill({ ...newSkill, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="years-experience">Years of Experience</Label>
                <Input
                  id="years-experience"
                  type="number"
                  min="0"
                  max="50"
                  value={newSkill.years_experience || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setNewSkill({ ...newSkill, years_experience: value === '' ? 0 : parseInt(value) });
                    }
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="last-used">Last Used (Optional)</Label>
                <Input
                  id="last-used"
                  type="date"
                  value={newSkill.last_used}
                  onChange={(e) => setNewSkill({ ...newSkill, last_used: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveSkill}
                disabled={loading || !newSkill.name || !newSkill.category}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                {loading ? 'Saving...' : (editingSkill ? 'Update Skill' : 'Add Skill')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSkill(false);
                  setEditingSkill(null);
                  setNewSkill({
                    name: '',
                    category: '',
                    taxonomy_source: 'custom',
                    level: 'beginner',
                    years_experience: 0,
                    last_used: ''
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
