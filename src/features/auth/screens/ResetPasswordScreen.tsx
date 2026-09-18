import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import { PasswordStrength } from "../components/PasswordStrength";
import { AuthEdgeDecorations } from "../components/AuthEdgeDecorations";
import { authApi } from "@/api/auth.api";

const lockIllustration = require("@/assets/illustrations/auth-flow/auth-reset-password.png");

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();

  const [email, setEmail] = useState(params.email ? String(params.email) : "");
  const [token, setToken] = useState(params.token ? String(params.token) : "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setErrorMsg(null);

    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();
    const trimmedEmail = email.trim();
    const trimmedToken = token.trim();

    if (!trimmedPassword) {
      setErrorMsg("Please enter a new password.");
      return;
    }

    if (trimmedPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(
        trimmedPassword,
        trimmedToken || undefined,
        trimmedEmail || undefined
      );

      // On successful reset, navigate to success screen
      router.replace("/auth/success" as any);
    } catch (err: any) {
      const msg =
        err?.message ||
        "Failed to reset password. Please check your token or request a new reset link.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <AuthEdgeDecorations variant="teal" />
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
              Set New Password
            </Text>
            <Text className="text-[14px] text-brand-gray text-center mt-2 mb-4 leading-[20px]">
              {email
                ? `Create a secure new password for ${email}`
                : "Create a new password for your Sui Dhaga account."}
            </Text>

            {/* Error Banner */}
            {errorMsg ? (
              <View className="mb-4 flex-row items-center rounded-xl bg-red-50 border border-red-200 p-3.5">
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text className="ml-2.5 flex-1 text-[13px] font-medium text-red-700">
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            {/* Email Field (if not prefilled or editable) */}
            {!params.email ? (
              <AuthInput
                label="Account Email"
                placeholder="Enter your account email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
              />
            ) : null}

            {/* Reset Code / Token (optional if coming from email link) */}
            {!params.token ? (
              <AuthInput
                label="Reset Code / Token (Optional)"
                placeholder="Enter code from email (if provided)"
                value={token}
                onChangeText={(text) => {
                  setToken(text);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoCapitalize="none"
                icon="key-outline"
              />
            ) : null}

            {/* New Password */}
            <AuthInput
              label="New Password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errorMsg) setErrorMsg(null);
              }}
              secureTextEntry
            />

            {/* Password Strength */}
            <PasswordStrength password={newPassword} />

            {/* Confirm Password */}
            <AuthInput
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errorMsg) setErrorMsg(null);
              }}
              secureTextEntry
            />

            {/* Reset Button */}
            <AuthButton
              title={isLoading ? "Updating Password..." : "Save New Password"}
              loading={isLoading}
              disabled={isLoading}
              onPress={handleResetPassword}
              style={{ marginTop: 6 }}
            />

            {/* Info Box */}
            <View
              className="flex-row items-center mt-5 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "rgba(14, 145, 155, 0.08)" }}
            >
              <Ionicons
                name="shield-checkmark"
                size={20}
                color="#14919B"
                style={{ marginRight: 10 }}
              />
              <Text className="flex-1 text-[12px] text-primary-dark leading-[17px]">
                Your new password will take effect immediately across all your devices.
              </Text>
            </View>

            {/* Back to Login link */}
            <TouchableOpacity
              onPress={() => router.replace("/auth/login" as any)}
              className="mt-5 mb-3 items-center py-2"
            >
              <Text className="text-[13px] font-semibold text-brand-gray">
                Remember your password? <Text className="text-primary font-bold">Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View className="h-28" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
