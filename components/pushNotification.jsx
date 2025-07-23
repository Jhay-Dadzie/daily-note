import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'notificationSound.mp3',
  });
}

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
      const triggerDate = new Date(reminder.schedule);
      triggerDate.setSeconds(0);
      triggerDate.setMilliseconds(0);

      if (triggerDate.getTime() <= Date.now()) {
        console.warn('Cannot schedule notification in the past');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title == "No title" ? "Reminder" : reminder.title,
          body: reminder.body,
          sound: 'notificationSound.mp3',
          data: { id: reminder.id },
          android: {
            channelId: 'reminders',
          }
        },
        trigger: triggerDate
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