import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { ProfileMenuRow } from "../components/ProfileMenuRow";
import { TabPlaceholder } from "../components/TabPlaceholder";
import { useAuthStore } from "../../../stores/auth.store";

const profileAyesha = require("@/assets/illustrations/customer-tabs/profile/ayesha.png");
const profileMeasurements = require("@/assets/illustrations/customer-tabs/profile/measurements.png");
const profileSavedDesigns = require("@/assets/illustrations/customer-tabs/profile/saved-designs.png");
const profilePaymentMethods = require("@/assets/illustrations/customer-tabs/profile/payment-methods.png");
const profileAddresses = require("@/assets/illustrations/customer-tabs/profile/addresses.png");
const profileSettings = require("@/assets/illustrations/customer-tabs/profile/settings.png");

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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

  const displayName = user?.fullName || user?.name || "Guest User";
  const displayEmail = user?.email || "No email provided";
  const displayPhone = user?.phone || "+91 (Not set)";

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Profile" />}>
      <View className="px-5 pt-5 pb-8">
        <View className="items-end">
          <Ionicons name="settings-outline" size={20} color="#1A1D1F" />
        </View>
        <View className="items-center">
          <TabPlaceholder
            image={user?.avatar || user?.avatarUrl || profileAyesha}
            variant="person"
            size="md"
            tone="coral"
          />
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
