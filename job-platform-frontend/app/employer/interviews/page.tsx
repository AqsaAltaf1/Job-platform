'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  Phone, 
  Mail, 
  Plus,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

interface Interview {
  id: string;
  application_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  scheduled_at: string;
  duration: number;
  type: 'phone' | 'video' | 'in_person';
  location?: string;
  meeting_link?: string;
  interviewer_id: string;
  interviewer_name: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  feedback?: string;
  rating?: number;
  created_at: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  interview?: Interview;
}

const interviewTypes = [
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'in_person', label: 'In Person', icon: MapPin }
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function InterviewScheduling() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWeek, setSelectedWeek] = useState<Date[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states for scheduling
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'video' as 'phone' | 'video' | 'in_person',
    location: '',
    meeting_link: '',
    notes: ''
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'employer' && user.role !== 'team_member') {
        router.push('/jobs');
        return;
      }
      loadData();
    }
  }, [user, loading]);

  useEffect(() => {
    // Calculate week dates when selectedDate changes
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    setSelectedWeek(weekDays);
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');
      
      const [interviewsRes, applicationsRes] = await Promise.all([
        fetch(getApiUrl('/employer/interviews'), {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(getApiUrl('/employer/shortlisted-applications'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (interviewsRes.ok) {
        const data = await interviewsRes.json();
        setInterviews(data.interviews || []);
      }

      if (applicationsRes.ok) {
        const data = await applicationsRes.json();
        setApplications(data.applications || []);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load interview data');
    } finally {
      setLoadingData(false);
    }
  };

  const scheduleInterview = async () => {
    try {
      if (!selectedApplication || !scheduleForm.date || !scheduleForm.time) {
        toast.error('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('token');
      const scheduledAt = new Date(`${scheduleForm.date}T${scheduleForm.time}`);

      const response = await fetch(getApiUrl('/employer/schedule-interview'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          application_id: selectedApplication.id,
          scheduled_at: scheduledAt.toISOString(),
          duration: scheduleForm.duration,
          type: scheduleForm.type,
          location: scheduleForm.location,
          meeting_link: scheduleForm.meeting_link,
          notes: scheduleForm.notes
        })
      });

      if (response.ok) {
        toast.success('Interview scheduled successfully');
        setShowScheduleDialog(false);
        setSelectedApplication(null);
        setScheduleForm({
          date: '',
          time: '',
          duration: 60,
          type: 'video',
          location: '',
          meeting_link: '',
          notes: ''
        });
        loadData();
      } else {
        throw new Error('Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    }
  };

  const updateInterviewStatus = async (interviewId: string, status: string, feedback?: string, rating?: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/employer/interviews/${interviewId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, feedback, rating })
      });

      if (response.ok) {
        toast.success('Interview status updated');
        loadData();
      } else {
        throw new Error('Failed to update interview status');
      }
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast.error('Failed to update interview status');
    }
  };

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter(interview => 
      isSameDay(parseISO(interview.scheduled_at), date)
    );
  };

  const getTimeSlotStatus = (date: Date, time: string): TimeSlot => {
    const dateInterviews = getInterviewsForDate(date);
    const interview = dateInterviews.find(int => 
      format(parseISO(int.scheduled_at), 'HH:mm') === time
    );

    return {
      time,
      available: !interview,
      interview
    };
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' ||
      app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = searchTerm === '' ||
      interview.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading || loadingData) {
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
            <h1 className="text-3xl font-bold mb-2">Interview Scheduling</h1>
            <p className="text-muted-foreground">
              Schedule and manage candidate interviews with calendar integration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates or jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="applications">Ready to Schedule</TabsTrigger>
          <TabsTrigger value="interviews">All Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar Picker */}
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>
                  Week of {format(selectedWeek[0] || new Date(), 'MMM dd, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2">
                  {/* Time column header */}
                  <div className="font-medium text-sm text-muted-foreground">Time</div>
                  
                  {/* Day headers */}
                  {selectedWeek.map((day) => (
                    <div key={day.toISOString()} className="text-center">
                      <div className="font-medium text-sm">{format(day, 'EEE')}</div>
                      <div className="text-xs text-muted-foreground">{format(day, 'MMM dd')}</div>
                    </div>
                  ))}

                  {/* Time slots */}
                  {timeSlots.map((time) => (
                    <div key={time} className="contents">
                      <div className="text-sm text-muted-foreground py-2">{time}</div>
                      {selectedWeek.map((day) => {
                        const slot = getTimeSlotStatus(day, time);
                        return (
                          <div
                            key={`${day.toISOString()}-${time}`}
                            className={`border rounded p-1 h-12 text-xs ${
                              slot.available 
                                ? 'bg-primary/10 border-primary/20 hover:bg-primary/20 cursor-pointer' 
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            {slot.interview && (
                              <div className="h-full flex flex-col justify-center">
                                <div className="font-medium truncate">
                                  {slot.interview.candidate_name}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {slot.interview.job_title}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shortlisted Candidates Ready for Interview</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Candidates Ready</h3>
                  <p className="text-muted-foreground">
                    Shortlist candidates from your application pipeline to schedule interviews.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {application.candidate_name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{application.candidate_name}</p>
                          <p className="text-sm text-muted-foreground">{application.job_title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">{application.candidate_email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          {application.status}
                        </Badge>
                        <Button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowScheduleDialog(true);
                          }}
                        >
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Schedule Interview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Scheduled Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Interviews Scheduled</h3>
                  <p className="text-muted-foreground">
                    Schedule interviews with shortlisted candidates to see them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {interview.candidate_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{interview.candidate_name}</p>
                          <p className="text-sm text-muted-foreground">{interview.job_title}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span className="text-xs text-muted-foreground">
                                {format(parseISO(interview.scheduled_at), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-xs text-muted-foreground">
                                {interview.duration} min
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {interviewTypes.find(t => t.value === interview.type)?.icon && (
                                <interviewTypes.find(t => t.value === interview.type)!.icon className="h-3 w-3" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {interviewTypes.find(t => t.value === interview.type)?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          interview.status === 'completed' ? 'default' :
                          interview.status === 'cancelled' ? 'destructive' :
                          interview.status === 'no_show' ? 'secondary' : 'outline'
                        }>
                          {interview.status}
                        </Badge>
                        {interview.status === 'scheduled' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateInterviewStatus(interview.id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateInterviewStatus(interview.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Interview Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar>
                  <AvatarFallback>
                    {selectedApplication.candidate_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedApplication.candidate_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.job_title}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.candidate_email}</p>
                </div>
              </div>

              {/* Schedule Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Select value={scheduleForm.time} onValueChange={(value) => setScheduleForm({...scheduleForm, time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={scheduleForm.duration.toString()} onValueChange={(value) => setScheduleForm({...scheduleForm, duration: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Interview Type</Label>
                  <Select value={scheduleForm.type} onValueChange={(value: 'phone' | 'video' | 'in_person') => setScheduleForm({...scheduleForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {interviewTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {scheduleForm.type === 'in_person' && (
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Office address or meeting room"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
                  />
                </div>
              )}

              {scheduleForm.type === 'video' && (
                <div>
                  <Label htmlFor="meeting_link">Meeting Link</Label>
                  <Input
                    id="meeting_link"
                    placeholder="Zoom, Teams, or Google Meet link"
                    value={scheduleForm.meeting_link}
                    onChange={(e) => setScheduleForm({...scheduleForm, meeting_link: e.target.value})}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes for the interview..."
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={scheduleInterview} className="flex-1">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
