'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, StarIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ReferenceInvitation {
  id: number;
  candidate_id: number;
  reviewer_email: string;
  reviewer_name: string;
  message: string;
  expires_at: string;
  candidate: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface ReferenceData {
  relationship: string;
  relationship_description: string;
  overall_rating: number;
  work_quality_rating: number;
  communication_rating: number;
  reliability_rating: number;
  teamwork_rating: number;
  reference_text: string;
  strengths: string;
  areas_for_improvement: string;
  would_recommend: boolean;
  would_hire_again: boolean;
  years_worked_together: number;
  last_worked_together: string;
}

const StarRating = ({ rating, onRatingChange, label }: { rating: number; onRatingChange: (rating: number) => void; label: string }) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    </div>
  );
};

export default function ReferenceReviewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<ReferenceInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ReferenceData>({
    relationship: '',
    relationship_description: '',
    overall_rating: 0,
    work_quality_rating: 0,
    communication_rating: 0,
    reliability_rating: 0,
    teamwork_rating: 0,
    reference_text: '',
    strengths: '',
    areas_for_improvement: '',
    would_recommend: true,
    would_hire_again: true,
    years_worked_together: 0,
    last_worked_together: ''
  });

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/references/invitation/${token}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.message);
        return;
      }

      setInvitation(result.data);
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ReferenceData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRatingChange = (field: keyof ReferenceData, rating: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/references/submit/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success('Reference submitted successfully!');
      router.push('/reference/thank-you');
    } catch (error) {
      console.error('Error submitting reference:', error);
      toast.error('Failed to submit reference');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reference request...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">{error || 'Invalid invitation'}</p>
            <div className="text-center mt-4">
              <Button onClick={() => router.push('/')} variant="outline">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <span className="font-semibold">{invitation.candidate.first_name} {invitation.candidate.last_name}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This invitation expires on {new Date(invitation.expires_at).toLocaleDateString()}
              </p>
              {invitation.message && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Personal Message:</strong> {invitation.message}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Reference Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Relationship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="relationship">Relationship to Candidate *</Label>
                <Select value={formData.relationship} onValueChange={(value) => handleInputChange('relationship', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="former_manager">Former Manager/Supervisor</SelectItem>
                    <SelectItem value="colleague">Colleague/Co-worker</SelectItem>
                    <SelectItem value="client">Client/Customer</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="relationship_description">Describe Your Working Relationship</Label>
                <Textarea
                  id="relationship_description"
                  value={formData.relationship_description}
                  onChange={(e) => handleInputChange('relationship_description', e.target.value)}
                  placeholder="Please describe your working relationship and how you know this person..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years_worked_together">Years Worked Together</Label>
                  <Input
                    id="years_worked_together"
                    type="number"
                    min="0"
                    value={formData.years_worked_together}
                    onChange={(e) => handleInputChange('years_worked_together', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="last_worked_together">Last Worked Together</Label>
                  <Input
                    id="last_worked_together"
                    type="date"
                    value={formData.last_worked_together}
                    onChange={(e) => handleInputChange('last_worked_together', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Ratings</CardTitle>
              <p className="text-sm text-gray-600">Please rate the candidate on the following criteria (1 = Poor, 5 = Excellent)</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <StarRating
                rating={formData.overall_rating}
                onRatingChange={(rating) => handleRatingChange('overall_rating', rating)}
                label="Overall Performance *"
              />

              <StarRating
                rating={formData.work_quality_rating}
                onRatingChange={(rating) => handleRatingChange('work_quality_rating', rating)}
                label="Work Quality *"
              />

              <StarRating
                rating={formData.communication_rating}
                onRatingChange={(rating) => handleRatingChange('communication_rating', rating)}
                label="Communication Skills *"
              />

              <StarRating
                rating={formData.reliability_rating}
                onRatingChange={(rating) => handleRatingChange('reliability_rating', rating)}
                label="Reliability & Punctuality *"
              />

              <StarRating
                rating={formData.teamwork_rating}
                onRatingChange={(rating) => handleRatingChange('teamwork_rating', rating)}
                label="Teamwork & Collaboration *"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Written Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reference_text">Professional Reference *</Label>
                <Textarea
                  id="reference_text"
                  value={formData.reference_text}
                  onChange={(e) => handleInputChange('reference_text', e.target.value)}
                  placeholder="Please provide a detailed professional reference. Include specific examples of the candidate's work, achievements, and character..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="strengths">Key Strengths</Label>
                <Textarea
                  id="strengths"
                  value={formData.strengths}
                  onChange={(e) => handleInputChange('strengths', e.target.value)}
                  placeholder="What are this person's key strengths and positive qualities?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="areas_for_improvement">Areas for Improvement</Label>
                <Textarea
                  id="areas_for_improvement"
                  value={formData.areas_for_improvement}
                  onChange={(e) => handleInputChange('areas_for_improvement', e.target.value)}
                  placeholder="Are there any areas where this person could improve or develop further?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="would_recommend"
                  checked={formData.would_recommend}
                  onCheckedChange={(checked) => handleInputChange('would_recommend', checked)}
                />
                <Label htmlFor="would_recommend">I would recommend this person for employment</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="would_hire_again"
                  checked={formData.would_hire_again}
                  onCheckedChange={(checked) => handleInputChange('would_hire_again', checked)}
                />
                <Label htmlFor="would_hire_again">I would hire this person again if given the opportunity</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.relationship || !formData.reference_text || formData.overall_rating === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Reference'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}