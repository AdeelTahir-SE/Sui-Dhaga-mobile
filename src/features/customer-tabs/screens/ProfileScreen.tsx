import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { ProfileMenuRow } from "../components/ProfileMenuRow";
import { TabPlaceholder } from "../components/TabPlaceholder";
import { useAuthStore } from "../../../stores/auth.store";
import { storage } from "../../../api/client";
import { extractAvatarUrl, usersApi } from "../../../api/users.api";
import { User } from "../../../types/api";

const profileAyesha = require("@/assets/illustrations/customer-tabs/profile/ayesha.png");
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
            ? { ...user, avatar: newAvatarUrl, avatarUrl: newAvatarUrl }
            : {
                id: "guest",
                email: "guest@suidhaga.app",
                name: "Guest User",
                fullName: "Guest User",
                role: "customer" as const,
                avatar: newAvatarUrl,
                avatarUrl: newAvatarUrl,
              };

          setUser(updatedUser);
          await storage.setUser(updatedUser).catch(() => {});
          Alert.alert("Success", "Profile avatar updated successfully!");
        } catch (uploadErr: any) {
          Alert.alert(
            "Upload Failed",
            uploadErr?.message || "Failed to upload avatar image. Please try again."
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
          >
            <TabPlaceholder
              image={user?.avatar || user?.avatarUrl || profileAyesha}
              variant="person"
              size="md"
              tone="coral"
            />
            {isUploading ? (
              <View className="absolute inset-0 items-center justify-center rounded-md bg-black/40">
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <View className="absolute bottom-1 right-1 h-7 w-7 items-center justify-center rounded-md bg-primary border-2 border-white shadow-sm">
                <Ionicons name="camera-outline" size={15} color="#FFFFFF" />
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
