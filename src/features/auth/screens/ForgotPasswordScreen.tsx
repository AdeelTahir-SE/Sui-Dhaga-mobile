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

const forgotIllustration = require("@/assets/illustrations/auth-flow/auth-forgot-password.png");
const sewingMachine = require("@/assets/illustrations/auth-flow/auth-sewing-machine.png");

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");

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
            <Text className="text-[14px] text-brand-gray text-center mt-2 mb-7 leading-[20px] px-4">
              No worries! Enter your email address and we'll send you a link to
              reset your password.
            </Text>

            {/* Email Input */}
            <AuthInput
              label="Email Address"
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />

            {/* Send Reset Link */}
            <AuthButton
              title="Send Reset Link"
              onPress={() => router.push("/auth/reset-password" as any)}
              style={{ marginTop: 8 }}
            />

            {/* Divider */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-brand-border" />
              <Text className="mx-4 text-[13px] text-brand-gray">or</Text>
              <View className="flex-1 h-px bg-brand-border" />
            </View>

            {/* Back to Login */}
            <AuthButton
              title="← Back to Login"
              onPress={() => router.push("/auth/login" as any)}
              variant="outlined"
            />
          </View>

          {/* Bottom Decoration */}
          <View className="mt-auto">
            {/* Sewing Machine */}
            <View className="items-center mt-6">
              <Image
                source={sewingMachine}
                style={{ width: 200, height: 100 }}
                resizeMode="contain"
              />
            </View>
            {/* Teal gradient bar */}
            <View
              className="h-16 mt-2"
              style={{
                backgroundColor: "rgba(14, 145, 155, 0.06)",
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
