import { Platform } from 'react-native';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const Notifications = require('expo-notifications');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch {
      return false;
    }
  },

  async getExpoPushToken(): Promise<string | null> {
    try {
      const Notifications = require('expo-notifications');
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id',
      });
      return tokenData.data;
    } catch {
      return null;
    }
  },

  async scheduleLocalNotification(payload: NotificationPayload, delaySeconds = 0): Promise<void> {
    try {
      const Notifications = require('expo-notifications');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
        trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
      });
    } catch {
      // Notifications not available
    }
  },

  async scheduleDonationReminder(): Promise<void> {
    await this.scheduleLocalNotification(
      {
        title: 'تذكير بالتبرع 💚',
        body: 'لا تنسَ صدقتك اليوم. حتى أقل مبلغ يصنع فرقاً!',
        data: { type: 'donation_reminder' },
      },
      86400 // 24 hours
    );
  },

  async sendUrgentCaseNotification(caseName: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: '🚨 حالة عاجلة',
      body: `${caseName} - تحتاج مساعدتك الآن`,
      data: { type: 'urgent_case' },
    });
  },
};
