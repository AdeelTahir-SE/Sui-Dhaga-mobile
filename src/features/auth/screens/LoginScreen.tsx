import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import { SocialLoginButton } from "../components/SocialLoginButton";
import { AuthEdgeDecorations } from "../components/AuthEdgeDecorations";
import { AuthMessageBanner } from "../components/AuthMessageBanner";
import { useAuthStore } from "../../../stores/auth.store";

const logoImg = require("@/assets/logos/main-logo.png");

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter both your email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const success = await login({ email: email.trim(), password });
      if (success) {
        const user = useAuthStore.getState().user;
        if (user?.role === "tailor") {
          router.replace("/tailor-dashboard" as any);
        } else {
          router.replace("/home" as any);
        }
      } else {
        const storeError = useAuthStore.getState().error;
        setErrorMessage(storeError || "Invalid email or password");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
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
            {/* Logo */}
            <View className="flex-row items-center mt-5 mb-1">
              <Image
                source={logoImg}
                className="w-10 h-10 mr-2.5"
                resizeMode="contain"
              />
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
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <AuthInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
              secureTextEntry
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push("/auth/forgot-password" as any)}
              className="self-end -mt-2 mb-6"
            >
              <Text className="text-[13px] font-medium text-primary">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Error Message */}
            {errorMessage ? (
              <AuthMessageBanner
                type="error"
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
              />
            ) : null}

            {/* Login Button */}
            {isSubmitting ? (
              <View className="h-[52px] items-center justify-center rounded-xl bg-primary">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : (
              <AuthButton title="Login" onPress={handleLogin} />
            )}

            {/* Divider */}
            <View className="flex-row items-center my-7">
              <View className="flex-1 h-px bg-brand-border" />
              <Text className="mx-4 text-[13px] text-brand-gray">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-brand-border" />
            </View>

            {/* Social Login */}
            <SocialLoginButton
              title="Continue with Google"
              onPress={() => {}}
            />

            {/* Register Link */}
            <View className="flex-row justify-center mt-10 mb-28">
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
