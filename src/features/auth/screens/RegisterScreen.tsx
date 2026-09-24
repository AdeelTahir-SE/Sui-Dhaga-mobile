import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../stores/auth.store";
import { AuthButton } from "../components/AuthButton";
import { AuthEdgeDecorations } from "../components/AuthEdgeDecorations";
import { AuthInput } from "../components/AuthInput";
import { AuthMessageBanner } from "../components/AuthMessageBanner";
import { PasswordStrength } from "../components/PasswordStrength";
import { RegisterStepIndicator } from "../components/RegisterStepIndicator";
import { RoleCard } from "../components/RoleCard";
import { SocialLoginButton } from "../components/SocialLoginButton";

const logoImg = require("@/assets/logos/main-logo.png");
const customerImg = require("@/assets/illustrations/auth-flow/cutomer-crete-account.png");
const tailorImg = require("@/assets/illustrations/auth-flow/tailor-create-account.png");

type Role = "customer" | "tailor";

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
];

interface CountryConfig {
  code: string;
  flag: string;
  label: string;
  placeholder: string;
  maxLength: number;
  hint: string;
  validate: (digits: string) => { isValid: boolean; error?: string };
}

const countryOptions: CountryConfig[] = [
  {
    code: "+92",
    flag: "🇵🇰",
    label: "Pakistan",
    placeholder: "3001234567",
    maxLength: 11,
    hint: "Digits only · 10 or 11 digits (e.g. 3001234567 or 03001234567)",
    validate: (digits: string) => {
      if (digits.startsWith("0")) {
        if (!/^03\d{9}$/.test(digits)) {
          return {
            isValid: false,
            error: "Pakistani number starting with 0 must be 11 digits starting with 03 (e.g., 03001234567).",
          };
        }
      } else {
        if (!/^3\d{9}$/.test(digits)) {
          return {
            isValid: false,
            error: "Pakistani mobile number must be 10 digits starting with 3 (e.g., 3001234567).",
          };
        }
      }
      return { isValid: true };
    },
  },
  {
    code: "+91",
    flag: "🇮🇳",
    label: "India",
    placeholder: "9876543210",
    maxLength: 11,
    hint: "Digits only · 10 digits starting with 6-9",
    validate: (digits: string) => {
      const clean = digits.replace(/^0+/, "");
      if (!/^[6-9]\d{9}$/.test(clean)) {
        return {
          isValid: false,
          error: "Please enter a valid 10-digit Indian mobile number starting with 6-9.",
        };
      }
      return { isValid: true };
    },
  },
  {
    code: "+971",
    flag: "🇦🇪",
    label: "UAE",
    placeholder: "501234567",
    maxLength: 10,
    hint: "Digits only · 9 digits starting with 5",
    validate: (digits: string) => {
      const clean = digits.replace(/^0+/, "");
      if (!/^5\d{8}$/.test(clean)) {
        return {
          isValid: false,
          error: "Please enter a valid 9-digit UAE mobile number starting with 5 (e.g., 501234567).",
        };
      }
      return { isValid: true };
    },
  },
  {
    code: "+1",
    flag: "🇺🇸",
    label: "USA/CA",
    placeholder: "4155552671",
    maxLength: 10,
    hint: "Digits only · 10-digit phone number",
    validate: (digits: string) => {
      const clean = digits.replace(/^0+/, "");
      if (!/^[2-9]\d{9}$/.test(clean)) {
        return {
          isValid: false,
          error: "Please enter a valid 10-digit US/Canada phone number.",
        };
      }
      return { isValid: true };
    },
  },
  {
    code: "+44",
    flag: "🇬🇧",
    label: "UK",
    placeholder: "7911123456",
    maxLength: 11,
    hint: "Digits only · 10-11 digits starting with 7",
    validate: (digits: string) => {
      const clean = digits.replace(/^0+/, "");
      if (!/^7\d{9}$/.test(clean)) {
        return {
          isValid: false,
          error: "Please enter a valid UK mobile number starting with 7 (e.g., 7911123456).",
        };
      }
      return { isValid: true };
    },
  },
];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const register = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        if (result.needsProfileCompletion) {
          router.replace("/auth/complete-profile" as any);
        } else {
          const currentUser = useAuthStore.getState().user;
          if (currentUser?.role === "tailor") {
            router.replace("/tailor-dashboard" as any);
          } else {
            router.replace("/home" as any);
          }
        }
      } else if (result.error && result.error !== "Sign in was cancelled.") {
        setErrorMessage(result.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Google registration failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const currentCountry = countryOptions[selectedCountryIndex];

  // Navigation handlers
  const handlePrevStep = () => {
    setErrorMessage(null);
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.back();
    }
  };

  const handleContinueFromStep1 = () => {
    setErrorMessage(null);
    setCurrentStep(2);
  };

  const handleContinueFromStep2 = () => {
    setErrorMessage(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const rawPhoneDigits = phone.trim().replace(/\D/g, "");
    if (!rawPhoneDigits) {
      setErrorMessage("Please enter your phone number.");
      return;
    }

    const phoneValidation = currentCountry.validate(rawPhoneDigits);
    if (!phoneValidation.isValid) {
      setErrorMessage(
        phoneValidation.error || "Please enter a valid phone number.",
      );
      return;
    }

    setCurrentStep(3);
  };

  const handleRegister = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage("Please agree to the Terms of Service and Privacy Policy.");
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

    const emailPrefix = trimmedEmail.split("@")[0];
    const registeredName = trimmedName || emailPrefix;
    const backendRole: "customer" | "tailor" =
      selectedRole === "tailor" ? "tailor" : "customer";

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const success = await register({
        email: trimmedEmail,
        password,
        name: registeredName,
        role: backendRole,
        phone: formattedPhone,
      });

      if (success) {
        const currentUser = useAuthStore.getState().user;
        const currentToken = useAuthStore.getState().token;
        if (currentToken && currentUser) {
          const needsCompletion = !currentUser.phone || !currentUser.role;
          if (needsCompletion) {
            router.replace("/auth/complete-profile" as any);
            return;
          } else {
            if (currentUser.role === "tailor") {
              router.replace("/tailor-dashboard" as any);
            } else {
              router.replace("/home" as any);
            }
            return;
          }
        }
        setRegistrationSuccess(true);
      } else {
        const storeError = useAuthStore.getState().error;
        setErrorMessage(
          storeError || "Registration failed. Please check your information.",
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (registrationSuccess) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <AuthEdgeDecorations variant="tealNew" />
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
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6 border"
            style={{
              backgroundColor: "rgba(20, 145, 155, 0.1)",
              borderColor: "rgba(20, 145, 155, 0.2)",
            }}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(20, 145, 155, 0.2)" }}
            >
              <Ionicons name="mail-open-outline" size={32} color="#14919B" />
            </View>
          </View>

          {/* Heading & Subtitle */}
          <Text className="text-[26px] font-bold text-brand-dark text-center">
            Account Created! 🎉
          </Text>
          <View
            className="mt-2.5 mb-2 px-3.5 py-1 rounded-full border"
            style={{
              backgroundColor: "rgba(20, 145, 155, 0.1)",
              borderColor: "rgba(20, 145, 155, 0.2)",
            }}
          >
            <Text className="text-[12px] font-bold text-primary uppercase tracking-wider">
              Verification Link Sent
            </Text>
          </View>

          {/* Email Info Card */}
          <View className="w-full rounded-2xl bg-brand-surface p-4 border border-brand-border my-5">
            <View className="flex-row items-center mb-1.5">
              <Ionicons
                name="mail"
                size={15}
                color="#14919B"
                style={{ marginRight: 6 }}
              />
              <Text className="text-[12px] font-semibold text-brand-gray">
                Sent to:
              </Text>
            </View>
            <Text className="text-[15px] font-bold text-brand-dark">
              {email.trim()}
            </Text>
            <View className="h-px bg-brand-border my-2.5" />
            <Text className="text-[12px] text-brand-gray leading-[18px]">
              Please check your inbox (and spam folder) and click the
              verification link to activate your account.
            </Text>
          </View>

          {/* Action Button */}
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
      <AuthEdgeDecorations variant="tealNew" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Bar */}
          <View className="flex-row items-center justify-center px-4 pt-2 pb-2">
            <Image
              source={logoImg}
              className="w-9 h-9 mr-2.5"
              resizeMode="contain"
            />
            <Text
              className="text-[24px] text-brand-dark font-bold"
              style={{
                fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
              }}
            >
              Sui Dhaga
            </Text>
          </View>

          <View className="px-6 pt-2 pb-12">
            {/* Step Progress Tracker */}
            <RegisterStepIndicator currentStep={currentStep} />

            {/* Error Message Banner */}
            {errorMessage ? (
              <AuthMessageBanner
                type="error"
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
              />
            ) : null}

            {/* STEP 1: ROLE SELECTION */}
            {currentStep === 1 && (
              <View>
                <View className="mb-5">
                  <Text className="text-[24px] font-bold text-brand-dark">
                    Choose Account Type
                  </Text>
                  <Text className="text-[13px] text-brand-gray mt-1 leading-[19px]">
                    Select how you would like to experience Sui Dhaga.
                  </Text>
                </View>

                {/* Role Cards */}
                <View className="flex-row gap-3 mb-4">
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

                {/* Role Feature Highlights */}
                <View className="bg-brand-surface rounded-2xl p-4 border border-brand-border mb-6">
                  <View className="flex-row items-center mb-2.5">
                    <Ionicons
                      name={
                        selectedRole === "customer"
                          ? "sparkles-outline"
                          : "briefcase-outline"
                      }
                      size={16}
                      color="#14919B"
                      style={{ marginRight: 6 }}
                    />
                    <Text className="text-[13px] font-bold text-brand-dark">
                      {selectedRole === "customer"
                        ? "What you can do as Customer:"
                        : "What you can do as Tailor Partner:"}
                    </Text>
                  </View>

                  {selectedRole === "customer" ? (
                    <View className="gap-2">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#14919B"
                          style={{ marginRight: 6 }}
                        />
                        <Text className="text-[12px] text-brand-gray">
                          Discover & book top-rated local tailors
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#14919B"
                          style={{ marginRight: 6 }}
                        />
                        <Text className="text-[12px] text-brand-gray">
                          AI Design Studio: Text, Image & Sketch to outfit
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#14919B"
                          style={{ marginRight: 6 }}
                        />
                        <Text className="text-[12px] text-brand-gray">
                          Custom body measurement profile for perfect fit
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View className="gap-2">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#14919B"
                          style={{ marginRight: 6 }}
                        />
                        <Text className="text-[12px] text-brand-gray">
                          List your boutique & get discovered by local clients
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#14919B"
                          style={{ marginRight: 6 }}
                        />
                        <Text className="text-[12px] text-brand-gray">
                          Manage appointments, custom orders & stitching
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#14919B"
                          style={{ marginRight: 6 }}
                        />
                        <Text className="text-[12px] text-brand-gray">
                          Direct payouts & digital shop profile
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Continue Button */}
                <AuthButton
                  title="Continue to Details"
                  onPress={handleContinueFromStep1}
                  icon="arrow-forward"
                />

                {/* Social Sign Up Divider */}
                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-px bg-brand-border" />
                  <Text className="mx-4 text-[12px] font-medium text-brand-gray">
                    or quick register with
                  </Text>
                  <View className="flex-1 h-px bg-brand-border" />
                </View>

                {/* Social Button */}
                <SocialLoginButton
                  title="Sign up with Google"
                  onPress={handleGoogleLogin}
                  loading={isGoogleLoading}
                  disabled={isSubmitting || isGoogleLoading}
                />

                {/* Login Link */}
                <View className="flex-row justify-center mt-6">
                  <Text className="text-[14px] text-brand-gray">
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/auth/login" as any)}
                  >
                    <Text className="text-[14px] font-bold text-primary">
                      Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 2: PERSONAL DETAILS */}
            {currentStep === 2 && (
              <View>
                <View className="mb-5">
                  <Text className="text-[24px] font-bold text-brand-dark">
                    Personal Details
                  </Text>
                  <Text className="text-[13px] text-brand-gray mt-1 leading-[19px]">
                    Enter your contact info so we can set up your profile.
                  </Text>
                </View>

                {/* Full Name */}
                <AuthInput
                  label="Full Name"
                  placeholder="Enter your full name (optional)"
                  icon="person-outline"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="words"
                />

                {/* Email Address */}
                <AuthInput
                  label="Email Address *"
                  placeholder="name@example.com"
                  icon="mail-outline"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Phone Number */}
                <View className="mb-5">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-[13px] font-medium text-brand-dark">
                      Phone Number *
                    </Text>
                    <Text className="text-[11px] text-brand-gray">
                      {phone.length}/{currentCountry.maxLength} digits
                    </Text>
                  </View>
                  <View className="flex-row items-center border border-brand-border rounded-xl h-[52px] bg-white overflow-hidden">
                    {/* Country Code Selector */}
                    <TouchableOpacity
                      onPress={() => setShowCountryPicker(!showCountryPicker)}
                      className="flex-row items-center px-3 h-full border-r border-brand-border bg-gray-50"
                      activeOpacity={0.7}
                    >
                      <Text className="text-[15px] mr-1">
                        {currentCountry.flag}
                      </Text>
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
                    {/* Phone Input with strict digit restriction & max length */}
                    <TextInput
                      className="flex-1 text-[15px] text-brand-dark px-3 h-full"
                      placeholder={currentCountry.placeholder}
                      placeholderTextColor="#9CA3AF"
                      value={phone}
                      onChangeText={(text) => {
                        const digitsOnly = text.replace(/[^0-9]/g, "");
                        const limited = digitsOnly.slice(0, currentCountry.maxLength);
                        setPhone(limited);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      keyboardType="phone-pad"
                      maxLength={currentCountry.maxLength}
                    />
                    {phone.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setPhone("")}
                        className="pr-3 pl-1"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle" size={17} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="text-[11px] text-brand-gray mt-1 ml-1">
                    {currentCountry.hint}
                  </Text>

                  {/* Country Code Picker Dropdown */}
                  {showCountryPicker && (
                    <View className="mt-1.5 p-1 rounded-xl border border-brand-border bg-white shadow-sm gap-1">
                      {countryOptions.map((country, idx) => (
                        <TouchableOpacity
                          key={country.code}
                          onPress={() => {
                            setSelectedCountryIndex(idx);
                            setShowCountryPicker(false);
                            if (phone.length > countryOptions[idx].maxLength) {
                              setPhone(phone.slice(0, countryOptions[idx].maxLength));
                            }
                          }}
                          className={`flex-row items-center justify-between px-3 py-2 rounded-lg ${
                            selectedCountryIndex === idx ? "bg-primary-light" : ""
                          }`}
                        >
                          <View className="flex-row items-center">
                            <Text className="text-[16px] mr-2">
                              {country.flag}
                            </Text>
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

                {/* Navigation Buttons */}
                <View className="gap-3 mt-2">
                  <AuthButton
                    title="Continue to Security"
                    onPress={handleContinueFromStep2}
                    icon="arrow-forward"
                  />
                  <AuthButton
                    title="Back to Role Selection"
                    variant="outlined"
                    onPress={handlePrevStep}
                    icon="arrow-back"
                    textColor="#1A1D1F"
                    iconColor="#1A1D1F"
                  />
                </View>
              </View>
            )}

            {/* STEP 3: SECURITY & FINISH */}
            {currentStep === 3 && (
              <View>
                <View className="mb-5">
                  <Text className="text-[24px] font-bold text-brand-dark">
                    Security & Confirmation
                  </Text>
                  <Text className="text-[13px] text-brand-gray mt-1 leading-[19px]">
                    Create a secure password to protect your account.
                  </Text>
                </View>

                {/* Password Input */}
                <AuthInput
                  label="Create Password"
                  placeholder="At least 8 characters"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry
                />

                {/* Live Password Strength Checklist */}
                <PasswordStrength password={password} />

                {/* Confirm Password Input */}
                <AuthInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  icon="shield-checkmark-outline"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry
                />

                {/* Password Match Indicator */}
                {password.length > 0 && confirmPassword.length > 0 && (
                  <View className="flex-row items-center -mt-2 mb-4 px-1">
                    {password === confirmPassword ? (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#22C55E"
                          style={{ marginRight: 5 }}
                        />
                        <Text className="text-[12px] font-medium text-green-600">
                          Passwords match
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="close-circle"
                          size={15}
                          color="#EF4444"
                          style={{ marginRight: 5 }}
                        />
                        <Text className="text-[12px] font-medium text-red-500">
                          Passwords do not match yet
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Terms Agreement */}
                <TouchableOpacity
                  className="flex-row items-start mb-6 mt-1"
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

                {/* Action Buttons */}
                <View className="gap-3 mt-1 mb-8">
                  <AuthButton
                    title="Create Account"
                    onPress={handleRegister}
                    loading={isSubmitting}
                    disabled={isSubmitting || isGoogleLoading}
                    icon="checkmark-circle"
                  />
                  <AuthButton
                    title="Back to Details"
                    variant="outlined"
                    onPress={handlePrevStep}
                    disabled={isSubmitting}
                    icon="arrow-back"
                    textColor="#1A1D1F"
                    iconColor="#1A1D1F"
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
