import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { SchedulableTriggerInputTypes, Subscription, NotificationResponse } from 'expo-notifications';

// Set up notification handler for local notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Initialize notification listeners
let notificationListener: Subscription;
let responseListener: Subscription;

export async function requestNotificationPermissions() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      console.warn('Must use physical device for Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleLocalNotification(title: string, body: string, data: any = {}, delayInSeconds: number = 2) {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delayInSeconds,
        repeats: false,
      },
    });
  } catch (error) {
    console.error('Error scheduling local notification:', error);
  }
}

export async function scheduleBookingNotification() {
  await scheduleLocalNotification(
    "Booking Request Sent! ✅",
    'Your request has been sent to the donor. You will be notified once they accept.',
    { type: 'booking_request' }
  );
}

export function setupNotificationListeners(
  onNotification: (notification: Notifications.Notification) => void,
  onResponse: (response: NotificationResponse) => void
) {
  // Clean up existing listeners if they exist
  cleanupNotificationListeners();

  // Set up new listeners
  notificationListener = Notifications.addNotificationReceivedListener(onNotification);
  responseListener = Notifications.addNotificationResponseReceivedListener(onResponse);

  return cleanupNotificationListeners;
}

export function cleanupNotificationListeners() {
  if (notificationListener) {
    Notifications.removeNotificationSubscription(notificationListener);
  }
  if (responseListener) {
    Notifications.removeNotificationSubscription(responseListener);
  }
}
