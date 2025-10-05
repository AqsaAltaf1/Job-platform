import stripeService from '../services/stripeService.js';
import { Op } from 'sequelize';

/**
 * Test webhook functionality (Development only)
 */
export const testWebhook = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Webhook testing is only available in development mode'
      });
    }

    const { event_type, subscription_id } = req.body;

    if (!event_type || !subscription_id) {
      return res.status(400).json({
        success: false,
        error: 'event_type and subscription_id are required'
      });
    }

    // Create a mock webhook event
    const mockEvent = {
      id: `evt_test_${Date.now()}`,
      type: event_type,
      data: {
        object: {
          id: subscription_id,
          status: event_type.includes('deleted') ? 'canceled' : 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
          cancel_at_period_end: event_type.includes('updated') ? true : false,
          customer: 'cus_test_customer'
        }
      },
      created: Math.floor(Date.now() / 1000)
    };

    // Process the mock webhook
    await stripeService.handleWebhook(mockEvent);

    res.json({
      success: true,
      message: `Mock webhook ${event_type} processed successfully`,
      event: mockEvent
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test webhook'
    });
  }
};

/**
 * Get webhook events log (Development only)
 */
export const getWebhookLogs = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Webhook logs are only available in development mode'
      });
    }

    // In a real implementation, you'd store webhook events in a log table
    // For now, we'll return recent subscription history as a proxy
    const { SubscriptionHistory } = await import('../models/index.js');
    
    const recentEvents = await SubscriptionHistory.findAll({
      limit: 20,
      order: [['created_at', 'DESC']],
      where: {
        stripe_event_id: {
          [Op.ne]: null
        }
      }
    });

    res.json({
      success: true,
      events: recentEvents
    });

  } catch (error) {
    console.error('Get webhook logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get webhook logs'
    });
  }
};
