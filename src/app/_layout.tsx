import { useEffect } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import "../global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../stores/auth.store";

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

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

    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#FFFFFF" },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

