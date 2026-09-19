import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { ProfileMenuRow } from "../components/ProfileMenuRow";
import { AuthButton } from "../../auth/components/AuthButton";
import { useAuthStore } from "../../../stores/auth.store";
import { storage } from "../../../api/client";
import { extractAvatarUrl, usersApi } from "../../../api/users.api";
import { User } from "../../../types/api";

import { useOrders } from "../../booking-orders/hooks/useOrders";
import { useAppointments } from "../../booking-orders/hooks/useAppointments";
import { useDesigns } from "../../design-studio/hooks/useDesigns";
import { useMeasurements } from "../../measurements-community-checkout/hooks/useMeasurements";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Live counts for quick metric chips
  const { orders } = useOrders();
  const { appointments } = useAppointments();
  const { designs } = useDesigns();
  const { measurements } = useMeasurements();

  const activeOrdersCount = orders.filter(
    (o) =>
      o.status?.toLowerCase() !== "delivered" &&
      o.status?.toLowerCase() !== "cancelled"
  ).length;

  const upcomingAppointmentsCount = appointments.filter(
    (a) =>
      a.status?.toLowerCase() !== "completed" &&
      a.status?.toLowerCase() !== "cancelled"
  ).length;

  // Auto-refresh profile data when screen gains focus
  const fetchFreshUser = useCallback(() => {
    let isMounted = true;
    usersApi
      .getMe()
      .then((res) => {
        if (!isMounted) return;
        if (res.data) {
          const serverUser = res.data;
          const actualAvatar =
            serverUser.avatar_url ||
            serverUser.avatarUrl ||
            serverUser.avatar ||
            (serverUser as any).image ||
            (serverUser as any).imageUrl ||
            (serverUser as any).profileImage ||
            (serverUser as any).profile?.avatar_url ||
            (serverUser as any).profile?.avatarUrl ||
            user?.avatar_url ||
            user?.avatarUrl ||
            user?.avatar;

          const updatedUser: User = {
            ...(user || {}),
            ...serverUser,
            avatar_url: actualAvatar,
            avatarUrl: actualAvatar,
            avatar: actualAvatar,
          };
          setUser(updatedUser);
          storage.setUser(updatedUser).catch(() => {});
        }
      })
      .catch(() => {
        // Ignore network errors on background refresh
      });

    return () => {
      isMounted = false;
    };
  }, [user, setUser]);

  useFocusEffect(
    useCallback(() => {
      const cleanup = fetchFreshUser();
      return cleanup;
    }, [fetchFreshUser])
  );

  const openEditModal = () => {
    setEditName(user?.fullName || user?.name || "");
    setEditPhone(user?.phone || "");
    setEditAddress(user?.address || "");
    setIsEditModalVisible(true);
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Required", "Please enter your name");
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload: Partial<User> = {
        name: editName.trim(),
        fullName: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      };

      const res = await usersApi.updateProfile(payload);
      const updatedData = res.data || payload;

      const updatedUser: User = user
        ? {
            ...user,
            ...updatedData,
            fullName: editName.trim(),
            name: editName.trim(),
            phone: editPhone.trim(),
            address: editAddress.trim(),
          }
        : {
            id: "guest",
            email: "customer@suidhaga.app",
            role: "customer" as const,
            fullName: editName.trim(),
            name: editName.trim(),
            phone: editPhone.trim(),
            address: editAddress.trim(),
          };

      setUser(updatedUser);
      await storage.setUser(updatedUser).catch(() => {});
      setIsEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      // Fallback local update if API endpoint returns 404/500
      const updatedUser: User = user
        ? {
            ...user,
            fullName: editName.trim(),
            name: editName.trim(),
            phone: editPhone.trim(),
            address: editAddress.trim(),
          }
        : {
            id: "guest",
            email: "customer@suidhaga.app",
            role: "customer" as const,
            fullName: editName.trim(),
            name: editName.trim(),
            phone: editPhone.trim(),
            address: editAddress.trim(),
          };
      setUser(updatedUser);
      await storage.setUser(updatedUser).catch(() => {});
      setIsEditModalVisible(false);
      Alert.alert(
        "Profile Saved",
        "Your profile changes have been saved to your device."
      );
    } finally {
      setIsSavingProfile(false);

    }
  };

  const pickImage = async () => {
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
        setIsUploading(true);

        try {
          const res = await usersApi.uploadAvatar(asset);
          const newAvatarUrl = extractAvatarUrl(res.data) || asset.uri;

          const updatedUser: User = user
            ? {
                ...user,
                avatar: newAvatarUrl,
                avatarUrl: newAvatarUrl,
                avatar_url: newAvatarUrl,
              }
            : {
                id: "guest",
                email: "guest@suidhaga.app",
                name: "Guest User",
                fullName: "Guest User",
                role: "customer" as const,
                avatar: newAvatarUrl,
                avatarUrl: newAvatarUrl,
                avatar_url: newAvatarUrl,
              };

          setUser(updatedUser);
          await storage.setUser(updatedUser).catch(() => {});
          Alert.alert("Success", "Profile avatar updated successfully!");
        } catch (uploadErr: any) {
          // Fallback to local image preview so user sees their chosen avatar immediately
          const localAvatarUri = asset.uri;
          const updatedUser: User = user
            ? {
                ...user,
                avatar: localAvatarUri,
                avatarUrl: localAvatarUri,
                avatar_url: localAvatarUri,
              }
            : {
                id: "guest",
                email: "guest@suidhaga.app",
                name: "Guest User",
                fullName: "Guest User",
                role: "customer" as const,
                avatar: localAvatarUri,
                avatarUrl: localAvatarUri,
                avatar_url: localAvatarUri,
              };

          setUser(updatedUser);
          await storage.setUser(updatedUser).catch(() => {});

          Alert.alert(
            "Avatar Updated",
            uploadErr?.message
              ? `Profile avatar updated locally. (${uploadErr.message})`
              : "Profile avatar updated locally."
          );
        } finally {
          setIsUploading(false);
        }
      }
    } catch (err: any) {
      setIsUploading(false);
      Alert.alert("Error", err?.message || "Failed to update profile image");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to sign out of Sui Dhaga?",
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

  const emailPrefix = user?.email ? user.email.split("@")[0] : "Customer";
  const displayName =
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    emailPrefix;
  const displayEmail = user?.email || "customer@suidhaga.app";
  const displayPhone = user?.phone || "+91 (Not configured)";
  const displayAddress = user?.address || "Address not provided yet";

  const avatarUri =
    user?.avatar_url ||
    user?.avatarUrl ||
    user?.avatar ||
    (user as any)?.image ||
    (user as any)?.imageUrl ||
    (user as any)?.profileImage ||
    null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "SD";
  };
  const initials = getInitials(displayName);

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Profile" />}>
      {/* Top Header Bar */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-[24px] font-black tracking-tight text-brand-dark">
          Profile
        </Text>
        <Text className="text-[12px] font-medium text-brand-gray">
          Your personal fit & tailoring preferences
        </Text>
      </View>

      <View className="px-5 pt-3 pb-8">
        {/* Main Profile Card */}
        <View className="rounded-2xl border border-brand-border bg-white p-4 shadow-xs">
          <View className="flex-row items-center">
            {/* Avatar with Camera Overlay */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickImage}
              disabled={isUploading}
              className="relative"
              accessibilityLabel="Change profile picture"
              accessibilityRole="button"
            >
              <View className="h-16 w-16 rounded-2xl border border-brand-border bg-primary-50 overflow-hidden items-center justify-center">
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View className="items-center justify-center w-full h-full bg-primary-50">
                    <Text className="text-[22px] font-black text-primary">
                      {initials}
                    </Text>
                  </View>
                )}
              </View>

              {isUploading ? (
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
              <View className="flex-row items-center gap-2">
                <Text
                  className="text-[17px] font-black text-brand-dark tracking-tight flex-1"
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <View className="rounded-full bg-primary/10 px-2 py-0.5 border border-primary/20">
                  <Text className="text-[10px] font-black text-primary">
                    Customer
                  </Text>
                </View>
              </View>

              <View className="mt-1 flex-row items-center">
                <Ionicons name="mail-outline" size={12} color="#6F767E" />
                <Text
                  className="ml-1.5 text-[12px] font-medium text-brand-gray flex-1"
                  numberOfLines={1}
                >
                  {displayEmail}
                </Text>
              </View>

              <View className="mt-0.5 flex-row items-center">
                <Ionicons name="call-outline" size={12} color="#6F767E" />
                <Text
                  className="ml-1.5 text-[12px] font-medium text-brand-gray flex-1"
                  numberOfLines={1}
                >
                  {displayPhone}
                </Text>
              </View>

              {user?.address ? (
                <View className="mt-0.5 flex-row items-center">
                  <Ionicons name="location-outline" size={12} color="#6F767E" />
                  <Text
                    className="ml-1.5 text-[12px] font-medium text-brand-gray flex-1"
                    numberOfLines={1}
                  >
                    {user.address}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Group 1: Bespoke Tailoring & Activity */}
        <View className="mt-6">
          <Text className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-brand-gray">
            Bespoke Studio & Activity
          </Text>
          <View className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-xs">
            <ProfileMenuRow
              title="My Measurements"
              subtitle="Precision body dimension profiles"
              icon="body-outline"
              badge={measurements.length > 0 ? `${measurements.length} Saved` : undefined}
              onPress={() => router.push("/measurements" as any)}
            />
            <ProfileMenuRow
              title="Saved Designs"
              subtitle="Custom sketches & studio outfits"
              icon="color-wand-outline"
              badge={designs.length > 0 ? `${designs.length} Saved` : undefined}
              onPress={() => router.push("/design" as any)}
            />
            <ProfileMenuRow
              title="Orders & Tracking"
              subtitle="Monitor stitching status & past deliveries"
              icon="bag-handle-outline"
              badge={
                activeOrdersCount > 0
                  ? `${activeOrdersCount} Active`
                  : orders.length > 0
                  ? `${orders.length} Orders`
                  : undefined
              }
              onPress={() => router.push("/orders" as any)}
            />
            <ProfileMenuRow
              title="Appointments"
              subtitle="Tailor consultations & fitting schedules"
              icon="calendar-outline"
              badge={
                upcomingAppointmentsCount > 0
                  ? `${upcomingAppointmentsCount} Upcoming`
                  : appointments.length > 0
                  ? `${appointments.length} Booked`
                  : undefined
              }
              isLast
              onPress={() => router.push("/appointments" as any)}
            />
          </View>
        </View>

        {/* Group 2: Account & Support */}
        <View className="mt-5">
          <Text className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-brand-gray">
            Account & Support
          </Text>
          <View className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-xs">
            <ProfileMenuRow
              title="Edit Profile Information"
              subtitle="Name, contact & default delivery address"
              icon="person-outline"
              onPress={openEditModal}
            />
            <ProfileMenuRow
              title="Help & Customer Care"
              subtitle="support@suidhaga.app • 1800-SUI-DHAGA"
              icon="headset-outline"
              isLast
              onPress={() => {
                Alert.alert(
                  "Sui Dhaga Support",
                  "Need help with an order, appointment or measurement?\n\nEmail: support@suidhaga.app\nToll-Free: +91 1800-SUI-DHAGA\nMon-Sat: 9:00 AM - 8:00 PM"
                );
              }}
            />
          </View>
        </View>

        {/* Logout Action */}
        <View className="mt-6">
          <AuthButton
            title="Log Out"
            icon="log-out-outline"
            variant="danger"
            onPress={handleLogout}
          />
        </View>

        <Text className="mt-5 text-center text-[11px] font-medium text-brand-gray/60">
          Sui Dhaga • v1.0.0
        </Text>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsEditModalVisible(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                className="rounded-t-3xl bg-white px-5 pt-4 pb-8"
                style={{
                  paddingBottom: Math.max(insets.bottom + 16, 28),
                  maxHeight: "85%",
                }}
              >
                {/* Header */}
                <View className="flex-row items-center justify-between pb-3 border-b border-brand-border">
                  <View>
                    <Text className="text-[18px] font-black text-brand-dark">
                      Edit Profile
                    </Text>
                    <Text className="text-[12px] font-medium text-brand-gray">
                      Update your personal information
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsEditModalVisible(false)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-brand-surface"
                  >
                    <Ionicons name="close" size={20} color="#1A1D1F" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="mt-4"
                >
                  {/* Full Name */}
                  <View className="mb-4">
                    <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                      Full Name
                    </Text>
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                      className="h-12 rounded-xl border border-brand-border bg-brand-surface/40 px-3.5 text-[14px] font-medium text-brand-dark"
                    />
                  </View>

                  {/* Phone Number */}
                  <View className="mb-4">
                    <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                      Phone Number
                    </Text>
                    <TextInput
                      value={editPhone}
                      onChangeText={setEditPhone}
                      placeholder="+91 98765 43210"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      className="h-12 rounded-xl border border-brand-border bg-brand-surface/40 px-3.5 text-[14px] font-medium text-brand-dark"
                    />
                  </View>

                  {/* Delivery Address */}
                  <View className="mb-5">
                    <Text className="mb-1.5 text-[13px] font-bold text-brand-dark">
                      Default Delivery Address
                    </Text>
                    <TextInput
                      value={editAddress}
                      onChangeText={setEditAddress}
                      placeholder="Flat, street, city, postal code"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      className="h-20 rounded-xl border border-brand-border bg-brand-surface/40 p-3 text-[14px] font-medium text-brand-dark"
                    />
                  </View>

                  {/* Save Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={saveProfile}
                    disabled={isSavingProfile}
                    className="h-12 items-center justify-center rounded-xl bg-primary shadow-sm"
                  >
                    {isSavingProfile ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text className="text-[15px] font-bold text-white tracking-wide">
                        Save Changes
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </CustomerTabShell>
  );
}

