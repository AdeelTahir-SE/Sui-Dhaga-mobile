import React, { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
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

import Constants from "expo-constants";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { ProfileMenuRow } from "../components/ProfileMenuRow";
import { useAuthStore } from "../../../stores/auth.store";
import { toast } from "../../../stores/toast.store";
import { useAppUpdateStore } from "../../../stores/app-update.store";
import { storage } from "../../../api/client";
import { extractAvatarUrl, usersApi } from "../../../api/users.api";
import { User } from "../../../types/api";
import { CustomerProfileSkeleton } from "../../../components/ui/Skeleton";

import { useOrders } from "../../booking-orders/hooks/useOrders";
import { useAppointments } from "../../booking-orders/hooks/useAppointments";
import { useDesigns } from "../../design-studio/hooks/useDesigns";
import { useMeasurements } from "../../measurements-community-checkout/hooks/useMeasurements";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const checkForUpdate = useAppUpdateStore((state) => state.checkForUpdate);
  const isCheckingUpdate = useAppUpdateStore((state) => state.isChecking);

  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!user);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Live counts for quick metric chips
  const { orders, refresh: refreshOrders } = useOrders();
  const { appointments, refresh: refreshAppointments } = useAppointments();
  const { designs, refresh: refreshDesigns } = useDesigns();
  const { measurements, refresh: refreshMeasurements } = useMeasurements();

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
          const currentUser = useAuthStore.getState().user;
          const actualAvatar =
            serverUser.avatar_url ||
            serverUser.avatarUrl ||
            serverUser.avatar ||
            (serverUser as any).image ||
            (serverUser as any).imageUrl ||
            (serverUser as any).profileImage ||
            (serverUser as any).profile?.avatar_url ||
            (serverUser as any).profile?.avatarUrl ||
            currentUser?.avatar_url ||
            currentUser?.avatarUrl ||
            currentUser?.avatar;

          const updatedUser: User = {
            ...(currentUser || {}),
            ...serverUser,
            email: serverUser.email || currentUser?.email || "",
            phone: serverUser.phone || currentUser?.phone || "",
            role: serverUser.role || currentUser?.role || "customer",
            avatar_url: actualAvatar,
            avatarUrl: actualAvatar,
            avatar: actualAvatar,
          };
          setUser(updatedUser);
          storage.setUser(updatedUser).catch(() => {});
        }
      })
      .catch((err: any) => {
        // Silently preserve cached user profile on background fetch failures
        console.warn("Background fetch of user profile:", err?.message || err);
      })
      .finally(() => {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  useFocusEffect(
    useCallback(() => {
      const currentUser = useAuthStore.getState().user;
      const isAuth = useAuthStore.getState().isAuthenticated;
      if (!isAuth || !currentUser || currentUser.id === "guest" || currentUser.id?.startsWith("guest")) {
        return;
      }
      const cleanup = fetchFreshUser();
      return cleanup;
    }, [fetchFreshUser])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchFreshUser(),
        refreshOrders?.(),
        refreshAppointments?.(),
        refreshDesigns?.(),
        refreshMeasurements?.(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

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
      const trimmedName = editName.trim();
      const trimmedPhone = editPhone.trim();
      const trimmedAddress = editAddress.trim();

      const payload: Partial<User> = {
        name: trimmedName,
        fullName: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
      };

      const currentUser = useAuthStore.getState().user;
      const baseUser: User = currentUser || {
        id: "customer_local",
        email: "",
        role: "customer",
      };

      const isGuestOrLocal =
        !currentUser ||
        !currentUser.id ||
        currentUser.id === "guest" ||
        currentUser.id.startsWith("guest");

      let updatedData: any = {};
      if (!isGuestOrLocal) {
        try {
          const res = await usersApi.updateProfile(payload);
          updatedData = res.data || {};
        } catch (apiErr: any) {
          console.warn("Backend updateProfile sync warning:", apiErr?.message || apiErr);
        }
      }

      const updatedUser: User = {
        ...baseUser,
        ...updatedData,
        id: baseUser.id || updatedData.id || "customer_local",
        email: baseUser.email || updatedData.email || "",
        role: baseUser.role || updatedData.role || "customer",
        fullName: trimmedName,
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        isExistingUser: baseUser.isExistingUser ?? true,
        profileCompleted: true,
      };

      setUser(updatedUser);
      await storage.setUser(updatedUser).catch(() => {});
      setIsEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      console.warn("saveProfile error:", err);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const fallbackUser: User = {
          ...currentUser,
          fullName: editName.trim(),
          name: editName.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
        };
        setUser(fallbackUser);
        await storage.setUser(fallbackUser).catch(() => {});
      }
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

        const currentUser = useAuthStore.getState().user;
        const localAvatarUri = asset.uri;

        const isGuestOrLocal =
          !currentUser ||
          !currentUser.id ||
          currentUser.id === "guest" ||
          currentUser.id.startsWith("guest");

        let remoteAvatarUrl: string | null = null;
        if (!isGuestOrLocal) {
          try {
            const res = await usersApi.uploadAvatar(asset);
            remoteAvatarUrl = extractAvatarUrl(res.data);
          } catch (uploadErr: any) {
            console.warn("Avatar upload remote sync warning:", uploadErr?.message || uploadErr);
          }
        }

        const chosenAvatar = remoteAvatarUrl || localAvatarUri;
        const updatedUser: User = {
          ...(currentUser || { id: "customer_local", email: "", role: "customer" }),
          avatar: chosenAvatar,
          avatarUrl: chosenAvatar,
          avatar_url: chosenAvatar,
        };

        setUser(updatedUser);
        await storage.setUser(updatedUser).catch(() => {});
        setIsUploading(false);
        Alert.alert("Success", "Profile avatar updated successfully!");
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

  const isUnauthenticated =
    !user ||
    !isAuthenticated ||
    user.id === "guest" ||
    user.id?.startsWith("guest");

  if (isUnauthenticated) {
    return (
      <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Profile" />}>
        <CustomerProfileSkeleton />
      </CustomerTabShell>
    );
  }

  const emailPrefix = user?.email ? user.email.split("@")[0] : "";
  const displayName =
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    emailPrefix ||
    "User";
  const displayEmail = user?.email || "";
  const displayPhone = user?.phone || "";
  const displayAddress = user?.address || "";

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

  const showSkeleton = authLoading || isInitialLoading;

  return (
    <CustomerTabShell
      bottomTabs={<CustomerTabsPreview active="Profile" />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#14919B"
          colors={["#14919B"]}
        />
      }
    >
      {/* Top Header Bar */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-[24px] font-black tracking-tight text-brand-dark">
          Profile
        </Text>
        <Text className="text-[12px] font-medium text-brand-gray">
          Your personal fit & tailoring preferences
        </Text>
      </View>

      {showSkeleton ? (
        <CustomerProfileSkeleton />
      ) : (
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
              <Text
                className="text-[18px] font-black text-brand-dark tracking-tight"
                numberOfLines={1}
              >
                {displayName}
              </Text>

              <View className="mt-1.5 flex-row items-center">
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
          <Text className="mb-2.5 px-1 text-[14px] font-bold text-primary">
            Bespoke Studio & Activity
          </Text>
          <View className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-xs">
            <ProfileMenuRow
              title="My Measurements"
              subtitle="Precision body dimension profiles"
              icon="body-outline"
              onPress={() => router.push("/measurements" as any)}
            />
            <ProfileMenuRow
              title="Saved Designs"
              subtitle="Custom sketches & studio outfits"
              icon="color-wand-outline"
              onPress={() => router.push("/design" as any)}
            />
            <ProfileMenuRow
              title="Orders & Tracking"
              subtitle="Monitor stitching status & past deliveries"
              icon="bag-handle-outline"
              onPress={() => router.push("/orders" as any)}
            />
            <ProfileMenuRow
              title="Appointments"
              subtitle="Tailor consultations & fitting schedules"
              icon="calendar-outline"
              onPress={() => router.push("/appointments" as any)}
            />
            <ProfileMenuRow
              title="Community Profile & Posts"
              subtitle="Manage, edit & delete your shared designs"
              icon="people-outline"
              isLast
              onPress={() => router.push("/community/profile" as any)}
            />
          </View>
        </View>

        {/* Group 2: Account Settings & Support */}
        <View className="mt-5">
          <Text className="mb-2.5 px-1 text-[14px] font-bold text-primary">
            Account Settings & Support
          </Text>
          <View className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-xs">
            <ProfileMenuRow
              title="Edit Profile Information"
              subtitle="Name, contact & default delivery address"
              icon="person-outline"
              onPress={openEditModal}
            />
            <ProfileMenuRow
              title="Check for Updates"
              subtitle={
                isCheckingUpdate
                  ? "Checking for new version..."
                  : `Version v${Constants.expoConfig?.version || "1.0.4"} (Tap to check)`
              }
              icon="cloud-download-outline"
              onPress={() => checkForUpdate(true)}
            />
            <ProfileMenuRow
              title="Help & Customer Care"
              subtitle="suidhagaofficial.pakistan@gmail.com"
              icon="help-circle-outline"
              isLast
              onPress={() => {
                Alert.alert(
                  "Sui Dhaga Support",
                  "Need help with an order, appointment or measurement?\n\nEmail: suidhagaofficial.pakistan@gmail.com",
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
              Sign out of this account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#DC2626" />
        </TouchableOpacity>

        <Text className="mt-5 text-center text-[11px] font-medium text-brand-gray/60">
          Sui Dhaga • v{Constants.expoConfig?.version || "1.0.4"}
        </Text>
      </View>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsEditModalVisible(false)}>
          <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                className="rounded-t-[32px] bg-white px-5 pt-3 pb-8 shadow-2xl"
                style={{
                  paddingBottom: Math.max(insets.bottom + 16, 28),
                  maxHeight: "85%",
                }}
              >
                {/* Drag Handle */}
                <View className="h-1.5 w-12 rounded-full bg-slate-200 self-center mb-3 mt-1" />

                {/* Header */}
                <View className="flex-row items-center justify-between pb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E0F7F7] mr-3">
                      <Ionicons name="person" size={20} color="#14919B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[17px] font-bold text-brand-dark">
                        Edit Profile
                      </Text>
                      <Text className="text-[12px] font-medium text-brand-gray">
                        Update your personal information
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsEditModalVisible(false)}
                    className="h-8 w-8 items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200"
                  >
                    <Ionicons name="close" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Hairline Divider */}
                <View className="h-[1px] bg-slate-100 mb-2" />

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

