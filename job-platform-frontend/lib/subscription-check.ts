import { User } from './types'

export interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscriptionType: string | null
  expiresAt: string | null
  canPostJobs: boolean
  canApplyJobs: boolean
}

export const checkSubscriptionStatus = (user: User | null, subscription?: any): SubscriptionStatus => {
  if (!user) {
    return {
      hasActiveSubscription: false,
      subscriptionType: null,
      expiresAt: null,
      canPostJobs: false,
      canApplyJobs: false
    }
  }

  const now = new Date()
  
  if (!subscription) {
    return {
      hasActiveSubscription: false,
      subscriptionType: null,
      expiresAt: null,
      canPostJobs: false,
      canApplyJobs: false
    }
  }

  // Check if subscription is active based on status and period
  let isActive = false
  
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    if (subscription.current_period_end) {
      try {
        const endDate = new Date(subscription.current_period_end)
        isActive = endDate > now
      } catch (error) {
        console.error('Error parsing subscription end date:', error)
        // If we can't parse the date, assume it's active if status is active
        isActive = subscription.status === 'active'
      }
    } else {
      // If no end date but status is active, assume it's active
      isActive = subscription.status === 'active'
    }
  }

  return {
    hasActiveSubscription: isActive,
    subscriptionType: subscription.subscriptionPlan?.display_name || subscription.subscriptionPlan?.name,
    expiresAt: subscription.current_period_end,
    canPostJobs: isActive && (user.role === 'employer' || user.role === 'super_admin'),
    canApplyJobs: isActive && user.role === 'candidate'
  }
}

export const getSubscriptionMessage = (status: SubscriptionStatus, userRole: string): string => {
  if (status.hasActiveSubscription) {
    return `You have an active ${status.subscriptionType} subscription`
  }
  
  if (userRole === 'candidate') {
    return 'You need an active subscription to apply for jobs'
  } else if (userRole === 'employer' || userRole === 'team_member') {
    return 'You need an active subscription to post jobs'
  }
  
  return 'You need an active subscription to access this feature'
}

export const redirectToPricing = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/pricing'
  }
}
