import React from "react";
import { Alert, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { InfoRow } from "../components/InfoRow";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { useMeasurements } from "../hooks/useMeasurements";

export default function MeasurementDetailsScreen() {
  const { measurementId } = useLocalSearchParams<{ measurementId?: string }>();
  const { measurements, deleteMeasurement } = useMeasurements();

  // Find the profile matching measurementId or fallback to first if no ID specified
  const profile = measurements.find((m) => m.id === measurementId) || (measurementId ? undefined : measurements[0]);

  if (!profile) {
    return (
      <MccScreenShell>
        <MccHeader title="Fit Profile Details" showBack rightText="" />
        <View className="flex-1 items-center justify-center py-8 px-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Ionicons name="body-outline" size={32} color="#14919B" />
          </View>
          <Text className="text-[18px] font-bold text-brand-dark text-center">
            Measurement Profile Not Found
          </Text>
          <Text className="mt-2 text-center text-[13px] font-medium text-brand-gray max-w-[280px]">
            No measurement profile found. Create your custom fit profile to get started with precision tailoring.
          </Text>
          <View className="mt-6 w-full max-w-[260px] gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/measurements/new" as any)}
              className="h-[48px] rounded-xl bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
            >
              <Text className="text-[13px] font-bold text-white">
                Create Measurement Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/measurements" as any)}
              className="h-[48px] rounded-xl border border-brand-border bg-white items-center justify-center"
            >
              <Text className="text-[13px] font-bold text-brand-dark">
                Back to Measurements
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </MccScreenShell>
    );
  }

  const unit = profile.unit === "cm" ? "cm" : "in";

  const rows: Array<[string, string]> = [];
  if (profile?.chest) rows.push(["Bust / Chest", `${profile.chest} ${unit}`]);
  if (profile?.waist) rows.push(["Waist", `${profile.waist} ${unit}`]);
  if (profile?.hips) rows.push(["Hips", `${profile.hips} ${unit}`]);
  if (profile?.shoulder) rows.push(["Shoulder Width", `${profile.shoulder} ${unit}`]);
  if (profile?.sleeveLength) rows.push(["Arm / Sleeve Length", `${profile.sleeveLength} ${unit}`]);
  if (profile?.shirtLength) rows.push(["Top / Shirt Length", `${profile.shirtLength} ${unit}`]);
  if (profile?.trouserLength) rows.push(["Trouser / Bottom Length", `${profile.trouserLength} ${unit}`]);
  if (profile?.inseam) rows.push(["Inseam (Inner Leg)", `${profile.inseam} ${unit}`]);
  if (profile?.neck) rows.push(["Collar / Neck", `${profile.neck} ${unit}`]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Measurement Profile",
      `Are you sure you want to delete "${profile?.profileName || "this profile"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (profile?.id) {
              await deleteMeasurement(profile.id);
            }
            router.back();
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!profile) return;
    let message = `🧵 Sui Dhaga Measurement Card\n`;
    message += `Profile: ${profile.profileName}\n`;
    message += `Unit: ${unit === "cm" ? "cm" : "inches"}\n`;
    message += `------------------------\n`;
    rows.forEach(([label, val]) => {
      message += `• ${label}: ${val}\n`;
    });
    if (profile.notes) {
      message += `\nTailor Notes: ${profile.notes}\n`;
    }
    message += `\nMeasured via Sui Dhaga`;

    try {
      await Share.share({ message });
    } catch {
      Alert.alert("Share", "Unable to open share sheet.");
    }
  };

  const formattedDate = profile?.updatedAt
    ? new Date(profile.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  return (
    <MccScreenShell>
      <MccHeader title="Fit Profile Details" showBack rightText="" />
      <ScrollView className="px-5 pb-12" showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View className="rounded-2xl border border-brand-border bg-white p-4 shadow-xs mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[16px] font-black text-brand-dark">
                {profile?.profileName || "Custom Profile"}
              </Text>
              <Text className="text-[11px] text-brand-gray mt-0.5">
                Last updated: {formattedDate} • Unit: {unit === "cm" ? "Centimeters" : "Inches"}
              </Text>
            </View>
            <View className="rounded-full bg-primary/10 px-3 py-1">
              <Text className="text-[11px] font-bold text-primary uppercase">
                {unit.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Measurements List */}
        <Text className="mb-2 text-[12px] font-bold text-brand-dark uppercase tracking-wider">
          Recorded Dimensions
        </Text>
        <View className="rounded-2xl border border-brand-border bg-white px-4 py-2 shadow-xs mb-4">
          {rows.map(([label, value]) => (
            <InfoRow key={label} icon="radio-button-on" label={label} value={value} />
          ))}
        </View>

        {/* Tailor Instructions */}
        <View className="rounded-2xl border border-brand-border bg-white p-4 shadow-xs mb-6">
          <Text className="text-[12px] font-bold text-brand-dark uppercase tracking-wider mb-2">
            📝 Tailor Instructions & Notes
          </Text>
          <Text className="text-[13px] text-brand-dark leading-5">
            {profile?.notes || "No special instructions provided."}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-3">
          <TouchableOpacity
            onPress={handleShare}
            className="h-[48px] flex-1 flex-row items-center justify-center rounded-xl border border-brand-border bg-white"
          >
            <Ionicons name="share-social-outline" size={16} color="#111" style={{ marginRight: 6 }} />
            <Text className="text-[13px] font-semibold text-brand-dark">Share with Tailor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/measurements/new" as any)}
            className="h-[48px] flex-1 flex-row items-center justify-center rounded-xl bg-primary"
          >
            <Ionicons name="create-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text className="text-[13px] font-semibold text-white">New Profile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleDelete}
          className="h-[46px] items-center justify-center rounded-xl border border-[#F5D1D1] bg-[#FFF3F3]"
        >
          <Text className="text-[13px] font-semibold text-[#D73232]">Delete Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </MccScreenShell>
  );
}
