import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
import { RoleCard } from "../components/RoleCard";

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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<Role>("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
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
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            {/* Email */}
            <AuthInput
              label="Email"
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Phone Number */}
            <View className="mb-4">
              <Text className="text-[13px] font-medium text-brand-dark mb-1.5">
                Phone Number
              </Text>
              <View className="flex-row items-center border border-brand-border rounded-xl h-[52px] bg-white overflow-hidden">
                {/* Country Code */}
                <TouchableOpacity className="flex-row items-center px-3 h-full border-r border-brand-border">
                  <Text className="text-[15px] mr-1">🇮🇳</Text>
                  <Text className="text-[14px] text-brand-dark font-medium">
                    +91
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color="#9CA3AF"
                    style={{ marginLeft: 2 }}
                  />
                </TouchableOpacity>
                {/* Phone Input */}
                <TextInput
                  className="flex-1 text-[15px] text-brand-dark px-3 h-full"
                  placeholder="Enter phone number"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <AuthInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Confirm Password */}
            <AuthInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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

            {/* Create Account Button */}
            <AuthButton title="Create Account" onPress={() => {}} />

            {/* Login Link */}
            <View className="flex-row justify-center mt-6 mb-8">
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
