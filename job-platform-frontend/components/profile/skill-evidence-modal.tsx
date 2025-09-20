'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ExternalLink, FileText, Github, Award, Briefcase, Upload } from 'lucide-react';
import { SkillEvidence } from '@/lib/types';
import { showToast, toastMessages } from '@/lib/toast';

interface SkillEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  onSave: () => void;
}

export default function SkillEvidenceModal({ isOpen, onClose, skillId, skillName, onSave }: SkillEvidenceModalProps) {
  const [evidence, setEvidence] = useState<SkillEvidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<SkillEvidence | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [newEvidence, setNewEvidence] = useState({
    type: 'work_sample' as 'work_sample' | 'github_repo' | 'portfolio_link' | 'certification' | 'project',
    title: '',
    description: '',
    url: '',
    file_url: ''
  });

  useEffect(() => {
    if (isOpen && skillId) {
      loadEvidence();
    }
  }, [isOpen, skillId]);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5000/api/skills/${skillId}/evidence`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvidence(data);
      }
    } catch (error) {
      console.error('Error loading evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file (PDF, DOC, DOCX, TXT, JPG, PNG)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleSaveEvidence = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      let fileUrl = newEvidence.file_url;
      
      // Handle file upload
      if (selectedFile) {
        if (selectedFile.type.startsWith('image/')) {
          fileUrl = await compressImage(selectedFile);
        } else {
          // For non-image files, convert to base64
          const reader = new FileReader();
          fileUrl = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedFile);
          });
        }
      }

      const evidenceData = {
        ...newEvidence,
        file_url: fileUrl
      };

      const url = editingEvidence 
        ? `http://localhost:5000/api/evidence/${editingEvidence.id}`
        : `http://localhost:5000/api/skills/${skillId}/evidence`;
      
      const method = editingEvidence ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evidenceData),
      });

      if (response.ok) {
        setShowAddEvidence(false);
        setEditingEvidence(null);
        setNewEvidence({
          type: 'work_sample',
          title: '',
          description: '',
          url: '',
          file_url: ''
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        loadEvidence();
        onSave();
        showToast.success(editingEvidence ? toastMessages.evidenceUpdatedSuccess : toastMessages.evidenceAddedSuccess);
      } else {
        const errorData = await response.json();
        showToast.error(errorData.error || toastMessages.evidenceAddedError);
      }
    } catch (error) {
      console.error('Error saving evidence:', error);
      showToast.error(toastMessages.evidenceAddedError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!confirm('Are you sure you want to delete this evidence?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch(`http://localhost:5000/api/evidence/${evidenceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadEvidence();
        onSave();
        showToast.success(toastMessages.evidenceDeletedSuccess);
      } else {
        const errorData = await response.json();
        showToast.error(errorData.error || toastMessages.evidenceDeletedError);
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
      showToast.error(toastMessages.evidenceDeletedError);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvidence = (evidence: SkillEvidence) => {
    setEditingEvidence(evidence);
    setNewEvidence({
      type: evidence.type,
      title: evidence.title,
      description: evidence.description || '',
      url: evidence.url || '',
      file_url: evidence.file_url || ''
    });
    setShowAddEvidence(true);
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'work_sample': return 'Work Sample';
      case 'github_repo': return 'GitHub Repository';
      case 'portfolio_link': return 'Portfolio Link';
      case 'certification': return 'Certification';
      case 'project': return 'Project';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Skill Evidence</h2>
            <p className="text-gray-600">Evidence for: {skillName}</p>
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
              {/* Add Evidence Button */}
              <div className="mb-6">
                <Button
                  onClick={() => setShowAddEvidence(true)}
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Evidence
                </Button>
              </div>

              {/* Evidence List */}
              <div className="space-y-4">
                {evidence.map((item) => (
                  <Card key={item.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getEvidenceIcon(item.type)}
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <Badge variant="outline">
                              {getTypeLabel(item.type)}
                            </Badge>
                            {item.verified && (
                              <Badge className="bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Link
                              </a>
                            )}
                            {item.file_url && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                File Attached
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEvidence(item)}
                            className="hover:bg-blue-900 hover:text-white hover:border-blue-900"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvidence(item.id)}
                            className="hover:bg-red-600 hover:text-white hover:border-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}

                {evidence.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No evidence added yet. Add work samples, projects, or certifications to showcase this skill.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Add/Edit Evidence Form */}
        {showAddEvidence && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">
              {editingEvidence ? 'Edit Evidence' : 'Add New Evidence'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="evidence-type">Evidence Type</Label>
                  <Select
                    value={newEvidence.type}
                    onValueChange={(value: 'work_sample' | 'github_repo' | 'portfolio_link' | 'certification' | 'project') => 
                      setNewEvidence({ ...newEvidence, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work_sample">Work Sample</SelectItem>
                      <SelectItem value="github_repo">GitHub Repository</SelectItem>
                      <SelectItem value="portfolio_link">Portfolio Link</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="evidence-title">Title</Label>
                  <Input
                    id="evidence-title"
                    value={newEvidence.title}
                    onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                    placeholder="e.g., React E-commerce App"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="evidence-description">Description</Label>
                <Textarea
                  id="evidence-description"
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                  placeholder="Describe this evidence and how it demonstrates your skill..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="evidence-url">URL (Optional)</Label>
                <Input
                  id="evidence-url"
                  type="url"
                  value={newEvidence.url}
                  onChange={(e) => setNewEvidence({ ...newEvidence, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="evidence-file">Upload File (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="evidence-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-600">
                        Selected: {selectedFile.name}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-700 hover:border-red-600"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {previewUrl && selectedFile?.type.startsWith('image/') && (
                  <div className="mt-2 relative inline-block">
                    <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:border-red-600 bg-white"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveEvidence}
                disabled={loading || !newEvidence.title}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                {loading ? 'Saving...' : (editingEvidence ? 'Update Evidence' : 'Add Evidence')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddEvidence(false);
                  setEditingEvidence(null);
                  setNewEvidence({
                    type: 'work_sample',
                    title: '',
                    description: '',
                    url: '',
                    file_url: ''
                  });
                  setSelectedFile(null);
                  setPreviewUrl(null);
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
