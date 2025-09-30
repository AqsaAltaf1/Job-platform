import { customToast } from '@/components/ui/custom-toast';

export const showToast = {
  success: (message: string) => {
    customToast.success(message);
  },
  
  error: (message: string) => {
    customToast.error(message);
  },
  
  warning: (message: string) => {
    customToast.warning(message);
  },
  
  info: (message: string) => {
    customToast.info(message);
  },
  
  loading: (message: string) => {
    return customToast.loading(message);
  },
  
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return customToast.promise(promise, messages);
  },
  
  dismiss: (toastId?: string) => {
    customToast.dismiss(toastId);
  },
  
  custom: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    switch (type) {
      case 'success':
        customToast.success(message);
        break;
      case 'error':
        customToast.error(message);
        break;
      case 'warning':
        customToast.warning(message);
        break;
      case 'info':
      default:
        customToast.info(message);
        break;
    }
  }
};

// Common notification messages
export const toastMessages = {
  // Authentication
  loginSuccess: 'Welcome back!',
  loginError: 'Login failed. Please check your credentials.',
  logoutSuccess: 'Logged out successfully',
  registerSuccess: 'Account created successfully!',
  registerError: 'Registration failed. Please try again.',
  
  // Profile
  profileUpdateSuccess: 'Profile updated successfully!',
  profileUpdateError: 'Failed to update profile. Please try again.',
  profilePictureUpdateSuccess: 'Profile picture updated successfully!',
  profilePictureUpdateError: 'Failed to update profile picture.',
  
  // Skills
  skillAddedSuccess: 'Skill added successfully!',
  skillAddedError: 'Failed to add skill. Please try again.',
  skillUpdatedSuccess: 'Skill updated successfully!',
  skillUpdatedError: 'Failed to update skill. Please try again.',
  skillDeletedSuccess: 'Skill deleted successfully!',
  skillDeletedError: 'Failed to delete skill. Please try again.',
  
  // Endorsements
  endorsementInvitationSent: 'Endorsement invitation sent successfully!',
  endorsementInvitationError: 'Failed to send invitation. Please try again.',
  endorsementSubmittedSuccess: 'Endorsement submitted successfully!',
  endorsementSubmittedError: 'Failed to submit endorsement. Please try again.',
  
  // Evidence
  evidenceAddedSuccess: 'Evidence added successfully!',
  evidenceAddedError: 'Failed to add evidence. Please try again.',
  evidenceUpdatedSuccess: 'Evidence updated successfully!',
  evidenceUpdatedError: 'Failed to update evidence. Please try again.',
  evidenceDeletedSuccess: 'Evidence deleted successfully!',
  evidenceDeletedError: 'Failed to delete evidence. Please try again.',
  
  // General
  loading: 'Loading...',
  saving: 'Saving...',
  deleting: 'Deleting...',
  networkError: 'Network error. Please check your connection.',
  unexpectedError: 'An unexpected error occurred. Please try again.',
};
