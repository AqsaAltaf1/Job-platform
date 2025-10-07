import { User } from './types'

export interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscriptionType: string | null
  expiresAt: string | null
  canPostJobs: boolean
  canApplyJobs: boolean
}

export const checkSubscriptionStatus = (user: User | null): SubscriptionStatus => {
  if (!user) {
    return {
      hasActiveSubscription: false,
      subscriptionType: null,
      expiresAt: null,
      canPostJobs: false,
      canApplyJobs: false
    }
  }

  const subscription = user.subscription
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

  const isActive = subscription.status === 'active' && 
    subscription.end_date && 
    new Date(subscription.end_date) > now

  return {
    hasActiveSubscription: isActive,
    subscriptionType: subscription.plan_name,
    expiresAt: subscription.end_date,
    canPostJobs: isActive && (user.role === 'employer' || user.role === 'team_member'),
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
