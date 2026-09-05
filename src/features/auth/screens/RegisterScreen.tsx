import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import { RoleCard } from "../components/RoleCard";
import { SocialLoginButton } from "../components/SocialLoginButton";
import { AuthEdgeDecorations } from "../components/AuthEdgeDecorations";
import { AuthMessageBanner } from "../components/AuthMessageBanner";
import { useAuthStore } from "../../../stores/auth.store";

const logoImg = require("@/assets/logos/main-logo.png");
const customerImg = require("@/assets/illustrations/auth-flow/cutomer-crete-account.png");
const tailorImg = require("@/assets/illustrations/auth-flow/tailor-create-account.png");
const designerImg = require("@/assets/illustrations/auth-flow/designer-create-account.png");

type Role = "customer" | "tailor" | "designer";

const roles: { id: Role; title: string; description: string; image: any }[] = [
  {
    id: "customer",
    title: "Customer",
    description: "Book orders &\nget custom outfits",
    image: customerImg,
  },
  {
    id: "tailor",
    title: "Tailor",
    description: "Offer services &\ngrow business",
    image: tailorImg,
  },
  {
    id: "designer",
    title: "Designer",
    description: "Create designs &\nget discovered",
    image: designerImg,
  },
];

const countryOptions = [
  { code: "+92", flag: "🇵🇰", label: "Pakistan" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+1", flag: "🇺🇸", label: "USA/CA" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<Role>("customer");
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const register = useAuthStore((state) => state.register);

  const currentCountry = countryOptions[selectedCountryIndex];

  const handleRegister = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      Alert.alert("Required Fields", "Please enter your email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters long (e.g., Password123!)."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match. Please verify.");
      return;
    }

    if (!agreedToTerms) {
      Alert.alert("Terms Required", "Please agree to the Terms of Service to proceed.");
      return;
    }

    let formattedPhone: string | undefined = undefined;
    const rawPhoneDigits = phone.trim().replace(/\D/g, "");
    if (rawPhoneDigits.length > 0) {
      if (phone.trim().startsWith("+")) {
        formattedPhone = `+${rawPhoneDigits}`;
      } else {
        const digits = rawPhoneDigits.replace(/^0+/, "");
        formattedPhone = `${currentCountry.code}${digits}`;
      }
    }

    // Determine the registered name: use person's name if provided, otherwise the portion before '@'
    const emailPrefix = trimmedEmail.split("@")[0];
    const registeredName = trimmedName || emailPrefix;

    // Backend accepts "customer" or "tailor"
    const backendRole: "customer" | "tailor" =
      selectedRole === "tailor" ? "tailor" : "customer";

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const success = await register({
        email: trimmedEmail,
        password,
        name: registeredName,
        fullName: registeredName,
        role: backendRole,
        phone: formattedPhone,
      });

      if (success) {
        setRegistrationSuccess(true);
      } else {
        const storeError = useAuthStore.getState().error;
        setErrorMessage(storeError || "Registration failed. Please check your information.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <AuthEdgeDecorations variant="teal" />
        <View className="flex-1 px-6 justify-center items-center pb-10">
          {/* Logo Header */}
          <View className="flex-row items-center mb-8">
            <Image
              source={logoImg}
              className="w-10 h-10 mr-2.5"
              resizeMode="contain"
            />
            <Text
              className="text-[26px] text-brand-dark font-semibold"
              style={{
                fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
              }}
            >
              Sui Dhaga
            </Text>
          </View>

          {/* Glowing Mail Icon Badge */}
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6 border border-primary/20">
            <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
              <Ionicons name="mail-open-outline" size={32} color="#14919B" />
            </View>
          </View>

          {/* Heading & Subtitle */}
          <Text className="text-[26px] font-bold text-brand-dark text-center">
            Account Created! 🎉
          </Text>
          <View className="mt-2.5 mb-2 bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20">
            <Text className="text-[12px] font-bold text-primary uppercase tracking-wider">
              Verification Link Sent
            </Text>
          </View>

          {/* Email Info Card */}
          <View className="w-full rounded-2xl bg-brand-surface p-4 border border-brand-border my-5 shadow-sm">
            <View className="flex-row items-center mb-1.5">
              <Ionicons name="mail" size={15} color="#14919B" style={{ marginRight: 6 }} />
              <Text className="text-[12px] font-semibold text-brand-gray">
                Sent to:
              </Text>
            </View>
            <Text className="text-[15px] font-bold text-brand-dark select-all">
              {email.trim()}
            </Text>
            <View className="h-px bg-brand-border my-2.5" />
            <Text className="text-[12px] text-brand-gray leading-[18px]">
              Please check your inbox (and spam folder) and click the verification link to activate your account.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="w-full gap-3 mt-2">
            <AuthButton
              title="Go to Login"
              onPress={() => router.replace("/auth/login" as any)}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <AuthEdgeDecorations variant="coral" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
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

          <View className="px-6">
            {/* Header */}
            <Text className="text-[24px] font-bold text-brand-dark mt-2">
              Create Your Account
            </Text>
            <Text className="text-[14px] text-brand-gray mt-1 mb-5">
              Join Sui Dhaga and discover the perfect custom tailoring
              experience.
            </Text>

            {/* Role Selection */}
            <Text className="text-[13px] font-medium text-brand-dark mb-3">
              I want to join as
            </Text>
            <View className="flex-row gap-3 mb-6">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  title={role.title}
                  description={role.description}
                  image={role.image}
                  selected={selectedRole === role.id}
                  onPress={() => setSelectedRole(role.id)}
                />
              ))}
            </View>

            {/* Full Name */}
            <AuthInput
              label="Full Name"
              placeholder="Enter your full name (optional)"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errorMessage) setErrorMessage(null);
              }}
              autoCapitalize="words"
            />

            {/* Email */}
            <AuthInput
              label="Email"
              placeholder="Enter your email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Phone Number */}
            <View className="mb-4">
              <Text className="text-[13px] font-medium text-brand-dark mb-1.5">
                Phone Number
              </Text>
              <View className="flex-row items-center border border-brand-border rounded-xl h-[52px] bg-white overflow-hidden">
                {/* Country Code Selector */}
                <TouchableOpacity
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                  className="flex-row items-center px-3 h-full border-r border-brand-border bg-gray-50/60"
                  activeOpacity={0.7}
                >
                  <Text className="text-[15px] mr-1">{currentCountry.flag}</Text>
                  <Text className="text-[14px] text-brand-dark font-medium">
                    {currentCountry.code}
                  </Text>
                  <Ionicons
                    name={showCountryPicker ? "chevron-up" : "chevron-down"}
                    size={14}
                    color="#6B7280"
                    style={{ marginLeft: 3 }}
                  />
                </TouchableOpacity>
                {/* Phone Input */}
                <TextInput
                  className="flex-1 text-[15px] text-brand-dark px-3 h-full"
                  placeholder="3001234567"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Country Code Picker Dropdown */}
              {showCountryPicker && (
                <View className="mt-1.5 p-1 rounded-xl border border-brand-border bg-white shadow-sm gap-1">
                  {countryOptions.map((country, idx) => (
                    <TouchableOpacity
                      key={country.code}
                      onPress={() => {
                        setSelectedCountryIndex(idx);
                        setShowCountryPicker(false);
                      }}
                      className={`flex-row items-center justify-between px-3 py-2 rounded-lg ${
                        selectedCountryIndex === idx ? "bg-primary/10" : ""
                      }`}
                    >
                      <View className="flex-row items-center">
                        <Text className="text-[16px] mr-2">{country.flag}</Text>
                        <Text className="text-[13px] text-brand-dark font-medium mr-2">
                          {country.label}
                        </Text>
                      </View>
                      <Text className="text-[13px] text-brand-gray font-semibold">
                        {country.code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Password */}
            <AuthInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
              secureTextEntry
            />
            {/* Password Requirement Hint */}
            <View className="flex-row items-center -mt-2 mb-4 px-1">
              <Ionicons
                name="information-circle-outline"
                size={14}
                color="#6B7280"
                style={{ marginRight: 4 }}
              />
              <Text className="text-[12px] text-brand-gray">
                Password must be at least 8 characters (e.g. Password123!)
              </Text>
            </View>

            {/* Confirm Password */}
            <AuthInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
              secureTextEntry
            />

            {/* Terms Agreement */}
            <TouchableOpacity
              className="flex-row items-start mb-6"
              activeOpacity={0.7}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View
                className={`w-5 h-5 rounded mr-2.5 mt-0.5 items-center justify-center border ${
                  agreedToTerms
                    ? "bg-primary border-primary"
                    : "border-brand-border bg-white"
                }`}
              >
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text className="flex-1 text-[13px] text-brand-gray leading-[18px]">
                I agree to the{" "}
                <Text className="text-primary font-medium underline">
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text className="text-primary font-medium underline">
                  Privacy Policy
                </Text>
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

            {/* Create Account Button */}
            {isSubmitting ? (
              <View className="h-[52px] items-center justify-center rounded-xl bg-primary">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : (
              <AuthButton title="Create Account" onPress={handleRegister} />
            )}

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-brand-border" />
              <Text className="mx-4 text-[13px] text-brand-gray">
                or sign up with
              </Text>
              <View className="flex-1 h-px bg-brand-border" />
            </View>

            {/* Social Signup */}
            <SocialLoginButton
              title="Sign up with Google"
              onPress={() => {}}
            />

            {/* Login Link */}
            <View className="flex-row justify-center mt-6 mb-28">
              <Text className="text-[14px] text-brand-gray">
                Already have an account?{"  "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login" as any)}>
                <Text className="text-[14px] font-bold text-primary">
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
