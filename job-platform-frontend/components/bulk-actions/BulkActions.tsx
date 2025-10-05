'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckSquare, 
  Mail, 
  Trash2, 
  Download, 
  Users, 
  MessageSquare,
  Send,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  status: string;
  applied_at: string;
}

interface BulkActionsProps {
  selectedApplications: Application[];
  onBulkActionComplete: () => void;
  onClearSelection: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'reviewing', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-purple-100 text-purple-800' },
  { value: 'interview', label: 'Interview', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'hired', label: 'Hired', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
];

const emailTemplates = [
  {
    id: 'interview_invitation',
    name: 'Interview Invitation',
    subject: 'Interview Invitation - {job_title} at {company_name}',
    message: `Dear {candidate_name},

We're pleased to inform you that your application for the {job_title} position at {company_name} has been reviewed, and we would like to invite you for an interview.

We'll be in touch soon with more details about the interview process.

Best regards,
{company_name} Team`
  },
  {
    id: 'application_update',
    name: 'Application Status Update',
    subject: 'Update on your application - {job_title}',
    message: `Dear {candidate_name},

Thank you for your interest in the {job_title} position at {company_name}.

We wanted to provide you with an update on your application status. We'll be in touch with next steps soon.

Best regards,
{company_name} Team`
  },
  {
    id: 'rejection_notice',
    name: 'Application Rejection',
    subject: 'Update on your application for {job_title}',
    message: `Dear {candidate_name},

Thank you for your interest in the {job_title} position at {company_name}.

After careful consideration, we have decided to move forward with other candidates at this time. We appreciate the time you invested in the application process and encourage you to apply for future opportunities.

Best regards,
{company_name} Team`
  },
  {
    id: 'custom',
    name: 'Custom Message',
    subject: '',
    message: ''
  }
];

export default function BulkActions({ selectedApplications, onBulkActionComplete, onClearSelection }: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('status');
  const [loading, setLoading] = useState(false);
  
  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  
  // Email form
  const [selectedTemplate, setSelectedTemplate] = useState('interview_invitation');
  const [emailSubject, setEmailSubject] = useState(emailTemplates[0].subject);
  const [emailMessage, setEmailMessage] = useState(emailTemplates[0].message);
  
  // Export form
  const [exportFormat, setExportFormat] = useState('csv');
  
  // Delete form
  const [deleteReason, setDeleteReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState('');

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setEmailSubject(template.subject);
      setEmailMessage(template.message);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(getApiUrl('/employer/bulk/update-status'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          application_ids: selectedApplications.map(app => app.id),
          new_status: newStatus,
          notes: statusNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully updated ${data.updated_count} applications`);
        onBulkActionComplete();
        onClearSelection();
        setIsOpen(false);
        setNewStatus('');
        setStatusNotes('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update applications');
      }
    } catch (error) {
      console.error('Error updating applications:', error);
      toast.error('Failed to update applications');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error('Please fill in subject and message');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(getApiUrl('/employer/bulk/send-emails'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          application_ids: selectedApplications.map(app => app.id),
          email_type: selectedTemplate,
          subject: emailSubject,
          message: emailMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully sent ${data.sent_count} emails`);
        setIsOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (confirmDelete !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(getApiUrl('/employer/bulk/delete-applications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          application_ids: selectedApplications.map(app => app.id),
          reason: deleteReason
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully deleted ${data.deleted_count} applications`);
        onBulkActionComplete();
        onClearSelection();
        setIsOpen(false);
        setDeleteReason('');
        setConfirmDelete('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete applications');
      }
    } catch (error) {
      console.error('Error deleting applications:', error);
      toast.error('Failed to delete applications');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(getApiUrl('/employer/bulk/export-applications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          application_ids: selectedApplications.map(app => app.id),
          format: exportFormat
        })
      });

      if (response.ok) {
        if (exportFormat === 'csv') {
          const csvContent = await response.text();
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'applications_export.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const jsonContent = JSON.stringify(data.data, null, 2);
          const blob = new Blob([jsonContent], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'applications_export.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
        toast.success('Export completed successfully');
        setIsOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to export applications');
      }
    } catch (error) {
      console.error('Error exporting applications:', error);
      toast.error('Failed to export applications');
    } finally {
      setLoading(false);
    }
  };

  if (selectedApplications.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {selectedApplications.length} Applications Selected
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('status')}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Update Status
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('email')}>
                <Mail className="h-4 w-4 mr-1" />
                Send Emails
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('export')}>
                <Download className="h-4 w-4 mr-1" />
                Export Data
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('delete')}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Applications
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {selectedApplications.slice(0, 5).map(app => (
            <Badge key={app.id} variant="outline" className="text-xs">
              {app.candidate_name}
            </Badge>
          ))}
          {selectedApplications.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{selectedApplications.length - 5} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Actions - {selectedApplications.length} Applications
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Update Status</TabsTrigger>
            <TabsTrigger value="email">Send Emails</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="delete">Delete</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add notes for this status update..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
            
            <Button onClick={handleBulkStatusUpdate} disabled={loading} className="w-full">
              <CheckCircle className="h-4 w-4 mr-1" />
              Update {selectedApplications.length} Applications
            </Button>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div>
              <Label>Email Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {'{candidate_name}'}, {'{job_title}'}, {'{company_name}'} for personalization
              </p>
            </div>
            
            <div>
              <Label>Message</Label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Email message..."
                className="min-h-[150px]"
              />
            </div>
            
            <Button onClick={handleBulkEmail} disabled={loading} className="w-full">
              <Send className="h-4 w-4 mr-1" />
              Send to {selectedApplications.length} Candidates
            </Button>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Export will include: candidate details, application status, dates, 
                expected salary, and other application data.
              </p>
            </div>
            
            <Button onClick={handleExport} disabled={loading} className="w-full">
              <Download className="h-4 w-4 mr-1" />
              Export {selectedApplications.length} Applications
            </Button>
          </TabsContent>
          
          <TabsContent value="delete" className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Warning: This action cannot be undone</span>
              </div>
              <p className="text-sm text-red-700">
                Deleting applications will permanently remove them from the system. 
                This action is irreversible.
              </p>
            </div>
            
            <div>
              <Label>Reason for Deletion</Label>
              <Textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Explain why these applications are being deleted..."
              />
            </div>
            
            <div>
              <Label>Confirmation</Label>
              <Input
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder="Type 'DELETE' to confirm"
              />
            </div>
            
            <Button 
              onClick={handleBulkDelete} 
              disabled={loading || confirmDelete !== 'DELETE'} 
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete {selectedApplications.length} Applications
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Card>
  );
}
