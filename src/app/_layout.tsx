import { useEffect } from "react";
import { AppState, Platform, StatusBar as RNStatusBar } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { NavigationBar } from "expo-navigation-bar";
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

import { router, useSegments } from "expo-router";
import { toast } from "../stores/toast.store";
import { ToastBanner } from "../components/ui/ToastBanner";

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const segments = useSegments();
  const { updateInfo, isVisible, dismissModal, triggerUpdate } = useAppUpdate();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 0);

    SystemUI.setBackgroundColorAsync("#FFFFFF");
    if (Platform.OS === "android") {
      RNStatusBar.setTranslucent(false);
      RNStatusBar.setBackgroundColor("#FFFFFF", true);
      RNStatusBar.setBarStyle("dark-content", true);
      NavigationBar.setStyle("dark");
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

  // Silently check and refresh auth when app comes back to foreground from background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          checkAuth();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkAuth]);

  // Route protection: prevent unauthenticated/undefined users from accessing customer or tailor pages
  useEffect(() => {
    if (isLoading) return;

    const rootSegment = segments[0] as string | undefined;
    const isActualUser = Boolean(
      user &&
      user.id &&
      user.id !== "guest" &&
      !user.id.startsWith("guest") &&
      isAuthenticated
    );

    const protectedSegments = [
      "home",
      "profile",
      "orders",
      "appointments",
      "messages",
      "measurements",
      "design",
      "design-studio",
      "community",
      "tailor-dashboard",
      "tailors",
    ];

    if (rootSegment && protectedSegments.includes(rootSegment)) {
      if (!isActualUser) {
        router.replace("/auth/login" as any);
      }
    }
  }, [segments, user, isAuthenticated, isLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider
          initialMetrics={Platform.OS === "ios" ? initialWindowMetrics : undefined}
          style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        >
          <StatusBar style="dark" />
          <NavigationBar style="dark" />
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
          <ToastBanner />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

