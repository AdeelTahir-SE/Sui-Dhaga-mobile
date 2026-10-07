import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { notificationsApi } from '../api/notifications.api';

// Configure how incoming notifications appear on the device
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});


/**
 * Configure Android notification channels for maximum priority and lockscreen visibility.
 * This ensures the notification alerts the user even when the screen is turned off or device is locked.
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
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
  }
}

/**
 * Request system permissions and obtain the Expo device push token,
 * then register it with the backend server.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
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
export function handleNotificationResponse(response: Notifications.NotificationResponse) {
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
  // Listener for when user interacts with a notification (taps it on lockscreen or notification tray)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationResponse(response);
  });

  // Check if app was opened by tapping a notification while killed / closed
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) {
      handleNotificationResponse(response);
    }
  });

  return () => {
    responseSubscription.remove();
  };
}
