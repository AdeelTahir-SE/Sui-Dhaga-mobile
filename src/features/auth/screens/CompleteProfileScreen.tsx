import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { RoleCard } from "../components/RoleCard";

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

const countryOptions = [
  { code: "+92", flag: "🇵🇰", label: "Pakistan" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+1", flag: "🇺🇸", label: "USA/CA" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
];

export default function CompleteProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, completeProfile, logout } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<Role>(
    user?.role === "tailor" ? "tailor" : "customer"
  );
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Pre-fill phone if available from Google
  const initialPhone = user?.phone ? user.phone.replace(/^\+92/, "").replace(/^\+\d+/, "").trim() : "";
  const [phone, setPhone] = useState(initialPhone);

  // Tailor specific fields
  const [shopName, setShopName] = useState("");
  const [city, setCity] = useState("Lahore");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayName = user?.fullName || user?.name || "User";
  const displayEmail = user?.email || "";
  const avatarUrl = user?.avatarUrl || user?.avatar;

  const handleCompleteProfile = async () => {
    setErrorMessage(null);

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setErrorMessage("Please provide a valid phone number to continue.");
      return;
    }

    if (trimmedPhone.length < 7) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    const fullPhoneNumber = `${countryOptions[selectedCountryIndex].code}${trimmedPhone.replace(/^0+/, "")}`;

    if (selectedRole === "tailor" && shopName.trim().length > 0 && shopName.trim().length < 2) {
      setErrorMessage("Please enter a valid boutique / shop name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await completeProfile({
        role: selectedRole,
        phone: fullPhoneNumber,
        shopName: shopName.trim() || undefined,
        city: city.trim() || undefined,
        fullName: displayName,
      });

      if (success) {
        if (selectedRole === "tailor") {
          router.replace("/tailor-dashboard" as any);
        } else {
          router.replace("/home" as any);
        }
      } else {
        setErrorMessage("Failed to complete profile. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login" as any);
        },
      },
    ]);
  };

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
          {/* Top Header Actions */}
          <View className="flex-row items-center justify-between px-5 pt-2">
            <View className="px-3 py-1 rounded-full bg-primary/10">
              <Text className="text-[12px] font-semibold text-primary">
                Final Step: Account Setup
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-row items-center py-1 px-2"
            >
              <Text className="text-[13px] text-brand-gray font-medium mr-1">
                Sign out
              </Text>
              <Ionicons name="log-out-outline" size={16} color="#6F767E" />
            </TouchableOpacity>
          </View>

          <View className="px-6 mt-4">
            {/* Main Header */}
            <Text className="text-[24px] font-bold text-brand-dark">
              Complete Your Profile
            </Text>
            <Text className="text-[14px] text-brand-gray mt-1 mb-5 leading-5">
              Welcome to Sui Dhaga! Please confirm your account role and contact details to finalize your account.
            </Text>

            {/* Google Account Profile Preview Card */}
            <View className="p-4 rounded-xl border border-brand-border bg-[#F8FAFC] mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-2">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 46, height: 46, borderRadius: 23 }}
                  />
                ) : (
                  <View className="w-[46px] h-[46px] rounded-full bg-primary/20 items-center justify-center">
                    <Text className="text-[18px] font-bold text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View className="ml-3 flex-1">
                  <Text className="text-[15px] font-semibold text-brand-dark" numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text className="text-[12px] text-brand-gray" numberOfLines={1}>
                    {displayEmail}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center bg-white px-2.5 py-1.5 rounded-lg border border-brand-border">
                <Ionicons name="checkmark-circle" size={14} color="#14919B" style={{ marginRight: 4 }} />
                <Text className="text-[11px] font-medium text-brand-dark">
                  Google
                </Text>
              </View>
            </View>

            {/* Role Selection */}
            <Text className="text-[14px] font-semibold text-brand-dark mb-2">
              I want to join Sui Dhaga as:
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

            {/* Phone Number Field */}
            <View className="mb-5">
              <Text className="text-[13px] font-semibold text-brand-dark mb-1">
                Phone Number <Text className="text-red-500">*</Text>
              </Text>
              <Text className="text-[11px] text-brand-gray mb-2">
                Required for order progress alerts, measurement bookings, and SMS notifications.
              </Text>

              <View className="flex-row gap-2">
                {/* Country Code Selector */}
                <TouchableOpacity
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                  className="flex-row items-center justify-center px-3 h-[52px] rounded-xl border border-brand-border bg-white"
                >
                  <Text className="text-[15px] mr-1.5">
                    {countryOptions[selectedCountryIndex].flag}
                  </Text>
                  <Text className="text-[13px] font-semibold text-brand-dark mr-1">
                    {countryOptions[selectedCountryIndex].code}
                  </Text>
                  <Ionicons
                    name={showCountryPicker ? "chevron-up" : "chevron-down"}
                    size={14}
                    color="#6B7280"
                  />
                </TouchableOpacity>

                {/* Mobile Input */}
                <View className="flex-1 flex-row items-center px-3 h-[52px] rounded-xl border border-brand-border bg-white">
                  <TextInput
                    placeholder="300 1234567"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    keyboardType="phone-pad"
                    className="flex-1 text-[14px] text-brand-dark"
                  />
                  {phone.length > 0 && (
                    <TouchableOpacity onPress={() => setPhone("")}>
                      <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Country Picker Dropdown */}
              {showCountryPicker && (
                <View className="mt-2 p-1.5 rounded-xl border border-brand-border bg-white shadow-sm gap-1">
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

            {/* Tailor Specific Fields (Animated / Smoothly displayed) */}
            {selectedRole === "tailor" && (
              <View className="p-4 rounded-xl border border-primary/20 bg-primary/5 mb-5 gap-3">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="cut" size={16} color="#14919B" style={{ marginRight: 6 }} />
                  <Text className="text-[13px] font-bold text-primary">
                    Tailor Boutique Details
                  </Text>
                </View>

                <AuthInput
                  label="Boutique / Shop Name (Optional)"
                  placeholder="e.g. Royal Needle Studio"
                  value={shopName}
                  onChangeText={setShopName}
                />

                <AuthInput
                  label="City"
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            )}

            {/* Error Message */}
            {errorMessage ? (
              <View className="mb-4">
                <AuthMessageBanner
                  type="error"
                  message={errorMessage}
                  onDismiss={() => setErrorMessage(null)}
                />
              </View>
            ) : null}

            {/* Submit Button */}
            {isSubmitting ? (
              <View className="h-[52px] items-center justify-center rounded-xl bg-primary mb-12">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : (
              <View className="mb-12">
                <AuthButton
                  title={selectedRole === "tailor" ? "Go to Tailor Dashboard" : "Start Exploring Outfits"}
                  onPress={handleCompleteProfile}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
