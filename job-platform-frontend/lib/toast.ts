import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
  
  custom: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const config = {
      duration: 4000,
      style: {
        background: type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : '#3b82f6',
        color: '#fff',
      },
    };
    
    if (type === 'success') {
      toast.success(message, config);
    } else if (type === 'error') {
      toast.error(message, config);
    } else {
      toast(message, config);
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
