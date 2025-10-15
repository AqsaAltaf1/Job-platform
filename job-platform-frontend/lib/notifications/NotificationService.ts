import { getApiUrl } from '@/lib/config';

export interface CreateNotificationData {
  type: 'info' | 'success' | 'warning' | 'error' | 'reference' | 'application' | 'interview' | 'profile_view';
  title: string;
  message: string;
  user_id?: string;
  data?: any;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(notificationData: CreateNotificationData): Promise<void> {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      const response = await fetch(getApiUrl('/api/notifications'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Create notification for reference submission
   */
  static async notifyReferenceSubmitted(candidateId: string, referrerName: string): Promise<void> {
    await this.createNotification({
      type: 'reference',
      title: 'New Reference Received',
      message: `${referrerName} has submitted a reference for you.`,
      user_id: candidateId,
      data: { referrerName, type: 'reference_submitted' }
    });
  }

  /**
   * Create notification for application status change
   */
  static async notifyApplicationStatusChange(
    candidateId: string, 
    jobTitle: string, 
    status: string, 
    companyName: string
  ): Promise<void> {
    const statusMessages = {
      'reviewed': 'Your application is being reviewed',
      'shortlisted': 'You have been shortlisted',
      'interview_scheduled': 'Interview has been scheduled',
      'interviewed': 'Interview completed',
      'offered': 'You have received a job offer',
      'hired': 'Congratulations! You have been hired',
      'rejected': 'Application status update'
    };

    await this.createNotification({
      type: 'application',
      title: 'Application Update',
      message: `${statusMessages[status as keyof typeof statusMessages] || 'Status updated'} for ${jobTitle} at ${companyName}.`,
      user_id: candidateId,
      data: { jobTitle, status, companyName, type: 'application_status' }
    });
  }

  /**
   * Create notification for interview scheduling
   */
  static async notifyInterviewScheduled(
    candidateId: string,
    jobTitle: string,
    interviewDate: string,
    companyName: string
  ): Promise<void> {
    await this.createNotification({
      type: 'interview',
      title: 'Interview Scheduled',
      message: `Interview scheduled for ${jobTitle} at ${companyName} on ${new Date(interviewDate).toLocaleDateString()}.`,
      user_id: candidateId,
      data: { jobTitle, interviewDate, companyName, type: 'interview_scheduled' }
    });
  }

  /**
   * Create notification for profile view
   */
  static async notifyProfileView(
    candidateId: string,
    viewerName: string,
    companyName: string
  ): Promise<void> {
    await this.createNotification({
      type: 'profile_view',
      title: 'Profile Viewed',
      message: `${viewerName} from ${companyName} viewed your profile.`,
      user_id: candidateId,
      data: { viewerName, companyName, type: 'profile_view' }
    });
  }

  /**
   * Create notification for new job application
   */
  static async notifyNewApplication(
    employerId: string,
    candidateName: string,
    jobTitle: string
  ): Promise<void> {
    await this.createNotification({
      type: 'application',
      title: 'New Application',
      message: `${candidateName} applied for ${jobTitle}.`,
      user_id: employerId,
      data: { candidateName, jobTitle, type: 'new_application' }
    });
  }

  /**
   * Create notification for reference request
   */
  static async notifyReferenceRequest(
    referrerEmail: string,
    candidateName: string,
    skills: string[]
  ): Promise<void> {
    // This would typically be sent via email, but we can also create an in-app notification
    // if the referrer has an account
    await this.createNotification({
      type: 'reference',
      title: 'Reference Request',
      message: `${candidateName} is requesting a reference for: ${skills.join(', ')}.`,
      data: { candidateName, skills, type: 'reference_request' }
    });
  }

  /**
   * Create notification for team member invitation
   */
  static async notifyTeamInvitation(
    inviteeEmail: string,
    inviterName: string,
    companyName: string
  ): Promise<void> {
    await this.createNotification({
      type: 'info',
      title: 'Team Invitation',
      message: `${inviterName} invited you to join ${companyName}'s team.`,
      data: { inviterName, companyName, type: 'team_invitation' }
    });
  }

  /**
   * Create notification for subscription changes
   */
  static async notifySubscriptionChange(
    userId: string,
    planName: string,
    action: 'upgraded' | 'downgraded' | 'cancelled' | 'renewed'
  ): Promise<void> {
    const actionMessages = {
      'upgraded': 'Your subscription has been upgraded',
      'downgraded': 'Your subscription has been downgraded',
      'cancelled': 'Your subscription has been cancelled',
      'renewed': 'Your subscription has been renewed'
    };

    await this.createNotification({
      type: 'info',
      title: 'Subscription Update',
      message: `${actionMessages[action]} to ${planName}.`,
      user_id: userId,
      data: { planName, action, type: 'subscription_change' }
    });
  }

  /**
   * Create notification for verification status
   */
  static async notifyVerificationStatus(
    userId: string,
    status: 'verified' | 'failed' | 'pending',
    type: 'identity' | 'employment' | 'education'
  ): Promise<void> {
    const statusMessages = {
      'verified': 'Your verification has been completed',
      'failed': 'Your verification failed',
      'pending': 'Your verification is being processed'
    };

    await this.createNotification({
      type: status === 'verified' ? 'success' : status === 'failed' ? 'error' : 'info',
      title: 'Verification Update',
      message: `${statusMessages[status]} for ${type}.`,
      user_id: userId,
      data: { status, type, verificationType: type }
    });
  }
}
