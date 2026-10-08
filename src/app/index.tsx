import React from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "../stores/auth.store";

const logoImg = require("@/assets/logos/main-logo.png");

export default function Index() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // While restoring auth state from secure persistent storage, render splash screen
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Image
          source={logoImg}
          style={{ width: 130, height: 130, resizeMode: "contain" }}
        />
        <Text className="mt-4 text-[24px] font-black tracking-tight text-brand-dark">
          Sui Dhaga
        </Text>
        <Text className="mt-1 text-center text-[13px] font-medium text-brand-gray">
          Handcrafted Elegance & Bespoke Tailoring
        </Text>
        <ActivityIndicator size="small" color="#14919B" style={{ marginTop: 24 }} />
      </View>
    );
  }

  // Once checked, if user is already logged in, route directly into the app
  if (isAuthenticated && user && user.id && user.id !== "guest" && !user.id.startsWith("guest")) {
    // If brand new user who has not chosen role:
    if (user.isExistingUser === false) {
      return <Redirect href="/auth/complete-profile" />;
    }
    // Existing user: NEVER redirect to complete-profile!
    if (user.role === "tailor") {
      return <Redirect href="/tailor-dashboard" />;
    }
    return <Redirect href="/home" />;
  }

  // Only route to login if unauthenticated
  return <Redirect href="/auth/login" />;
}
