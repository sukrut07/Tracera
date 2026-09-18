import { createDbNotification, getDbNotifications, markDbNotificationRead } from '@/lib/db';
import { connectToDatabase, isMongoConfigured } from '@/lib/mongodb/connection';
import { Notification as MongoNotification } from '@/lib/mongodb/models';

export interface NotificationItem {
  id: string;
  recipient_id: string;
  type: 'DOCUMENT_SUBMITTED' | 'CORRECTION_REQUESTED' | 'CORRECTION_UPLOADED' | 'DOCUMENT_APPROVED';
  title: string;
  message: string;
  document_id?: string;
  read: boolean | number;
  created_at: string;
}

export const notificationService = {
  /**
   * Dispatch a notification to a specific user
   */
  async notify(params: {
    recipientId: string;
    type: 'DOCUMENT_SUBMITTED' | 'CORRECTION_REQUESTED' | 'CORRECTION_UPLOADED' | 'DOCUMENT_APPROVED';
    title: string;
    message: string;
    documentId?: string;
  }): Promise<void> {
    // 1. Local SQLite store
    createDbNotification(params);

    // 2. MongoDB Atlas if configured
    if (isMongoConfigured) {
      try {
        await connectToDatabase();
        await MongoNotification.create({
          recipientId: params.recipientId,
          type: params.type,
          title: params.title,
          message: params.message,
          documentId: params.documentId,
          read: false,
        });
      } catch (err) {
        console.warn('MongoDB notification insert failed:', err);
      }
    }
  },

  /**
   * Fetch recent notifications for user
   */
  async getForUser(userId: string): Promise<NotificationItem[]> {
    const rows = getDbNotifications(userId);
    return rows.map((r) => ({
      id: r.id,
      recipient_id: r.recipient_id,
      type: r.type,
      title: r.title,
      message: r.message,
      document_id: r.document_id,
      read: Boolean(r.read),
      created_at: r.created_at,
    }));
  },

  /**
   * Mark notification as read
   */
  async markRead(id: string): Promise<void> {
    markDbNotificationRead(id);
    if (isMongoConfigured) {
      try {
        await connectToDatabase();
        await MongoNotification.findByIdAndUpdate(id, { read: true });
      } catch (err) {
        console.warn('MongoDB notification update failed:', err);
      }
    }
  },
};
