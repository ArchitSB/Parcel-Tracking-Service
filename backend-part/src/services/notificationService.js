const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
  }

  createEmailTransporter() {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send shipment notification
  async sendShipmentNotification(shipment, eventType) {
    try {
      const notifications = [];

      // Create notification for recipient email
      if (shipment.recipient.email) {
        const emailNotification = await this.createNotification({
          trackingNumber: shipment.trackingNumber,
          shipmentId: shipment._id,
          type: 'email',
          event: eventType,
          recipient: { email: shipment.recipient.email },
          subject: this.getEmailSubject(eventType, shipment.trackingNumber),
          message: this.getEmailMessage(eventType, shipment)
        });
        notifications.push(emailNotification);
      }

      // Create notification for recipient phone (SMS)
      if (shipment.recipient.phone) {
        const smsNotification = await this.createNotification({
          trackingNumber: shipment.trackingNumber,
          shipmentId: shipment._id,
          type: 'sms',
          event: eventType,
          recipient: { phone: shipment.recipient.phone },
          message: this.getSMSMessage(eventType, shipment)
        });
        notifications.push(smsNotification);
      }

      // Send all notifications
      await Promise.all(notifications.map(notification => this.processNotification(notification)));

      logger.info(`Notifications sent for shipment ${shipment.trackingNumber}, event: ${eventType}`);
    } catch (error) {
      logger.error('Send shipment notification error:', error);
    }
  }

  // Create notification record
  async createNotification(notificationData) {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  }

  // Process notification based on type
  async processNotification(notification) {
    try {
      switch (notification.type) {
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'sms':
          await this.sendSMS(notification);
          break;
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'webhook':
          await this.sendWebhook(notification);
          break;
        default:
          throw new Error(`Unknown notification type: ${notification.type}`);
      }
    } catch (error) {
      await this.handleNotificationFailure(notification, error);
    }
  }

  // Send email notification
  async sendEmail(notification) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: notification.recipient.email,
        subject: notification.subject,
        html: this.getEmailTemplate(notification)
      };

      await this.emailTransporter.sendMail(mailOptions);

      // Update notification status
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();

      logger.info(`Email sent successfully to ${notification.recipient.email}`);
    } catch (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  // Send SMS notification (placeholder - integrate with SMS service)
  async sendSMS(notification) {
    try {
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      logger.info(`SMS would be sent to ${notification.recipient.phone}: ${notification.message}`);
      
      // Simulate SMS sending
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
    } catch (error) {
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }

  // Send push notification (placeholder)
  async sendPushNotification(notification) {
    try {
      // TODO: Integrate with push notification service (Firebase, APNs, etc.)
      logger.info(`Push notification would be sent: ${notification.message}`);
      
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
    } catch (error) {
      throw new Error(`Push notification failed: ${error.message}`);
    }
  }

  // Send webhook notification
  async sendWebhook(notification) {
    try {
      // TODO: Implement webhook sending
      logger.info(`Webhook would be sent to ${notification.recipient.webhookUrl}`);
      
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
    } catch (error) {
      throw new Error(`Webhook sending failed: ${error.message}`);
    }
  }

  // Handle notification failure
  async handleNotificationFailure(notification, error) {
    notification.status = 'failed';
    notification.failureReason = error.message;
    notification.retryCount += 1;

    // Retry logic
    if (notification.retryCount < 3) {
      // Schedule retry (in a real implementation, use a job queue)
      setTimeout(() => {
        this.processNotification(notification);
      }, Math.pow(2, notification.retryCount) * 60000); // Exponential backoff
    }

    await notification.save();
    logger.error(`Notification failed for ${notification.trackingNumber}:`, error);
  }

  // Get email subject based on event type
  getEmailSubject(eventType, trackingNumber) {
    const subjects = {
      'shipment_created': `Shipment Created - Tracking #${trackingNumber}`,
      'package_picked_up': `Package Picked Up - Tracking #${trackingNumber}`,
      'in_transit': `Package In Transit - Tracking #${trackingNumber}`,
      'out_for_delivery': `Out for Delivery - Tracking #${trackingNumber}`,
      'delivered': `Package Delivered - Tracking #${trackingNumber}`,
      'delivery_attempted': `Delivery Attempted - Tracking #${trackingNumber}`,
      'exception': `Delivery Exception - Tracking #${trackingNumber}`,
      'returned_to_sender': `Package Returned - Tracking #${trackingNumber}`
    };
    return subjects[eventType] || `Shipment Update - Tracking #${trackingNumber}`;
  }

  // Get email message based on event type
  getEmailMessage(eventType, shipment) {
    const latestEvent = shipment.getLatestEvent();
    const location = latestEvent?.location?.city || 'Unknown location';
    
    const messages = {
      'shipment_created': `Your shipment has been created and is awaiting pickup.`,
      'package_picked_up': `Your package has been picked up and is on its way.`,
      'in_transit': `Your package is in transit${location !== 'Unknown location' ? ` and currently in ${location}` : ''}.`,
      'out_for_delivery': `Your package is out for delivery and will arrive soon.`,
      'delivered': `Your package has been successfully delivered.`,
      'delivery_attempted': `A delivery attempt was made. Please check for more details.`,
      'exception': `There was an exception with your shipment. Please contact customer service.`,
      'returned_to_sender': `Your package is being returned to the sender.`
    };
    
    return messages[eventType] || 'Your shipment status has been updated.';
  }

  // Get SMS message based on event type
  getSMSMessage(eventType, shipment) {
    const messages = {
      'shipment_created': `Shipment ${shipment.trackingNumber} created`,
      'package_picked_up': `Package ${shipment.trackingNumber} picked up`,
      'in_transit': `Package ${shipment.trackingNumber} in transit`,
      'out_for_delivery': `Package ${shipment.trackingNumber} out for delivery`,
      'delivered': `Package ${shipment.trackingNumber} delivered`,
      'delivery_attempted': `Delivery attempted for ${shipment.trackingNumber}`,
      'exception': `Exception for package ${shipment.trackingNumber}`,
      'returned_to_sender': `Package ${shipment.trackingNumber} returned`
    };
    
    return messages[eventType] || `Update for package ${shipment.trackingNumber}`;
  }

  // Get email HTML template
  getEmailTemplate(notification) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .tracking-number { font-size: 18px; font-weight: bold; color: #007bff; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Parcel Tracking Update</h1>
          </div>
          <div class="content">
            <h2>${notification.subject}</h2>
            <p>Tracking Number: <span class="tracking-number">${notification.trackingNumber}</span></p>
            <p>${notification.message}</p>
            <p>You can track your package anytime at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${notification.trackingNumber}">Track Package</a></p>
          </div>
          <div class="footer">
            <p>This is an automated message from Parcel Tracking Service.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Subscribe user to notifications
  async subscribeToNotifications(userId, trackingNumber, preferences = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user preferences
      user.preferences = { ...user.preferences, ...preferences };
      await user.save();

      logger.info(`User ${userId} subscribed to notifications for ${trackingNumber}`);
      return true;
    } catch (error) {
      logger.error('Subscribe to notifications error:', error);
      throw error;
    }
  }

  // Get notification history
  async getNotificationHistory(trackingNumber) {
    try {
      const notifications = await Notification.find({ trackingNumber })
        .sort({ createdAt: -1 })
        .lean();

      return notifications;
    } catch (error) {
      logger.error('Get notification history error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
