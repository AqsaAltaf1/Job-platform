import Stripe from 'stripe';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Subscription from '../models/Subscription.js';
import SubscriptionHistory from '../models/SubscriptionHistory.js';
import User from '../models/User.js';
import { EmployerProfile } from '../models/EmployerProfile.js';

class StripeService {
  constructor() {
    this.getStripe() = null;
  }

  getStripe() {
    if (!this.stripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY environment variable is not set');
      }
      this.getStripe() = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
    }
    return this.stripe;
  }

  /**
   * Create or get Stripe customer
   */
  async createOrGetCustomer(user, employerProfile = null) {
    try {
      // Check if user already has a Stripe customer ID
      if (user.stripe_customer_id) {
        return await this.stripe.customers.retrieve(user.stripe_customer_id);
      }

      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        metadata: {
          user_id: user.id,
          employer_profile_id: employerProfile?.id || null,
          company_name: employerProfile?.company_name || null
        }
      });

      // Update user with Stripe customer ID
      await User.update(
        { stripe_customer_id: customer.id },
        { where: { id: user.id } }
      );

      return customer;
    } catch (error) {
      console.error('Create Stripe customer error:', error);
      throw error;
    }
  }

  /**
   * Create subscription checkout session
   */
  async createCheckoutSession(user, planId, billingCycle, successUrl, cancelUrl) {
    try {
      const plan = await SubscriptionPlan.findByPk(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      const customer = await this.createOrGetCustomer(user);
      const priceId = billingCycle === 'yearly' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly;

      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: user.id,
          plan_id: planId,
          billing_cycle: billingCycle
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan_id: planId,
            billing_cycle: billingCycle
          }
        }
      });

      return session;
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw error;
    }
  }

  /**
   * Create subscription change session (upgrade/downgrade)
   */
  async createSubscriptionChangeSession(subscriptionId, newPlanId, billingCycle, successUrl, cancelUrl) {
    try {
      const subscription = await Subscription.findByPk(subscriptionId, {
        include: [
          { model: User, as: 'user' },
          { model: SubscriptionPlan, as: 'subscriptionPlan' }
        ]
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const newPlan = await SubscriptionPlan.findByPk(newPlanId);
      if (!newPlan) {
        throw new Error('New subscription plan not found');
      }

      const newPriceId = billingCycle === 'yearly' ? newPlan.stripe_price_id_yearly : newPlan.stripe_price_id_monthly;

      // Create checkout session for subscription change
      const session = await this.stripe.checkout.sessions.create({
        customer: subscription.stripe_customer_id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: newPriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: subscription.user_id,
          old_subscription_id: subscriptionId,
          new_plan_id: newPlanId,
          billing_cycle: billingCycle,
          action: 'change_plan'
        },
        subscription_data: {
          metadata: {
            user_id: subscription.user_id,
            old_subscription_id: subscriptionId,
            new_plan_id: newPlanId,
            billing_cycle: billingCycle,
            action: 'change_plan'
          }
        }
      });

      return session;
    } catch (error) {
      console.error('Create subscription change session error:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await Subscription.findByPk(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel in Stripe
      const stripeSubscription = await this.stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: cancelAtPeriodEnd,
          metadata: {
            canceled_by: 'user',
            cancel_at_period_end: cancelAtPeriodEnd.toString()
          }
        }
      );

      // Update local subscription
      await subscription.update({
        cancel_at_period_end: cancelAtPeriodEnd,
        canceled_at: cancelAtPeriodEnd ? null : new Date(),
        status: cancelAtPeriodEnd ? subscription.status : 'canceled'
      });

      // Log in history
      await this.logSubscriptionHistory(subscription.id, subscription.user_id, 'canceled', {
        old_status: subscription.status,
        new_status: cancelAtPeriodEnd ? subscription.status : 'canceled',
        description: cancelAtPeriodEnd ? 'Subscription will cancel at period end' : 'Subscription canceled immediately'
      });

      return stripeSubscription;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId) {
    try {
      const subscription = await Subscription.findByPk(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Resume in Stripe
      const stripeSubscription = await this.stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: false,
          metadata: {
            resumed_by: 'user'
          }
        }
      );

      // Update local subscription
      await subscription.update({
        cancel_at_period_end: false,
        canceled_at: null
      });

      // Log in history
      await this.logSubscriptionHistory(subscription.id, subscription.user_id, 'resumed', {
        old_status: subscription.status,
        new_status: 'active',
        description: 'Subscription resumed'
      });

      return stripeSubscription;
    } catch (error) {
      console.error('Resume subscription error:', error);
      throw error;
    }
  }

  /**
   * Handle successful checkout
   */
  async handleCheckoutSuccess(session) {
    try {
      const { user_id, plan_id, billing_cycle, action, old_subscription_id } = session.metadata;

      if (action === 'change_plan') {
        // Handle subscription change
        await this.handleSubscriptionChange(old_subscription_id, plan_id, billing_cycle, session);
      } else {
        // Handle new subscription
        await this.createNewSubscription(user_id, plan_id, billing_cycle, session);
      }
    } catch (error) {
      console.error('Handle checkout success error:', error);
      throw error;
    }
  }

  /**
   * Create new subscription record
   */
  async createNewSubscription(userId, planId, billingCycle, session) {
    try {
      const stripeSubscription = await this.stripe.subscriptions.retrieve(session.subscription);
      
      const subscription = await Subscription.create({
        user_id: userId,
        subscription_plan_id: planId,
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: stripeSubscription.customer,
        status: stripeSubscription.status,
        billing_cycle: billingCycle,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
        trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
        trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
        metadata: {
          stripe_session_id: session.id,
          created_via: 'checkout'
        }
      });

      // Log in history
      await this.logSubscriptionHistory(subscription.id, userId, 'created', {
        new_plan_id: planId,
        new_status: stripeSubscription.status,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        billing_cycle: billingCycle,
        description: 'New subscription created'
      });

      return subscription;
    } catch (error) {
      console.error('Create new subscription error:', error);
      throw error;
    }
  }

  /**
   * Handle subscription change (upgrade/downgrade)
   */
  async handleSubscriptionChange(oldSubscriptionId, newPlanId, billingCycle, session) {
    try {
      const oldSubscription = await Subscription.findByPk(oldSubscriptionId, {
        include: [{ model: SubscriptionPlan, as: 'subscriptionPlan' }]
      });

      // Cancel old subscription
      await this.stripe.subscriptions.cancel(oldSubscription.stripe_subscription_id);
      await oldSubscription.update({ status: 'canceled', canceled_at: new Date() });

      // Create new subscription
      const newSubscription = await this.createNewSubscription(
        oldSubscription.user_id,
        newPlanId,
        billingCycle,
        session
      );

      // Log change in history
      await this.logSubscriptionHistory(newSubscription.id, oldSubscription.user_id, 
        this.isUpgrade(oldSubscription.subscriptionPlan, newPlanId) ? 'upgraded' : 'downgraded',
        {
          old_plan_id: oldSubscription.subscription_plan_id,
          new_plan_id: newPlanId,
          old_status: 'canceled',
          new_status: newSubscription.status,
          amount: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
          billing_cycle: billingCycle,
          description: 'Subscription plan changed'
        }
      );

      return newSubscription;
    } catch (error) {
      console.error('Handle subscription change error:', error);
      throw error;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(event) {
    try {
      console.log(`Processing webhook event: ${event.type}`);
      
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'invoice.created':
          await this.handleInvoiceCreated(event.data.object);
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Handle webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle subscription created webhook
   */
  async handleSubscriptionCreated(stripeSubscription) {
    try {
      console.log('Handling subscription created:', stripeSubscription.id);
      
      // Find if we already have this subscription
      const existingSubscription = await Subscription.findOne({
        where: { stripe_subscription_id: stripeSubscription.id }
      });

      if (!existingSubscription) {
        console.log('Subscription not found in database, may have been created via webhook');
        // This subscription was created outside our normal flow
        // We would need additional metadata to properly create it
      } else {
        // Update the existing subscription with latest data
        await existingSubscription.update({
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000),
          trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null
        });

        await this.logSubscriptionHistory(existingSubscription.id, existingSubscription.user_id, 'activated', {
          new_status: stripeSubscription.status,
          stripe_event_id: stripeSubscription.id,
          description: 'Subscription activated via Stripe webhook'
        });
      }
    } catch (error) {
      console.error('Handle subscription created error:', error);
    }
  }

  /**
   * Handle subscription deleted webhook
   */
  async handleSubscriptionDeleted(stripeSubscription) {
    try {
      console.log('Handling subscription deleted:', stripeSubscription.id);
      
      const subscription = await Subscription.findOne({
        where: { stripe_subscription_id: stripeSubscription.id }
      });

      if (subscription) {
        await subscription.update({
          status: 'canceled',
          canceled_at: new Date(),
          cancel_at_period_end: false
        });

        await this.logSubscriptionHistory(subscription.id, subscription.user_id, 'canceled', {
          old_status: subscription.status,
          new_status: 'canceled',
          stripe_event_id: stripeSubscription.id,
          description: 'Subscription canceled via Stripe webhook'
        });
      }
    } catch (error) {
      console.error('Handle subscription deleted error:', error);
    }
  }

  /**
   * Handle trial will end webhook
   */
  async handleTrialWillEnd(stripeSubscription) {
    try {
      console.log('Handling trial will end:', stripeSubscription.id);
      
      const subscription = await Subscription.findOne({
        where: { stripe_subscription_id: stripeSubscription.id },
        include: [{ model: User, as: 'user' }]
      });

      if (subscription && subscription.user) {
        await this.logSubscriptionHistory(subscription.id, subscription.user_id, 'trial_ended', {
          stripe_event_id: stripeSubscription.id,
          description: 'Trial period ending soon'
        });

        // Here you could send an email notification to the user
        console.log(`Trial ending soon for user: ${subscription.user.email}`);
      }
    } catch (error) {
      console.error('Handle trial will end error:', error);
    }
  }

  /**
   * Handle payment succeeded webhook
   */
  async handlePaymentSucceeded(invoice) {
    try {
      console.log('Handling payment succeeded:', invoice.id);
      
      if (invoice.subscription) {
        const subscription = await Subscription.findOne({
          where: { stripe_subscription_id: invoice.subscription }
        });

        if (subscription) {
          await this.logSubscriptionHistory(subscription.id, subscription.user_id, 'payment_succeeded', {
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            stripe_invoice_id: invoice.id,
            stripe_event_id: invoice.subscription,
            description: 'Payment processed successfully'
          });
        }
      }
    } catch (error) {
      console.error('Handle payment succeeded error:', error);
    }
  }

  /**
   * Handle payment failed webhook
   */
  async handlePaymentFailed(invoice) {
    try {
      console.log('Handling payment failed:', invoice.id);
      
      if (invoice.subscription) {
        const subscription = await Subscription.findOne({
          where: { stripe_subscription_id: invoice.subscription },
          include: [{ model: User, as: 'user' }]
        });

        if (subscription) {
          await this.logSubscriptionHistory(subscription.id, subscription.user_id, 'payment_failed', {
            amount: invoice.amount_due / 100,
            currency: invoice.currency.toUpperCase(),
            stripe_invoice_id: invoice.id,
            stripe_event_id: invoice.subscription,
            description: 'Payment failed - subscription may be suspended'
          });

          // Update subscription status if it's now past due
          if (subscription.status !== 'past_due') {
            await subscription.update({ status: 'past_due' });
          }

          // Here you could send an email notification to the user
          console.log(`Payment failed for user: ${subscription.user.email}`);
        }
      }
    } catch (error) {
      console.error('Handle payment failed error:', error);
    }
  }

  /**
   * Handle invoice created webhook
   */
  async handleInvoiceCreated(invoice) {
    try {
      console.log('Handling invoice created:', invoice.id);
      
      if (invoice.subscription) {
        const subscription = await Subscription.findOne({
          where: { stripe_subscription_id: invoice.subscription }
        });

        if (subscription) {
          await this.logSubscriptionHistory(subscription.id, subscription.user_id, 'renewed', {
            amount: invoice.amount_due / 100,
            currency: invoice.currency.toUpperCase(),
            stripe_invoice_id: invoice.id,
            description: 'New billing cycle - invoice created'
          });
        }
      }
    } catch (error) {
      console.error('Handle invoice created error:', error);
    }
  }

  /**
   * Handle checkout session completed webhook
   */
  async handleCheckoutCompleted(session) {
    try {
      console.log('Handling checkout completed:', session.id);
      
      if (session.mode === 'subscription' && session.subscription) {
        await this.handleCheckoutSuccess(session);
      }
    } catch (error) {
      console.error('Handle checkout completed error:', error);
    }
  }
  async handleSubscriptionUpdated(stripeSubscription) {
    try {
      const subscription = await Subscription.findOne({
        where: { stripe_subscription_id: stripeSubscription.id }
      });

      if (subscription) {
        const oldStatus = subscription.status;
        await subscription.update({
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end
        });

        if (oldStatus !== stripeSubscription.status) {
          await this.logSubscriptionHistory(subscription.id, subscription.user_id, 'activated', {
            old_status: oldStatus,
            new_status: stripeSubscription.status,
            stripe_event_id: stripeSubscription.id,
            description: 'Subscription status updated'
          });
        }
      }
    } catch (error) {
      console.error('Handle subscription updated error:', error);
    }
  }

  /**
   * Log subscription history
   */
  async logSubscriptionHistory(subscriptionId, userId, action, data = {}) {
    try {
      await SubscriptionHistory.create({
        subscription_id: subscriptionId,
        user_id: userId,
        action: action,
        old_plan_id: data.old_plan_id || null,
        new_plan_id: data.new_plan_id || null,
        old_status: data.old_status || null,
        new_status: data.new_status || null,
        amount: data.amount || null,
        currency: data.currency || 'USD',
        billing_cycle: data.billing_cycle || null,
        stripe_event_id: data.stripe_event_id || null,
        stripe_invoice_id: data.stripe_invoice_id || null,
        description: data.description || null,
        metadata: data.metadata || {}
      });
    } catch (error) {
      console.error('Log subscription history error:', error);
    }
  }

  /**
   * Check if plan change is an upgrade
   */
  isUpgrade(oldPlan, newPlanId) {
    // Simple logic - can be enhanced based on plan hierarchy
    const planHierarchy = {
      'starter': 1,
      'professional': 2,
      'enterprise': 3
    };

    return planHierarchy[newPlanId] > planHierarchy[oldPlan.name];
  }

  /**
   * Get subscription usage and limits
   */
  async getSubscriptionUsage(subscriptionId) {
    try {
      const subscription = await Subscription.findByPk(subscriptionId, {
        include: [{ model: SubscriptionPlan, as: 'subscriptionPlan' }]
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // This would typically query usage from various tables
      // For now, returning mock data
      return {
        jobPostings: {
          used: 15,
          limit: subscription.subscriptionPlan.limits.job_postings || 50
        },
        teamMembers: {
          used: 3,
          limit: subscription.subscriptionPlan.limits.team_members || 10
        },
        applications: {
          used: 245,
          limit: subscription.subscriptionPlan.limits.applications || 1000
        }
      };
    } catch (error) {
      console.error('Get subscription usage error:', error);
      throw error;
    }
  }
}

// Lazy singleton pattern to avoid initialization during module import
let stripeServiceInstance = null;

export default {
  getInstance() {
    if (!stripeServiceInstance) {
      stripeServiceInstance = new StripeService();
    }
    return stripeServiceInstance;
  }
};
