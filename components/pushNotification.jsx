import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const PushNotification = {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }
    return true;
  },

  async schedule(reminder) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title || 'Reminder',
          body: reminder.body,
          sound: 'default',
          data: { id: reminder.id },
        },
        trigger: {
          date: new Date(reminder.schedule),
        },
      });
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  async cancel(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  },

  async cancelAll() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      return false;
    }
  },

  async getAllScheduled() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
};

PushNotification.requestPermissions();