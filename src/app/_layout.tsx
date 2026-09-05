import { useEffect } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import "../global.css";

import { useAuthStore } from "../stores/auth.store";

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
    SystemUI.setBackgroundColorAsync("#FFFFFF");
    if (Platform.OS === "android") {
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor("transparent", true);
      RNStatusBar.setBarStyle("dark-content", true);
    }
  }, [checkAuth]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="home" />
        <Stack.Screen name="design" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="design-studio" />
        <Stack.Screen name="tailors" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="appointments" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="measurements" />
        <Stack.Screen name="community" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="tailor-dashboard" />
      </Stack>
    </SafeAreaProvider>
  );
}
