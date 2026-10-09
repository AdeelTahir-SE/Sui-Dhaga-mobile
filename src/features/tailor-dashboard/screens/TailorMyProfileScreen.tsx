import React, { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { useAuthStore } from "../../../stores/auth.store";
import { toast } from "../../../stores/toast.store";
import { useTailorProfile } from "../hooks/useTailorProfile";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { ProfileMenuRow } from "../../customer-tabs/components/ProfileMenuRow";
import { extractAvatarUrl, usersApi } from "../../../api/users.api";
import { storage } from "../../../api/client";
import { User } from "../../../types/api";
import { TailorProfileSkeleton } from "@/components/ui/Skeleton";

export default function TailorMyProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const { profile, isLoading, refresh, isComplete } = useTailorProfile();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const currentUser = useAuthStore.getState().user;
      const isAuth = useAuthStore.getState().isAuthenticated;
      if (!isAuth || !currentUser || currentUser.id === "guest" || currentUser.id?.startsWith("guest")) {
        return;
      }
      refresh?.();
    }, [refresh])
  );

  const pickAvatar = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access your photos is required to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploadingAvatar(true);

        try {
          const res = await usersApi.uploadAvatar(asset);
          const newAvatarUrl = extractAvatarUrl(res.data) || asset.uri;

          if (user) {
            const updatedUser: User = {
              ...user,
              avatar: newAvatarUrl,
              avatarUrl: newAvatarUrl,
            };
            setUser(updatedUser);
            await storage.setUser(updatedUser).catch(() => {});
          }

          await refresh?.();
          Alert.alert("Success", "Profile avatar updated successfully!");
        } catch (uploadErr: any) {
          const localUri = asset.uri;
          if (user) {
            const updatedUser: User = {
              ...user,
              avatar: localUri,
              avatarUrl: localUri,
            };
            setUser(updatedUser);
            await storage.setUser(updatedUser).catch(() => {});
          }
          await refresh?.();
          Alert.alert(
            "Avatar Saved",
            uploadErr?.message
              ? `Profile avatar updated locally. (${uploadErr.message})`
              : "Profile avatar updated locally."
          );
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (err: any) {
      setIsUploadingAvatar(false);
      Alert.alert("Error", err?.message || "Failed to update profile image");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to sign out of your tailor account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
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
    p.shop_name ||
    p.businessName ||
    user?.fullName ||
    user?.name ||
    "Shop Name Not Set";

  const ownerName =
    p.profile?.full_name ||
    p.name ||
    p.user?.fullName ||
    p.user?.name ||
    user?.fullName ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "");

  const phone =
    p.phone ||
    p.profile?.phone ||
    p.user?.phone ||
    user?.phone ||
    "Not set";

  const city =
    p.city ||
    (typeof p.location === "object" ? p.location?.city : null) ||
    (typeof p.location === "string" ? p.location : null) ||
    "";

  const address =
    p.address ||
    (typeof p.location === "object" ? p.location?.address : null) ||
    "";

  const locationText =
    city && address
      ? `${city} • ${address}`
      : city || address || "Location not set";

  const startingPrice =
    p.startingPrice !== undefined && p.startingPrice !== null && p.startingPrice !== "" && Number(p.startingPrice) > 0
      ? `Rs. ${Number(p.startingPrice).toLocaleString()}`
      : p.services?.[0]?.price !== undefined && Number(p.services[0].price) > 0
      ? `Rs. ${Number(p.services[0].price).toLocaleString()}`
      : "Not set";

  const rawExp =
    p.experienceYears !== undefined && p.experienceYears !== null && p.experienceYears !== ""
      ? p.experienceYears
      : p.experience_years !== undefined && p.experience_years !== null && p.experience_years !== ""
      ? p.experience_years
      : null;

  const organization =
    p.organizationName ||
    p.organization_name ||
    p.organization ||
    "";

  const expNum = rawExp !== null ? Number(rawExp) : null;
  const experience =
    expNum !== null && !isNaN(expNum) && expNum > 0
      ? `${expNum} Years`
      : expNum !== null && !isNaN(expNum) && expNum === 0
      ? "0 Years"
      : "Not set";

  const rating =
    p.rating !== undefined && p.rating !== null && Number(p.rating) > 0
      ? Number(p.rating).toFixed(1)
      : "New";

  const reviewsCount =
    p.reviewsCount !== undefined && p.reviewsCount !== null
      ? `${p.reviewsCount} reviews`
      : p.review_count !== undefined && p.review_count !== null
      ? `${p.review_count} reviews`
      : p.reviews !== undefined && p.reviews !== null
      ? `${p.reviews} reviews`
      : "0 reviews";

  const specialties: string[] =
    Array.isArray(p.specialties) && p.specialties.length > 0
      ? p.specialties
      : p.specialty
      ? [p.specialty]
      : Array.isArray(p.services) && p.services.length > 0
      ? p.services.map((s: any) => s.title || s.name).filter(Boolean)
      : [];

  const bio = p.bio?.trim() || "";

  const tailorAvatarUri =
    user?.avatarUrl ||
    user?.avatar ||
    p.avatarUrl ||
    p.avatar ||
    p.profile?.avatar_url ||
    p.profile?.avatarUrl ||
    p.profile?.avatar ||
    p.user?.avatarUrl ||
    p.user?.avatar ||
    null;

  const bannerUri =
    p.bannerUrl ||
    p.banner_url ||
    p.banner ||
    p.shop_banner ||
    p.shopBanner ||
    null;

  const initials = (shopName || "T").charAt(0).toUpperCase();

  const isUnauthenticated =
    !user ||
    !isAuthenticated ||
    user.id === "guest" ||
    user.id?.startsWith("guest");

  if (isUnauthenticated) {
    return (
      <TailorDashboardShell bottomTabs={<TailorDashboardTabs active="Profile" />}>
        <TailorProfileSkeleton />
      </TailorDashboardShell>
    );
  }

  return (
    <TailorDashboardShell bottomTabs={<TailorDashboardTabs active="Profile" />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Top Header Bar */}
        <View className="px-5 pt-3 pb-2">
          <Text className="text-[24px] font-black tracking-tight text-brand-dark">
            Tailor Profile
          </Text>
          <Text className="text-[12px] font-medium text-brand-gray">
            Your workshop & business settings
          </Text>
        </View>

        {isLoading && !profile ? (
          <TailorProfileSkeleton />
        ) : (
          <View className="px-5 pt-3">
            {/* Incomplete Profile Setup Banner */}
            {!isLoading && (!isComplete || user?.profileCompleted === false) && (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push("/tailor-dashboard/complete-profile" as any)}
                className="mb-4 overflow-hidden rounded-2xl border border-amber-300 bg-amber-50/95 p-4 shadow-xs"
                style={{
                  backgroundColor: "#FFFBEB",
                  borderColor: "#FCD34D",
                  borderWidth: 1.5,
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <View className="flex-row items-start">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: "#FEF3C7",
                      borderWidth: 1,
                      borderColor: "#FDE68A",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="sparkles" size={20} color="#D97706" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#92400E" }}>
                      Profile Setup Incomplete
                    </Text>
                    <Text
                      style={{
                        fontSize: 12.5,
                        lineHeight: 17,
                        fontWeight: "500",
                        color: "#78350F",
                        marginTop: 4,
                      }}
                    >
                      Please complete your profile so that customers can find you, view your services, and place orders.
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                        alignSelf: "flex-start",
                        backgroundColor: "#D97706",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 11.5, fontWeight: "700", color: "#FFFFFF", marginRight: 4 }}>
                        Complete Profile Now
                      </Text>
                      <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Main Profile Card */}
          <View className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-xs">
            {/* Optional Workshop Banner Cover */}
            {bannerUri ? (
              <View className="relative h-28 w-full bg-brand-surface">
                <Image
                  source={{ uri: bannerUri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/10" />
              </View>
            ) : null}

            <View className="p-4">
              <View className="flex-row items-center">
                {/* Avatar with Camera Overlay */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickAvatar}
                  disabled={isUploadingAvatar}
                  className="relative"
                  accessibilityLabel="Change profile picture"
                  accessibilityRole="button"
                >
                  <View className="h-16 w-16 rounded-2xl border border-brand-border bg-primary-50 overflow-hidden items-center justify-center">
                    {tailorAvatarUri ? (
                      <Image
                        source={{ uri: tailorAvatarUri }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center justify-center w-full h-full bg-primary-50">
                        <Text className="text-[22px] font-black text-primary">
                          {initials}
                        </Text>
                      </View>
                    )}
                  </View>

                  {isUploadingAvatar ? (
                    <View className="absolute inset-0 items-center justify-center rounded-2xl bg-black/40">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  ) : (
                    <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-primary border-2 border-white shadow-xs">
                      <Ionicons name="camera" size={11} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Name, Role & Contact */}
                <View className="ml-3.5 flex-1 justify-center">
                  <View className="flex-row items-center">
                    <Text
                      className="text-[18px] font-black text-brand-dark tracking-tight flex-1"
                      numberOfLines={1}
                    >
                      {shopName}
                    </Text>
                    <View className="ml-2 rounded-full bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
                      <Text className="text-[10px] font-bold text-emerald-700">
                        Tailor
                      </Text>
                    </View>
                    {organization ? (
                      <View className="ml-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 border border-amber-200">
                        <Text className="text-[10px] font-bold text-amber-800">
                          {organization}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {ownerName && ownerName !== shopName ? (
                    <Text className="mt-0.5 text-[13px] font-semibold text-brand-dark" numberOfLines={1}>
                      {ownerName}
                    </Text>
                  ) : null}

                  {user?.email ? (
                    <View className="mt-1 flex-row items-center">
                      <Ionicons name="mail-outline" size={12} color="#6F767E" />
                      <Text
                        className="ml-1.5 text-[12px] font-medium text-brand-gray flex-1"
                        numberOfLines={1}
                      >
                        {user.email}
                      </Text>
                    </View>
                  ) : null}

                  {phone && phone !== "Not set" ? (
                    <View className="mt-0.5 flex-row items-center">
                      <Ionicons name="call-outline" size={12} color="#6F767E" />
                      <Text
                        className="ml-1.5 text-[12px] font-medium text-brand-gray flex-1"
                        numberOfLines={1}
                      >
                        {phone}
                      </Text>
                    </View>
                  ) : null}

                  {locationText && locationText !== "Location not set" ? (
                    <View className="mt-0.5 flex-row items-center">
                      <Ionicons name="location-outline" size={12} color="#6F767E" />
                      <Text
                        className="ml-1.5 text-[12px] font-medium text-brand-gray flex-1"
                        numberOfLines={1}
                      >
                        {locationText}
                      </Text>
                    </View>
                  ) : null}
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
          </View>

          {/* Workshop Overview: Specialties, Organization & Bio */}
          {(specialties.length > 0 || bio || organization) && (
            <View className="mt-5">
              <Text className="mb-2.5 px-1 text-[14px] font-bold text-primary">
                Workshop Overview
              </Text>
              <View className="rounded-2xl border border-brand-border bg-white p-4 shadow-xs">
                {organization ? (
                  <View className={specialties.length > 0 || bio ? "mb-3" : ""}>
                    <Text className="mb-1 text-[11px] font-bold uppercase tracking-wider text-brand-gray">
                      Affiliated Organization
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="business-outline" size={14} color="#14919B" />
                      <Text className="ml-1.5 text-[13px] font-bold text-brand-dark">
                        {organization}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {specialties.length > 0 && (
                  <View className={bio ? "mb-3" : ""}>
                    <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-gray">
                      Specialties
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      {specialties.map((spec) => (
                        <View
                          key={spec}
                          className="rounded-lg border border-primary/20 bg-primary-50 px-2.5 py-1"
                        >
                          <Text className="text-[12px] font-semibold text-primary">
                            {spec}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {bio ? (
                  <View>
                    <Text className="mb-1 text-[11px] font-bold uppercase tracking-wider text-brand-gray">
                      About Craftsmanship
                    </Text>
                    <Text className="text-[13px] leading-5 font-medium text-brand-dark">
                      {bio}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}

          {/* Group 1: Business Management */}
          <View className="mt-5">
            <Text className="mb-2.5 px-1 text-[14px] font-bold text-primary">
              Business Management
            </Text>
            <View className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-xs">
              <ProfileMenuRow
                title="Edit Business Profile"
                subtitle="Shop details, banner, specialties & location pin"
                icon="storefront-outline"
                onPress={() => router.push("/tailor-dashboard/complete-profile" as any)}
              />
              <ProfileMenuRow
                title="Working Hours & Slots"
                subtitle="Set daily availability and appointment limits"
                icon="time-outline"
                onPress={() => router.push("/tailor-dashboard/availability" as any)}
              />
              <ProfileMenuRow
                title="Earnings & Payouts"
                subtitle="View revenue, pending payments, and transactions"
                icon="wallet-outline"
                onPress={() => router.push("/tailor-dashboard/earnings" as any)}
              />
              <ProfileMenuRow
                title="Preview Tailor Directory"
                subtitle="See how customers discover your profile"
                icon="eye-outline"
                isLast
                onPress={() =>
                  router.push({
                    pathname: "/tailors",
                    params: { from: "tailor" },
                  } as any)
                }
              />
            </View>
          </View>

          {/* Group 2: Orders & Customer Engagements */}
          <View className="mt-5">
            <Text className="mb-2.5 px-1 text-[14px] font-bold text-primary">
              Orders & Engagements
            </Text>
            <View className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-xs">
              <ProfileMenuRow
                title="Orders & Requests"
                subtitle="Active stitching orders and job progress"
                icon="bag-handle-outline"
                onPress={() => router.push("/tailor-dashboard/orders" as any)}
              />
              <ProfileMenuRow
                title="Appointments"
                subtitle="Tailor consultations & fitting schedules"
                icon="calendar-outline"
                onPress={() => router.push("/tailor-dashboard/appointments" as any)}
              />
              <ProfileMenuRow
                title="Client Messages"
                subtitle="Direct chat with customers & inquiries"
                icon="chatbubbles-outline"
                isLast
                onPress={() => router.push("/tailor-dashboard/messages" as any)}
              />
            </View>
          </View>

          {/* Group 3: Account Settings & Support */}
          <View className="mt-5">
            <Text className="mb-2.5 px-1 text-[14px] font-bold text-primary">
              Account Settings & Support
            </Text>
            <View className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-xs">
              <ProfileMenuRow
                title="Tailor Partner Support"
                subtitle="suidhagaofficial.pakistan@gmail.com"
                icon="help-circle-outline"
                isLast
                onPress={() => {
                  Alert.alert(
                    "Sui Dhaga Partner Support",
                    "Need help with your workshop profile, orders, payouts or customer bookings?\n\nEmail: suidhagaofficial.pakistan@gmail.com",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Send Email",
                        onPress: () => {
                          Linking.openURL("mailto:suidhagaofficial.pakistan@gmail.com").catch(() => {});
                        },
                      },
                    ]
                  );
                }}
              />
            </View>
          </View>

          {/* Logout Action */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            className="mt-6 flex-row items-center rounded-2xl border border-red-200 bg-white p-3.5 shadow-2xs"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-red-600">
              <Ionicons name="log-out" size={18} color="#FFFFFF" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-bold text-red-600">
                Log Out
              </Text>
              <Text className="mt-0.5 text-[12px] font-medium text-red-400">
                Sign out of this tailor account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#DC2626" />
          </TouchableOpacity>

          <Text className="mt-5 text-center text-[11px] font-medium text-brand-gray/60">
            Sui Dhaga Partner • v{Constants.expoConfig?.version || "1.0.3"}
          </Text>
        </View>
        )}
      </ScrollView>
    </TailorDashboardShell>
  );
}
