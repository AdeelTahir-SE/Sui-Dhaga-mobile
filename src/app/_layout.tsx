import { useEffect } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import * as WebBrowser from "expo-web-browser";
import "../global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../stores/auth.store";
import { AuthRequiredModal } from "../features/auth/components/AuthRequiredModal";
import { useAppUpdate } from "../hooks/useAppUpdate";
import { AppUpdateModal } from "../components/ui/AppUpdateModal";
import {
  registerForPushNotificationsAsync,
  setupPushNotificationListeners,
} from "../services/push-notifications.service";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../services/queryClient";
import "../services/alert.service";
import { ThemedAlertModal } from "../components/ui/ThemedAlertModal";

// Ensure auth session from deep linking is completed on app resume
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);
  const { updateInfo, isVisible, dismissModal, triggerUpdate } = useAppUpdate();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 0);

    SystemUI.setBackgroundColorAsync("#FFFFFF");
    if (Platform.OS === "android") {
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor("transparent", true);
      RNStatusBar.setBarStyle("dark-content", true);
    }

    // Initialize notification channels and lockscreen listeners
    const cleanupNotifications = setupPushNotificationListeners();

    return () => {
      clearTimeout(timer);
      cleanupNotifications();
    };
  }, []);

  // When user is authenticated, register their device push token with backend
  useEffect(() => {
    if (user?.id) {
      registerForPushNotificationsAsync();
    }
  }, [user?.id]);


  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider
          initialMetrics={initialWindowMetrics}
          style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        >
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#FFFFFF" },
            }}
          />
          <AuthRequiredModal />
          <AppUpdateModal
            visible={isVisible}
            updateInfo={updateInfo}
            onUpdate={triggerUpdate}
            onDismiss={dismissModal}
          />
          <ThemedAlertModal />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

