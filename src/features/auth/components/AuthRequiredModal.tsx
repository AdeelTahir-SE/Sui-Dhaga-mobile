import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router, usePathname, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../stores/auth.store";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

/**
 * Checks if the given route belongs to authentication pages or initial redirect
 */
export function isAuthRoute(pathname?: string | null, segments?: string[]): boolean {
  if (!pathname && (!segments || segments.length === 0)) {
    // Router not yet mounted/initialized
    return true;
  }

  // Check segments
  if (segments && segments.length > 0) {
    const firstSegment = segments[0];
    if (firstSegment === "auth" || firstSegment === "(auth)") {
      return true;
    }
  }

  // Check pathname
  if (pathname) {
    const normalized = pathname.toLowerCase();
    if (
      normalized === "/" ||
      normalized === "/index" ||
      normalized === "/auth" ||
      normalized.startsWith("/auth/")
    ) {
      return true;
    }
  }

  return false;
}

export function AuthRequiredModal() {
  const pathname = usePathname();
  const segments = useSegments();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const isAuthPage = isAuthRoute(pathname, segments);
  const isUnauthenticated = !isAuthenticated || !user;

  // Only display modal when auth check has completed, user is unauthenticated, and not on auth pages
  const isVisible = !isLoading && isUnauthenticated && !isAuthPage;

  const handleGoToLogin = () => {
    router.replace("/auth/login" as any);
  };

  const handleGoToRegister = () => {
    router.replace("/auth/register" as any);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleGoToLogin}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
      >
        <View
          className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl items-center border border-brand-border"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* Visual Header / Brand Icon */}
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-light/60 border-2 border-primary/20">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-sm">
              <Ionicons name="lock-closed" size={26} color="#FFFFFF" />
            </View>
          </View>

          {/* Badge */}
          <View className="mb-2.5 rounded-full bg-primary-50 px-3 py-1 border border-primary/20">
            <Text className="text-[11px] font-bold tracking-wider text-primary-dark uppercase">
              Authentication Required
            </Text>
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-xl font-extrabold text-brand-dark">
            Please Login to Continue
          </Text>

          {/* Description */}
          <Text className="mb-6 text-center text-[13.5px] leading-5 text-brand-gray px-1 font-medium">
            You need to be logged in to access this feature. Please sign in to your Sui Dhaga account to continue.
          </Text>

          {/* Primary Action: Go to Login */}
          <TouchableOpacity
            onPress={handleGoToLogin}
            activeOpacity={0.85}
            className="relative h-[52px] w-full flex-row items-center justify-center overflow-hidden rounded-xl bg-primary shadow-sm"
          >
            <ButtonTexture variant="greenish" borderRadius={12} opacity={1} />
            <View className="z-10 flex-row items-center justify-center px-4">
              <Ionicons
                name="log-in-outline"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-bold tracking-wide text-white">
                Go to Login
              </Text>
            </View>
          </TouchableOpacity>

          {/* Secondary Action: Create Account */}
          <TouchableOpacity
            onPress={handleGoToRegister}
            activeOpacity={0.7}
            className="mt-3.5 py-2 px-3 flex-row items-center justify-center"
          >
            <Text className="text-xs text-brand-gray font-medium">
              Don't have an account?{" "}
              <Text className="text-primary font-bold">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
