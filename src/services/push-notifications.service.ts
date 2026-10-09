import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { isRunningInExpoGo } from 'expo';
import { router } from 'expo-router';
import { notificationsApi } from '../api/notifications.api';
import type * as NotificationsType from 'expo-notifications';

// Determine if the app is currently running inside Expo Go
const isExpoGo =
  isRunningInExpoGo() ||
  Constants?.appOwnership === 'expo' ||
  Constants?.executionEnvironment === ExecutionEnvironment.StoreClient;

// Remote push notifications were removed from Expo Go for Android in Expo SDK 53+.
// Statically importing or loading expo-notifications inside Expo Go on Android throws a fatal error.
// We dynamically load the module only when running outside of Android Expo Go (or in development builds).
const canLoadNotifications = !(Platform.OS === 'android' && isExpoGo);

let Notifications: typeof NotificationsType | null = null;

if (canLoadNotifications) {
  try {
    Notifications = require('expo-notifications');
  } catch (error) {
    console.warn('[Push] Could not load expo-notifications module:', error);
  }
}

// Configure how incoming notifications appear on the device
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications?.AndroidNotificationPriority?.MAX ?? 2,
    }),
  });
}

/**
 * Configure Android notification channels for maximum priority and lockscreen visibility.
 * This ensures the notification alerts the user even when the screen is turned off or device is locked.
 */
export async function setupNotificationChannels(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Important Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#14919B',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  } catch (error) {
    console.warn('[Push] Failed to setup notification channels:', error);
  }
}

/**
 * Request system permissions and obtain the Expo device push token,
 * then register it with the backend server.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (isExpoGo) {
    console.log('[Push] Running in Expo Go: remote push notifications are disabled in Expo Go. Use a development build (expo run:android / expo run:ios) to test push notifications.');
    return null;
  }

  if (!Notifications) {
    return null;
  }

  let token: string | null = null;

  await setupNotificationChannels();

  // Push notifications require a physical device on iOS / Android
  if (Platform.OS === 'web') {
    console.log('[Push] Running on web, push notifications skipped');
    return null;
  }

  if (!Device.isDevice) {
    console.log('[Push] Running on emulator/simulator, push notifications mocked');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Push] Permission not granted for push notifications');
      return null;
    }

    // Resolve Expo EAS Project ID
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId ||
      'f8d1c341-bd2f-46a7-a4bd-77c34f32f19c';

    const pushTokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    token = pushTokenData.data;
    console.log('[Push] Registered Device Push Token:', token);

    // Save token to backend
    if (token) {
      await notificationsApi.registerPushToken(token).catch((err) => {
        console.warn('[Push] Error sending push token to backend:', err);
      });
    }

    return token;
  } catch (error) {
    console.warn('[Push] Failed to register push token:', error);
    return null;
  }
}

/**
 * Handle notification tap from lock screen or system notification tray
 */
export function handleNotificationResponse(response: NotificationsType.NotificationResponse) {
  const data = response?.notification?.request?.content?.data as Record<string, any> | undefined;
  if (!data) return;

  const type = String(data.type || '').toLowerCase();

  if (type === 'message') {
    const convId = data.conversationId || data.conversation_id;
    if (convId) {
      router.push(`/messages/${convId}` as never);
    } else {
      router.push('/messages' as never);
    }
  } else if (type === 'order') {
    const orderId = data.orderId || data.order_id;
    if (orderId) {
      router.push(`/orders/${orderId}` as never);
    } else {
      router.push('/orders' as never);
    }
  } else if (type === 'appointment') {
    const apptId = data.appointmentId || data.appointment_id;
    if (apptId) {
      router.push(`/appointments/${apptId}` as never);
    } else {
      router.push('/appointments' as never);
    }
  }
}

/**
 * Attach listeners for background/lockscreen notification responses.
 * Returns a cleanup unsubscribe function.
 */
export function setupPushNotificationListeners(): () => void {
  if (!Notifications) {
    return () => {};
  }

  // Listener for when user interacts with a notification (taps it on lockscreen or notification tray)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationResponse(response);
  });

  // Check if app was opened by tapping a notification while killed / closed
  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    })
    .catch((err) => {
      console.warn('[Push] Error checking last notification response:', err);
    });

  return () => {
    responseSubscription.remove();
  };
}
