import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
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
