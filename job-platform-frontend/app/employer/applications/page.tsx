'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Eye, 
  MessageSquare, 
  Calendar, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CandidateRating from '@/components/rating/CandidateRating';
import BulkActions from '@/components/bulk-actions/BulkActions';

interface Application {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  candidate_location?: string;
  job_id: string;
  job_title: string;
  status: string;
  applied_at: string;
  cover_letter?: string;
  expected_salary?: string;
  rating?: number;
  employer_notes?: string;
  interview_scheduled_at?: string;
  resume_url?: string;
  skills?: string[];
  experience_years?: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  applications: Application[];
}

const statusConfig = {
  pending: { title: 'New Applications', color: 'bg-yellow-100 border-yellow-200', textColor: 'text-yellow-800' },
  reviewing: { title: 'Under Review', color: 'bg-blue-100 border-blue-200', textColor: 'text-blue-800' },
  shortlisted: { title: 'Shortlisted', color: 'bg-purple-100 border-purple-200', textColor: 'text-purple-800' },
  interview: { title: 'Interview Stage', color: 'bg-indigo-100 border-indigo-200', textColor: 'text-indigo-800' },
  hired: { title: 'Hired', color: 'bg-green-100 border-green-200', textColor: 'text-green-800' },
  rejected: { title: 'Rejected', color: 'bg-red-100 border-red-200', textColor: 'text-red-800' }
};

export default function ApplicationPipeline() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobs, setJobs] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  
  // Bulk selection state
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'employer' && user.role !== 'team_member') {
        router.push('/jobs');
        return;
      }
      loadApplications();
      loadJobs();
    }
  }, [user, loading]);

  const loadJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/employer/jobs'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadApplications = async () => {
    try {
      setLoadingApplications(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/employer/all-applications'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        organizeApplicationsIntoColumns(data.applications || []);
      } else {
        throw new Error('Failed to load applications');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const organizeApplicationsIntoColumns = (applications: Application[]) => {
    const filteredApplications = applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesJob = selectedJob === 'all' || app.job_id === selectedJob;
      
      return matchesSearch && matchesJob;
    });

    const newColumns: KanbanColumn[] = Object.entries(statusConfig).map(([status, config]) => ({
      id: status,
      title: config.title,
      status,
      color: config.color,
      applications: filteredApplications.filter(app => app.status === status)
    }));

    setColumns(newColumns);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    // Find the application being moved
    const application = columns
      .find(col => col.id === source.droppableId)
      ?.applications.find(app => app.id === draggableId);

    if (!application) return;

    // Update application status
    await updateApplicationStatus(application.id, destination.droppableId);
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/applications/${applicationId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes || undefined
        })
      });

      if (response.ok) {
        toast.success('Application status updated');
        loadApplications(); // Reload to get fresh data
      } else {
        throw new Error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Bulk selection functions
  const toggleApplicationSelection = (application: Application) => {
    setSelectedApplications(prev => {
      const isSelected = prev.some(app => app.id === application.id);
      if (isSelected) {
        return prev.filter(app => app.id !== application.id);
      } else {
        return [...prev, application];
      }
    });
  };

  const isApplicationSelected = (applicationId: string) => {
    return selectedApplications.some(app => app.id === applicationId);
  };

  const clearSelection = () => {
    setSelectedApplications([]);
    setSelectMode(false);
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      clearSelection();
    }
  };

  const handleBulkActionComplete = () => {
    clearSelection();
    loadApplications();
  };

  const ApplicationCard = ({ application, index }: { application: Application; index: number }) => (
    <Draggable draggableId={application.id} index={index} isDragDisabled={selectMode}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className={`mb-3 cursor-pointer hover:shadow-md transition-shadow ${
            isApplicationSelected(application.id) ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={isApplicationSelected(application.id)}
                      onChange={() => toggleApplicationSelection(application)}
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {application.candidate_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{application.candidate_name}</p>
                    <p className="text-xs text-muted-foreground">{application.job_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CandidateRating
                    applicationId={application.id}
                    candidateName={application.candidate_name}
                    jobTitle={application.job_title}
                    onRatingSubmitted={() => loadApplications()}
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(application)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
              
              <div className="space-y-2">
                {application.expected_salary && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    {application.expected_salary}
                  </div>
                )}
                
                {application.candidate_location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {application.candidate_location}
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Applied {formatTimeAgo(application.applied_at)}
                </div>
                
                {application.rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < application.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );

  if (loading || loadingApplications) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'employer' && user.role !== 'team_member')) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Access denied. This page is only available for employers and team members.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Application Pipeline</h1>
            <p className="text-muted-foreground">
              Manage candidate applications with drag-and-drop workflow
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant={selectMode ? "default" : "outline"}
              onClick={toggleSelectMode}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              {selectMode ? 'Exit Select' : 'Select Mode'}
            </Button>
            <Button onClick={loadApplications} disabled={updating}>
              {updating ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedApplications={selectedApplications}
        onBulkActionComplete={handleBulkActionComplete}
        onClearSelection={clearSelection}
      />

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} ${statusConfig[column.status as keyof typeof statusConfig].textColor} p-3 rounded-t-lg border-b`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {column.applications.length}
                  </Badge>
                </div>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 min-h-96 border border-t-0 rounded-b-lg ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    {column.applications.map((application, index) => (
                      <ApplicationCard 
                        key={application.id} 
                        application={application} 
                        index={index} 
                      />
                    ))}
                    {provided.placeholder}
                    
                    {column.applications.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No applications</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Application Detail Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedApplication.candidate_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg">{selectedApplication.candidate_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.job_title}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedApplication.candidate_email}</span>
                  </div>
                  {selectedApplication.candidate_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedApplication.candidate_phone}</span>
                    </div>
                  )}
                  {selectedApplication.candidate_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedApplication.candidate_location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h4 className="font-semibold mb-3">Application Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Applied {formatTimeAgo(selectedApplication.applied_at)}</span>
                  </div>
                  
                  {selectedApplication.expected_salary && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Expected: {selectedApplication.expected_salary}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Badge className={statusConfig[selectedApplication.status as keyof typeof statusConfig].color}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.cover_letter && (
                <div>
                  <h4 className="font-semibold mb-3">Cover Letter</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                  </div>
                </div>
              )}

              {/* Employer Notes */}
              <div>
                <h4 className="font-semibold mb-3">Notes & Status</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="status">Update Status</Label>
                    <Select 
                      value={selectedApplication.status} 
                      onValueChange={(newStatus) => updateApplicationStatus(selectedApplication.id, newStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <SelectItem key={status} value={status}>
                            {config.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea 
                      id="notes"
                      placeholder="Add notes about this candidate..."
                      defaultValue={selectedApplication.employer_notes || ''}
                      onBlur={(e) => {
                        if (e.target.value !== selectedApplication.employer_notes) {
                          updateApplicationStatus(selectedApplication.id, selectedApplication.status, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'shortlisted')}
                  disabled={selectedApplication.status === 'shortlisted'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Shortlist
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'interview')}
                  disabled={selectedApplication.status === 'interview'}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                  disabled={selectedApplication.status === 'rejected'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
