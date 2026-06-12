import React from "react";
import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthButton } from "../components/AuthButton";

const successIllustration = require("@/assets/illustrations/auth-flow/auth-password-reset-successful.png");

export default function PasswordResetSuccessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-1 px-6 justify-center">
        {/* Success Illustration */}
        <View className="items-center mb-6">
          <Image
            source={successIllustration}
            style={{ width: 220, height: 200 }}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <Text className="text-[24px] font-bold text-brand-dark text-center">
          Password Reset{"\n"}Successfully!
        </Text>
        <Text className="text-[14px] text-brand-gray text-center mt-3 mb-10 leading-[20px]">
          Your password has been reset.{"\n"}You can now login to your account.
        </Text>

        {/* Go to Login */}
        <AuthButton
          title="Go to Login"
          onPress={() => router.replace("/auth/login" as any)}
        />

        {/* Back to Home */}
        <View className="mt-4">
          <AuthButton
            title="Back to Home"
            onPress={() => router.replace("/" as any)}
            variant="outlined"
            icon="home-outline"
          />
        </View>
      </View>

      {/* Bottom Decoration */}
      <View
        className="h-28"
        style={{
          backgroundColor: "rgba(14, 145, 155, 0.06)",
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
        }}
      />
    </View>
  );
}
