import React, { useState, useCallback } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { ProfileMenuRow } from "../components/ProfileMenuRow";
import { useAuthStore } from "../../../stores/auth.store";
import { storage } from "../../../api/client";
import { extractAvatarUrl, usersApi } from "../../../api/users.api";
import { User } from "../../../types/api";

const profileMeasurements = require("@/assets/illustrations/customer-tabs/profile/measurements.png");
const profileSavedDesigns = require("@/assets/illustrations/customer-tabs/profile/saved-designs.png");
const profilePaymentMethods = require("@/assets/illustrations/customer-tabs/profile/payment-methods.png");
const profileAddresses = require("@/assets/illustrations/customer-tabs/profile/addresses.png");
const profileSettings = require("@/assets/illustrations/customer-tabs/profile/settings.png");

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const [isUploading, setIsUploading] = useState(false);

  // Auto-refresh profile data when screen gains focus
  useFocusEffect(
    useCallback(() => {
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
    }, [user, setUser])
  );

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
      "Logout",
      "Are you sure you want to log out of Sui Dhaga?",
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

  const emailPrefix = user?.email ? user.email.split("@")[0] : "User";
  const displayName =
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    emailPrefix;
  const displayEmail = user?.email || "No email provided";
  const displayPhone = user?.phone || "+91 (Not set)";
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
    return name.slice(0, 2).toUpperCase() || "U";
  };
  const initials = getInitials(displayName);

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Profile" />}>
      <View className="px-5 pt-5 pb-8">
        <View className="items-end">
          <Ionicons name="settings-outline" size={20} color="#1A1D1F" />
        </View>
        <View className="items-center">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={pickImage}
            disabled={isUploading}
            className="relative"
            accessibilityLabel="Change profile picture"
            accessibilityRole="button"
          >
            <View className="h-28 w-28 rounded-full border-2 border-primary/25 bg-primary-50 overflow-hidden items-center justify-center shadow-md">
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View className="items-center justify-center w-full h-full bg-primary-50">
                  <Text className="text-[32px] font-black text-primary">
                    {initials}
                  </Text>
                </View>
              )}
            </View>

            {isUploading ? (
              <View className="absolute inset-0 items-center justify-center rounded-full bg-black/40">
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary border-2 border-white shadow-md">
                <Ionicons name="camera" size={15} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <View className="mt-4 flex-row items-center">
            <Text className="text-[20px] font-black text-brand-dark tracking-tight">
              {displayName}
            </Text>
            <Ionicons
              name="pencil-outline"
              size={15}
              color="#1A1D1F"
              style={{ marginLeft: 6 }}
            />
          </View>
          <Text className="mt-1.5 text-[13px] font-medium text-brand-gray">
            {displayEmail}
          </Text>
          <Text className="mt-0.5 text-[13px] font-medium text-brand-gray">
            {displayPhone}
          </Text>
        </View>

        <View className="mt-7">
          <ProfileMenuRow
            title="My Measurements"
            subtitle="View & manage your measurements"
            icon="body-outline"
            image={profileMeasurements}
            highlighted
          />
          <ProfileMenuRow
            title="Saved Designs"
            subtitle="View your saved outfits"
            icon="bookmark-outline"
            image={profileSavedDesigns}
          />
          <ProfileMenuRow
            title="Payment Methods"
            subtitle="Manage payment options"
            icon="card-outline"
            image={profilePaymentMethods}
          />
          <ProfileMenuRow
            title="Addresses"
            subtitle="Manage delivery locations"
            icon="location-outline"
            image={profileAddresses}
          />
          <ProfileMenuRow
            title="Settings"
            subtitle="Notifications, Privacy & more"
            icon="settings-outline"
            image={profileSettings}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="mt-6 h-[52px] items-center justify-center rounded-md border border-[#F5D1D1] bg-[#FFF3F3]"
        >
          <Text className="text-[14px] font-bold text-[#D73232] tracking-wide">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </CustomerTabShell>
  );
}
