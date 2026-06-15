import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
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
    </>
  );
}
