import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import { PasswordStrength } from "../components/PasswordStrength";

const lockIllustration = require("@/assets/illustrations/auth-flow/auth-reset-password.png");

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="ml-4 mt-2 w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
          </TouchableOpacity>

          <View className="px-6 flex-1">
            {/* Lock Illustration */}
            <View className="items-center mt-2 mb-4">
              <Image
                source={lockIllustration}
                style={{ width: 140, height: 140 }}
                resizeMode="contain"
              />
            </View>

            {/* Heading */}
            <Text className="text-[24px] font-bold text-brand-dark text-center">
              Reset Password
            </Text>
            <Text className="text-[14px] text-brand-gray text-center mt-2 mb-6">
              Create a new password for your{"\n"}Sui Dhaga account.
            </Text>

            {/* New Password */}
            <AuthInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            {/* Password Strength */}
            <PasswordStrength password={newPassword} />

            {/* Confirm Password */}
            <AuthInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Reset Button */}
            <AuthButton
              title="Reset Password"
              onPress={() => router.push("/auth/success" as any)}
              style={{ marginTop: 4 }}
            />

            {/* Info Box */}
            <View
              className="flex-row items-center mt-5 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "rgba(14, 145, 155, 0.08)" }}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#14919B"
                style={{ marginRight: 10 }}
              />
              <Text className="flex-1 text-[12px] text-primary-dark leading-[17px]">
                Your password will be updated and you will be logged in
                automatically.
              </Text>
            </View>
          </View>

          {/* Bottom Decoration */}
          <View
            className="h-24 mt-8"
            style={{
              backgroundColor: "rgba(14, 145, 155, 0.06)",
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
