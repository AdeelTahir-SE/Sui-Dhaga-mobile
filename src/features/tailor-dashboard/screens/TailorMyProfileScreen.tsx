import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuthStore } from "../../../stores/auth.store";
import { useTailorProfile } from "../hooks/useTailorProfile";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";

const defaultShopImage = require("@/assets/illustrations/customer-tabs/tailors/rekha.png");

export default function TailorMyProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { profile, isLoading, refresh } = useTailorProfile();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out from your tailor account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/auth/login" as any);
          },
        },
      ]
    );
  };

  if (isLoading && !profile) {
    return (
      <TailorDashboardShell
        bottomTabs={<TailorDashboardTabs active="Profile" />}
      >
        <View className="flex-1 items-center justify-center py-20" style={{ minHeight: 520 }}>
          <ActivityIndicator size="large" color="#14919B" />
          <Text className="mt-3 text-[14px] font-medium text-brand-gray">
            Loading your profile...
          </Text>
        </View>
      </TailorDashboardShell>
    );
  }

  const p = (profile || {}) as any;

  const shopName =
    p.shopName ||
    p.businessName ||
    user?.fullName ||
    user?.name ||
    "My Tailor Studio";

  const ownerName =
    p.name ||
    p.user?.fullName ||
    p.user?.name ||
    user?.fullName ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "Master Tailor");

  const phone = p.phone || p.user?.phone || user?.phone || "Phone not set";

  const city =
    (typeof p.location === "object" ? p.location?.city : null) ||
    p.city ||
    (typeof p.location === "string" ? p.location : null) ||
    "Location not specified";

  const address =
    (typeof p.location === "object" ? p.location?.address : null) ||
    p.address ||
    "";

  const startingPrice =
    p.startingPrice !== undefined && p.startingPrice !== null
      ? `Rs. ${Number(p.startingPrice).toLocaleString()}`
      : p.services?.[0]?.price !== undefined
      ? `Rs. ${Number(p.services[0].price).toLocaleString()}`
      : "Rs. 500+";

  const experience =
    p.experienceYears !== undefined && p.experienceYears !== null && p.experienceYears !== ""
      ? `${p.experienceYears} Years`
      : "5+ Years";

  const rating = p.rating ? Number(p.rating).toFixed(1) : "5.0";
  const reviewsCount = `${p.reviewsCount ?? p.reviews ?? 12} reviews`;

  const specialties: string[] =
    p.specialties && p.specialties.length > 0
      ? p.specialties
      : p.specialty
      ? [p.specialty]
      : ["Bridal Wear", "Custom Design", "Alterations"];

  const bio =
    p.bio ||
    "Professional tailor dedicated to delivering bespoke clothing, custom fits, and traditional embroidery for all occasions.";

  const shopImageUri =
    p.imageUrl ||
    p.image ||
    p.avatar ||
    p.shopImage ||
    p.user?.avatarUrl ||
    p.user?.avatar ||
    user?.avatar ||
    user?.avatarUrl;

  return (
    <TailorDashboardShell bottomTabs={<TailorDashboardTabs active="Profile" />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5 pt-4"
      >
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[20px] font-black tracking-tight text-brand-dark">
            Tailor Profile
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push("/tailor-dashboard/complete-profile" as any)}
            className="flex-row items-center rounded-md bg-primary-50 px-3 py-1.5 border border-primary/20"
          >
            <Ionicons name="pencil-sharp" size={14} color="#14919B" />
            <Text className="ml-1.5 text-[12px] font-bold text-primary">
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card Banner */}
        <View className="mb-4 overflow-hidden rounded-md border border-brand-border bg-white p-4 shadow-xs">
          <View className="flex-row items-center">
            {shopImageUri ? (
              <Image
                source={{ uri: shopImageUri }}
                className="h-18 w-18 rounded-md bg-brand-surface"
                style={{ width: 72, height: 72 }}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={defaultShopImage}
                className="h-18 w-18 rounded-md bg-brand-surface"
                style={{ width: 72, height: 72 }}
                resizeMode="cover"
              />
            )}

            <View className="ml-3.5 flex-1">
              <View className="flex-row items-center">
                <Text
                  className="flex-1 text-[17px] font-black tracking-tight text-brand-dark"
                  numberOfLines={1}
                >
                  {shopName}
                </Text>
                <View className="ml-1.5 rounded-md bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  <Text className="text-[10px] font-bold text-emerald-700">
                    Verified
                  </Text>
                </View>
              </View>

              <Text className="mt-0.5 text-[13px] font-bold text-brand-dark" numberOfLines={1}>
                {ownerName}
              </Text>

              <View className="mt-1 flex-row items-center">
                <Ionicons name="location-outline" size={13} color="#6F767E" />
                <Text className="ml-1 text-[12px] font-medium text-brand-gray" numberOfLines={1}>
                  {city}{address ? ` • ${address}` : ""}
                </Text>
              </View>

              <View className="mt-1 flex-row items-center">
                <Ionicons name="call-outline" size={13} color="#6F767E" />
                <Text className="ml-1 text-[12px] font-medium text-brand-gray" numberOfLines={1}>
                  {phone}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Metrics Bar */}
          <View className="mt-4 flex-row divide-x divide-brand-border border-t border-brand-border pt-3">
            <View className="flex-1 items-center">
              <Text className="text-[14px] font-black text-brand-dark">
                ⭐ {rating}
              </Text>
              <Text className="text-[11px] font-medium text-brand-gray">
                {reviewsCount}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-[14px] font-black text-brand-dark">
                {experience}
              </Text>
              <Text className="text-[11px] font-medium text-brand-gray">
                Experience
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-[14px] font-black text-primary">
                {startingPrice}
              </Text>
              <Text className="text-[11px] font-medium text-brand-gray">
                Starts From
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button: Edit Full Profile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/tailor-dashboard/complete-profile" as any)}
          className="mb-5 h-11 flex-row items-center justify-center rounded-md border border-primary bg-primary-50 shadow-xs"
        >
          <Ionicons name="create-outline" size={17} color="#14919B" />
          <Text className="ml-2 text-[13px] font-bold text-primary">
            Update Profile & Pricing
          </Text>
        </TouchableOpacity>

        {/* Specialties */}
        <View className="mb-4">
          <Text className="mb-2 text-[15px] font-black tracking-tight text-brand-dark">
            Tailoring Specialties
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {specialties.map((spec) => (
              <View
                key={spec}
                className="rounded-md border border-brand-border bg-white px-3 py-1.5 shadow-xs"
              >
                <Text className="text-[12px] font-semibold text-brand-dark">
                  {spec}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Bio */}
        <View className="mb-5">
          <Text className="mb-1.5 text-[15px] font-black tracking-tight text-brand-dark">
            About Workshop
          </Text>
          <View className="rounded-md border border-brand-border bg-white p-3.5 shadow-xs">
            <Text className="text-[13px] leading-5 font-medium text-brand-dark">
              {bio}
            </Text>
          </View>
        </View>

        {/* Quick Management Links */}
        <Text className="mb-2 text-[15px] font-black tracking-tight text-brand-dark">
          Business Management
        </Text>
        <View className="mb-5 overflow-hidden rounded-md border border-brand-border bg-white shadow-xs">
          <TouchableOpacity
            onPress={() => router.push("/tailor-dashboard/services" as any)}
            className="flex-row items-center justify-between border-b border-brand-border p-3.5"
          >
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-primary-50">
                <Ionicons name="pricetags-outline" size={16} color="#14919B" />
              </View>
              <View className="ml-3">
                <Text className="text-[13px] font-bold text-brand-dark">
                  Services & Pricing
                </Text>
                <Text className="text-[11px] font-medium text-brand-gray">
                  Manage custom outfits and catalog rates
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/tailor-dashboard/availability" as any)}
            className="flex-row items-center justify-between border-b border-brand-border p-3.5"
          >
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-primary-50">
                <Ionicons name="time-outline" size={16} color="#14919B" />
              </View>
              <View className="ml-3">
                <Text className="text-[13px] font-bold text-brand-dark">
                  Working Hours & Slots
                </Text>
                <Text className="text-[11px] font-medium text-brand-gray">
                  Set daily availability and appointment limits
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/tailor-dashboard/earnings" as any)}
            className="flex-row items-center justify-between border-b border-brand-border p-3.5"
          >
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-primary-50">
                <Ionicons name="wallet-outline" size={16} color="#14919B" />
              </View>
              <View className="ml-3">
                <Text className="text-[13px] font-bold text-brand-dark">
                  Earnings & Payouts
                </Text>
                <Text className="text-[11px] font-medium text-brand-gray">
                  View revenue, pending payments, and transactions
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/tailors" as any)}
            className="flex-row items-center justify-between p-3.5"
          >
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-primary-50">
                <Ionicons name="eye-outline" size={16} color="#14919B" />
              </View>
              <View className="ml-3">
                <Text className="text-[13px] font-bold text-brand-dark">
                  Preview Tailor Directory
                </Text>
                <Text className="text-[11px] font-medium text-brand-gray">
                  See how you appear on the customer tailor search
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="h-12 items-center justify-center rounded-md border border-[#F5D1D1] bg-[#FFF3F3]"
        >
          <Text className="text-[14px] font-bold text-[#D73232] tracking-wide">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TailorDashboardShell>
  );
}
