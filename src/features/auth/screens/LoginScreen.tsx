import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import { SocialLoginButton } from "../components/SocialLoginButton";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            {/* Logo */}
            <View className="flex-row items-center mt-5 mb-1">
              <Text
                className="text-[38px] text-primary font-bold"
                style={{
                  fontFamily:
                    Platform.OS === "ios" ? "Georgia" : "serif",
                }}
              >
                {"𝒮 "}
              </Text>
              <Text
                className="text-[26px] text-brand-dark font-semibold"
                style={{
                  fontFamily:
                    Platform.OS === "ios" ? "Georgia" : "serif",
                }}
              >
                Sui Dhaga
              </Text>
            </View>

            {/* Welcome Text */}
            <Text className="text-[24px] font-bold text-brand-dark mt-4">
              Welcome back! 👋
            </Text>
            <Text className="text-[14px] text-brand-gray mt-1 mb-7">
              Login to continue your tailoring journey
            </Text>

            {/* Email / Phone */}
            <AuthInput
              label="Email or Phone"
              placeholder="Enter email or phone number"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <AuthInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push("/auth/forgot-password" as any)}
              className="self-end -mt-2 mb-7"
            >
              <Text className="text-[13px] font-medium text-primary">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <AuthButton title="Login" onPress={() => {}} />

            {/* Divider */}
            <View className="flex-row items-center my-7">
              <View className="flex-1 h-px bg-brand-border" />
              <Text className="mx-4 text-[13px] text-brand-gray">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-brand-border" />
            </View>

            {/* Social Login */}
            <View className="flex-row justify-center gap-6">
              <SocialLoginButton provider="google" onPress={() => {}} />
              <SocialLoginButton provider="apple" onPress={() => {}} />
              <SocialLoginButton provider="facebook" onPress={() => {}} />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-10 mb-8">
              <Text className="text-[14px] text-brand-gray">
                Don't have an account?{"  "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/register" as any)}
              >
                <Text className="text-[14px] font-bold text-primary">
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
