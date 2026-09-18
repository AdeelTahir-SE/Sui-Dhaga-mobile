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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import { AuthEdgeDecorations } from "../components/AuthEdgeDecorations";
import { authApi } from "@/api/auth.api";

const forgotIllustration = require("@/assets/illustrations/auth-flow/auth-forgot-password.png");

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSendResetLink = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(trimmedEmail);
      setSuccessMsg(
        "If an account exists with this email, password reset instructions have been sent."
      );
      // Give the user a moment to see the success or allow immediate navigation
      setTimeout(() => {
        router.push({
          pathname: "/auth/reset-password",
          params: { email: trimmedEmail },
        } as any);
      }, 1500);
    } catch (err: any) {
      const msg =
        err?.message ||
        "Unable to send reset instructions right now. Please verify your email and try again.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <AuthEdgeDecorations variant="gold" />
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
            {/* Illustration */}
            <View className="items-center mt-4 mb-5">
              <Image
                source={forgotIllustration}
                style={{ width: 200, height: 180 }}
                resizeMode="contain"
              />
            </View>

            {/* Heading */}
            <Text className="text-[24px] font-bold text-brand-dark text-center">
              Forgot Password?
            </Text>
            <Text className="text-[14px] text-brand-gray text-center mt-2 mb-6 leading-[20px] px-4">
              No worries! Enter your email address and we'll send you instructions to
              reset your password.
            </Text>

            {/* Success Banner */}
            {successMsg ? (
              <View className="mb-4 flex-row items-center rounded-xl bg-emerald-50 border border-emerald-200 p-3.5">
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text className="ml-2.5 flex-1 text-[13px] font-medium text-emerald-800">
                  {successMsg}
                </Text>
              </View>
            ) : null}

            {/* Error Banner */}
            {errorMsg ? (
              <View className="mb-4 flex-row items-center rounded-xl bg-red-50 border border-red-200 p-3.5">
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text className="ml-2.5 flex-1 text-[13px] font-medium text-red-700">
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            {/* Email Input */}
            <AuthInput
              label="Email Address"
              placeholder="Enter your email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMsg) setErrorMsg(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />

            {/* Send Reset Link */}
            <AuthButton
              title={isLoading ? "Sending Instructions..." : "Send Reset Link"}
              loading={isLoading}
              disabled={isLoading}
              onPress={handleSendResetLink}
              style={{ marginTop: 8 }}
            />

            {/* Divider */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-brand-border" />
              <Text className="mx-4 text-[13px] text-brand-gray">or</Text>
              <View className="flex-1 h-px bg-brand-border" />
            </View>

            {/* Manual Proceed to Reset */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/auth/reset-password",
                  params: { email: email.trim() },
                } as any)
              }
              className="items-center py-2 mb-2"
            >
              <Text className="text-[13px] font-semibold text-primary">
                Already have a reset code or link? Set password →
              </Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <AuthButton
              title="← Back to Login"
              onPress={() => router.push("/auth/login" as any)}
              variant="outlined"
            />
          </View>

          <View className="h-28" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
