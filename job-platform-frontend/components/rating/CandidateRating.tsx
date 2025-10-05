'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Save, 
  Send, 
  Trash2, 
  User, 
  Briefcase, 
  MessageSquare,
  TrendingUp,
  Award,
  Target,
  Users,
  Brain,
  Heart,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface Rating {
  id?: string;
  application_id: string;
  interview_id?: string;
  technical_skills?: number;
  technical_skills_notes?: string;
  communication_skills?: number;
  communication_skills_notes?: string;
  problem_solving?: number;
  problem_solving_notes?: string;
  cultural_fit?: number;
  cultural_fit_notes?: string;
  experience_qualifications?: number;
  experience_qualifications_notes?: string;
  leadership_potential?: number;
  leadership_potential_notes?: string;
  overall_comments?: string;
  recommendation?: 'strongly_recommend' | 'recommend' | 'neutral' | 'do_not_recommend';
  rating_type: 'resume_review' | 'phone_screen' | 'technical_interview' | 'behavioral_interview' | 'final_interview';
  status: 'draft' | 'submitted' | 'approved';
  overall_rating?: number;
  created_at?: string;
  rater?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface CandidateRatingProps {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  onRatingSubmitted?: () => void;
  existingRatings?: Rating[];
  interviewId?: string;
}

const ratingCriteria = [
  {
    key: 'technical_skills',
    label: 'Technical Skills',
    icon: Zap,
    description: 'Programming, frameworks, tools, and technical knowledge'
  },
  {
    key: 'communication_skills',
    label: 'Communication',
    icon: MessageSquare,
    description: 'Verbal, written, and presentation skills'
  },
  {
    key: 'problem_solving',
    label: 'Problem Solving',
    icon: Brain,
    description: 'Analytical thinking and solution approach'
  },
  {
    key: 'cultural_fit',
    label: 'Cultural Fit',
    icon: Heart,
    description: 'Alignment with company values and team dynamics'
  },
  {
    key: 'experience_qualifications',
    label: 'Experience & Qualifications',
    icon: Award,
    description: 'Relevant work experience and educational background'
  },
  {
    key: 'leadership_potential',
    label: 'Leadership Potential',
    icon: Users,
    description: 'Ability to lead, mentor, and influence others'
  }
];

const ratingTypes = [
  { value: 'resume_review', label: 'Resume Review' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'technical_interview', label: 'Technical Interview' },
  { value: 'behavioral_interview', label: 'Behavioral Interview' },
  { value: 'final_interview', label: 'Final Interview' }
];

const recommendations = [
  { value: 'strongly_recommend', label: 'Strongly Recommend', color: 'bg-green-100 text-green-800' },
  { value: 'recommend', label: 'Recommend', color: 'bg-blue-100 text-blue-800' },
  { value: 'neutral', label: 'Neutral', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'do_not_recommend', label: 'Do Not Recommend', color: 'bg-red-100 text-red-800' }
];

export default function CandidateRating({ 
  applicationId, 
  candidateName, 
  jobTitle, 
  onRatingSubmitted,
  existingRatings = [],
  interviewId 
}: CandidateRatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('new-rating');
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>(existingRatings);
  
  const [formData, setFormData] = useState<Partial<Rating>>({
    application_id: applicationId,
    interview_id: interviewId,
    rating_type: 'resume_review',
    status: 'draft',
    recommendation: 'neutral'
  });

  useEffect(() => {
    if (isOpen && ratings.length === 0) {
      loadRatings();
    }
  }, [isOpen]);

  const loadRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/applications/${applicationId}/ratings`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const handleCriteriaChange = (criteria: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [criteria]: value
    }));
  };

  const handleNotesChange = (criteria: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      [`${criteria}_notes`]: notes
    }));
  };

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const submitData = {
        ...formData,
        status
      };

      const response = await fetch(getApiUrl(`/applications/${applicationId}/rating`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(status === 'draft' ? 'Rating saved as draft' : 'Rating submitted successfully');
        
        // Refresh ratings
        await loadRatings();
        
        // Reset form for new rating
        setFormData({
          application_id: applicationId,
          interview_id: interviewId,
          rating_type: 'resume_review',
          status: 'draft',
          recommendation: 'neutral'
        });
        
        if (onRatingSubmitted) {
          onRatingSubmitted();
        }
        
        if (status === 'submitted') {
          setIsOpen(false);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to save rating');
    } finally {
      setLoading(false);
    }
  };

  const getOverallRating = () => {
    const scores = ratingCriteria
      .map(criteria => formData[criteria.key as keyof Rating] as number)
      .filter(score => score && score > 0);
    
    if (scores.length === 0) return 0;
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
  };

  const RatingSlider = ({ criteria }: { criteria: typeof ratingCriteria[0] }) => {
    const value = (formData[criteria.key as keyof Rating] as number) || 0;
    const Icon = criteria.icon;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">{criteria.label}</Label>
          <Badge variant="outline" className="ml-auto">
            {value}/10
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground">{criteria.description}</p>
        
        <div className="space-y-2">
          <Input
            type="range"
            min="0"
            max="10"
            step="1"
            value={value}
            onChange={(e) => handleCriteriaChange(criteria.key, parseInt(e.target.value))}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Poor</span>
            <span>Average</span>
            <span>Excellent</span>
          </div>
        </div>
        
        <Textarea
          placeholder={`Notes on ${criteria.label.toLowerCase()}...`}
          value={(formData[`${criteria.key}_notes` as keyof Rating] as string) || ''}
          onChange={(e) => handleNotesChange(criteria.key, e.target.value)}
          className="min-h-[60px]"
        />
      </div>
    );
  };

  const RatingCard = ({ rating }: { rating: Rating }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{rating.rating_type?.replace('_', ' ')}</Badge>
            <Badge className={
              rating.status === 'submitted' ? 'bg-green-100 text-green-800' :
              rating.status === 'approved' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }>
              {rating.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{rating.overall_rating}/10</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-3 w-3" />
          <span>By {rating.rater?.first_name} {rating.rater?.last_name}</span>
          <span>•</span>
          <span>{new Date(rating.created_at!).toLocaleDateString()}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {ratingCriteria.map(criteria => {
            const score = rating[criteria.key as keyof Rating] as number;
            if (!score) return null;
            
            return (
              <div key={criteria.key} className="flex items-center justify-between">
                <span className="text-sm">{criteria.label}</span>
                <Badge variant="outline">{score}/10</Badge>
              </div>
            );
          })}
        </div>
        
        {rating.recommendation && (
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <Badge className={recommendations.find(r => r.value === rating.recommendation)?.color}>
              {recommendations.find(r => r.value === rating.recommendation)?.label}
            </Badge>
          </div>
        )}
        
        {rating.overall_comments && (
          <div className="space-y-1">
            <Label className="text-sm">Overall Comments</Label>
            <p className="text-sm text-muted-foreground">{rating.overall_comments}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-1" />
          Rate Candidate
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Rate Candidate: {candidateName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Position: {jobTitle}</p>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-rating">New Rating</TabsTrigger>
            <TabsTrigger value="existing-ratings">
              Previous Ratings ({ratings.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-rating" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rating Type</Label>
                <Select 
                  value={formData.rating_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Overall Rating</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-medium">{getOverallRating()}/10</span>
                  <span className="text-sm text-muted-foreground">(Auto-calculated)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ratingCriteria.map(criteria => (
                <RatingSlider key={criteria.key} criteria={criteria} />
              ))}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Recommendation</Label>
                <Select 
                  value={formData.recommendation} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, recommendation: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recommendations.map(rec => (
                      <SelectItem key={rec.value} value={rec.value}>
                        {rec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Overall Comments</Label>
                <Textarea
                  placeholder="Overall assessment, strengths, areas for improvement..."
                  value={formData.overall_comments || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, overall_comments: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleSubmit('draft')}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-1" />
                Save Draft
              </Button>
              
              <Button 
                onClick={() => handleSubmit('submitted')}
                disabled={loading}
              >
                <Send className="h-4 w-4 mr-1" />
                Submit Rating
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="existing-ratings">
            <div className="space-y-4">
              {ratings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No ratings yet for this candidate</p>
                </div>
              ) : (
                ratings.map(rating => (
                  <RatingCard key={rating.id} rating={rating} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
