import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { MccScreenShell } from "../components/MccScreenShell";
import { MeasurementCard } from "../components/MeasurementCard";
import { useMeasurements } from "../hooks/useMeasurements";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";
import { MeasurementItem } from "../../../types/api";

const RTW_SIZES = [
  { size: "XS (32)", bust: 32, waist: 26, hips: 36, shoulder: 13.5, length: 38 },
  { size: "S (34)", bust: 34, waist: 28, hips: 38, shoulder: 14, length: 39 },
  { size: "M (36)", bust: 36, waist: 30, hips: 40, shoulder: 14.5, length: 40 },
  { size: "L (38)", bust: 38, waist: 32, hips: 42, shoulder: 15, length: 41 },
  { size: "XL (40)", bust: 40, waist: 35, hips: 44, shoulder: 15.5, length: 41.5 },
  { size: "XXL (42)", bust: 42, waist: 38, hips: 47, shoulder: 16, length: 42 },
];

export default function MeasurementsScreen() {
  const { measurements, deleteMeasurement, isLoading } = useMeasurements();
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleShareProfile = async (profile: MeasurementItem) => {
    const unit = profile.unit === "cm" ? "cm" : "in";
    let message = `🧵 Sui Dhaga Measurement Card\n`;
    message += `Profile: ${profile.profileName}\n`;
    message += `Unit: ${profile.unit || "inches"}\n`;
    message += `------------------------\n`;
    if (profile.chest) message += `• Chest / Bust: ${profile.chest} ${unit}\n`;
    if (profile.waist) message += `• Waist: ${profile.waist} ${unit}\n`;
    if (profile.hips) message += `• Hips: ${profile.hips} ${unit}\n`;
    if (profile.shoulder) message += `• Shoulder Width: ${profile.shoulder} ${unit}\n`;
    if (profile.sleeveLength) message += `• Arm / Sleeve: ${profile.sleeveLength} ${unit}\n`;
    if (profile.shirtLength) message += `• Top / Shirt Length: ${profile.shirtLength} ${unit}\n`;
    if (profile.trouserLength) message += `• Trouser Length: ${profile.trouserLength} ${unit}\n`;
    if (profile.inseam) message += `• Inseam: ${profile.inseam} ${unit}\n`;
    if (profile.neck) message += `• Collar / Neck: ${profile.neck} ${unit}\n`;
    if (profile.notes) {
      message += `\nTailor Notes: ${profile.notes}\n`;
    }
    message += `\nMeasured via Sui Dhaga Tailoring`;

    try {
      await Share.share({ message });
    } catch {
      Alert.alert("Share", "Unable to open share sheet.");
    }
  };

  const handleEditProfile = (profile: MeasurementItem) => {
    router.push({
      pathname: "/measurements/new",
      params: { editId: profile.id },
    } as any);
  };

  const handleDeleteProfile = (profile: MeasurementItem) => {
    const name = profile.profileName || "this person";
    Alert.alert(
      "Delete Measurement",
      `Are you sure you want to delete measurements for ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMeasurement(profile.id),
        },
      ]
    );
  };

  return (
    <MccScreenShell>
      {/* Top Bar with Back button on left, centered title and centered subtitle */}
      <View className="px-4 pt-2 pb-3 bg-white border-b border-brand-border/40">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#F8FAFC] border border-brand-border/60"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
          </TouchableOpacity>

          <View className="flex-1 items-center px-2">
            <Text className="text-[20px] font-black text-brand-dark tracking-tight text-center">
              Measurements
            </Text>
            <Text
              className="mt-0.5 text-[12px] font-medium text-brand-gray text-center"
              numberOfLines={1}
            >
              Manage bespoke body dimensions & tailoring profiles
            </Text>
          </View>

          {/* Symmetrical right placeholder to keep text perfectly centered */}
          <View className="h-10 w-10" />
        </View>
      </View>

      <View className={`px-5 pt-3 pb-8 ${measurements.length === 0 ? "flex-1 justify-center" : ""}`}>
        {isLoading ? (
          <View className="py-14 items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#00949D" />
          </View>
        ) : measurements.length === 0 ? (
          <View className="py-6 items-center justify-center flex-1">
            <View className="w-20 h-20 rounded-full bg-[#00949D]/10 items-center justify-center mb-4">
              <Ionicons name="body-outline" size={38} color="#00949D" />
            </View>
            <Text className="text-[20px] font-black text-brand-dark mb-2 text-center tracking-tight">
              No Measurements Saved Yet
            </Text>
            <Text className="text-[13px] text-brand-gray text-center px-4 mb-6 leading-5">
              You haven&apos;t saved measurements for anyone yet. Create a measurement profile to set a person&apos;s name and universal body details for any dress or garment.
            </Text>

            {/* Create Measurement button with wide px and greenish texture */}
            <TouchableOpacity
              onPress={() => router.push("/measurements/new" as never)}
              activeOpacity={0.85}
              className="relative h-[52px] w-full max-w-[280px] items-center justify-center rounded-xl overflow-hidden shadow-sm"
            >
              <ButtonTexture variant="greenish" borderRadius={12} />
              <View className="z-10 flex-row items-center justify-center px-6">
                <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text
                  className="text-[15px] font-bold text-white"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.22)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Create Measurement
                </Text>
              </View>
            </TouchableOpacity>

            {/* Improved Standard Size Guide Card Button */}
            <TouchableOpacity
              onPress={() => setShowSizeGuide(true)}
              activeOpacity={0.75}
              className="mt-4 flex-row items-center justify-center rounded-xl border border-[#00949D]/30 bg-[#00949D]/8 px-5 py-3 w-full max-w-[280px]"
            >
              <Ionicons name="book-outline" size={17} color="#00949D" style={{ marginRight: 8 }} />
              <Text className="text-[13px] font-bold text-[#00949D]">
                View Standard Sizing Guide
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Action Buttons above saved profiles */}
            <View className="mb-4 flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => router.push("/measurements/new" as never)}
                activeOpacity={0.8}
                className="flex-1 flex-row items-center justify-center rounded-xl border border-[#00949D] bg-[#00949D]/6 py-3 px-2 shadow-2xs"
              >
                <Ionicons name="add" size={18} color="#00949D" style={{ marginRight: 5 }} />
                <Text className="text-[13px] font-bold text-[#00949D]">
                  Create Another Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowSizeGuide(true)}
                activeOpacity={0.8}
                className="flex-1 flex-row items-center justify-center rounded-xl border border-brand-border bg-[#F8FAFC] py-3 px-2"
              >
                <Ionicons name="book-outline" size={16} color="#475569" style={{ marginRight: 6 }} />
                <Text className="text-[13px] font-semibold text-[#475569]">
                  Standard Size Guide
                </Text>
              </TouchableOpacity>
            </View>

            {/* Saved Profiles Section Title */}
            <View className="mb-3">
              <Text className="text-[14px] font-bold text-brand-dark">
                Saved Profiles ({measurements.length})
              </Text>
            </View>

            {/* List of measurement cards mimicking MainTailorCard & MainOrderCard */}
            {measurements.map((profile, idx) => (
              <MeasurementCard
                key={profile.id}
                profile={profile}
                index={idx}
                onEdit={handleEditProfile}
                onDelete={handleDeleteProfile}
                onShare={handleShareProfile}
                onPress={(p) => {
                  router.push(`/measurements/${p.id}` as any);
                }}
              />
            ))}
          </>
        )}
      </View>

      {/* Size Guide Modal */}
      <Modal visible={showSizeGuide} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-white p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between pb-3 border-b border-brand-border">
              <Text className="text-[17px] font-bold text-brand-dark">Standard Size Guide (Inches)</Text>
              <TouchableOpacity onPress={() => setShowSizeGuide(false)} className="p-1">
                <Ionicons name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>

            <ScrollView className="mt-4">
              <View className="rounded-xl border border-brand-border overflow-hidden mb-4">
                <View className="flex-row bg-[#F8FAFC] py-2 px-3 border-b border-brand-border">
                  <Text className="flex-1 font-bold text-[11px] text-brand-dark">Size</Text>
                  <Text className="flex-1 font-bold text-[11px] text-brand-dark text-center">Bust</Text>
                  <Text className="flex-1 font-bold text-[11px] text-brand-dark text-center">Waist</Text>
                  <Text className="flex-1 font-bold text-[11px] text-brand-dark text-center">Hips</Text>
                  <Text className="flex-1 font-bold text-[11px] text-brand-dark text-right">Shoulder</Text>
                </View>
                {RTW_SIZES.map((item, idx) => (
                  <View
                    key={item.size}
                    className={`flex-row py-2.5 px-3 border-b border-brand-border/40 ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#FAF8F5]"
                    }`}
                  >
                    <Text className="flex-1 font-semibold text-[12px] text-brand-dark">{item.size}</Text>
                    <Text className="flex-1 text-[12px] text-brand-gray text-center">{item.bust}&quot;</Text>
                    <Text className="flex-1 text-[12px] text-brand-gray text-center">{item.waist}&quot;</Text>
                    <Text className="flex-1 text-[12px] text-brand-gray text-center">{item.hips}&quot;</Text>
                    <Text className="flex-1 text-[12px] text-brand-gray text-right">{item.shoulder}&quot;</Text>
                  </View>
                ))}
              </View>

              <View className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-3 mb-4">
                <Text className="text-[12px] font-bold text-[#92400E] mb-1">
                  💡 Tailor Tip:
                </Text>
                <Text className="text-[11px] leading-4 text-[#92400E]">
                  Bespoke stitching tailors add 1.5 to 2.5 inches ease on top of net body measurements for comfort everyday wear.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowSizeGuide(false)}
              className="h-[48px] items-center justify-center rounded-xl bg-primary mt-2"
            >
              <Text className="text-[14px] font-bold text-white">Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </MccScreenShell>
  );
}
