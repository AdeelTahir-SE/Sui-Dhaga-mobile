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

import { InfoRow } from "../components/InfoRow";
import { MccButton } from "../components/MccButton";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { MccTabsPreview } from "../components/MccTabsPreview";
import { MeasurementDiagram } from "../components/MeasurementDiagram";
import { SectionTitle } from "../components/SectionTitle";
import { useMeasurements } from "../hooks/useMeasurements";

const RTW_SIZES = [
  { size: "XS (32)", bust: 32, waist: 26, hips: 36, shoulder: 13.5, length: 38 },
  { size: "S (34)", bust: 34, waist: 28, hips: 38, shoulder: 14, length: 39 },
  { size: "M (36)", bust: 36, waist: 30, hips: 40, shoulder: 14.5, length: 40 },
  { size: "L (38)", bust: 38, waist: 32, hips: 42, shoulder: 15, length: 41 },
  { size: "XL (40)", bust: 40, waist: 35, hips: 44, shoulder: 15.5, length: 41.5 },
  { size: "XXL (42)", bust: 42, waist: 38, hips: 47, shoulder: 16, length: 42 },
];

export default function MeasurementsScreen() {
  const { measurements, activeProfile, setActiveProfile, isLoading } = useMeasurements();
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const unit = activeProfile?.unit === "cm" ? "cm" : "in";

  // Build rows dynamically from real profile values
  const rows: Array<[string, string]> = [];
  if (activeProfile?.chest) rows.push(["Bust / Chest", `${activeProfile.chest} ${unit}`]);
  if (activeProfile?.waist) rows.push(["Waist", `${activeProfile.waist} ${unit}`]);
  if (activeProfile?.hips) rows.push(["Hips", `${activeProfile.hips} ${unit}`]);
  if (activeProfile?.shoulder) rows.push(["Shoulder (Teera)", `${activeProfile.shoulder} ${unit}`]);
  if (activeProfile?.sleeveLength) rows.push(["Arm / Sleeve Length", `${activeProfile.sleeveLength} ${unit}`]);
  if (activeProfile?.shirtLength) rows.push(["Top / Kurti Length", `${activeProfile.shirtLength} ${unit}`]);
  if (activeProfile?.trouserLength) rows.push(["Trouser / Bottom Length", `${activeProfile.trouserLength} ${unit}`]);
  if (activeProfile?.inseam) rows.push(["Inseam", `${activeProfile.inseam} ${unit}`]);
  if (activeProfile?.neck) rows.push(["Collar / Neck", `${activeProfile.neck} ${unit}`]);

  // Fallback if empty profile
  if (rows.length === 0) {
    rows.push(["Bust / Chest", `36 ${unit}`]);
    rows.push(["Waist", `30 ${unit}`]);
    rows.push(["Hips", `40 ${unit}`]);
    rows.push(["Shoulder", `14.5 ${unit}`]);
    rows.push(["Arm Length", `21 ${unit}`]);
    rows.push(["Top Length", `40 ${unit}`]);
  }

  const handleShareCard = async () => {
    if (!activeProfile) return;
    let message = `🧵 Sui Dhaga Measurement Card\n`;
    message += `Profile: ${activeProfile.profileName}\n`;
    message += `Unit: ${activeProfile.unit || "inches"}\n`;
    message += `------------------------\n`;
    rows.forEach(([label, val]) => {
      message += `• ${label}: ${val}\n`;
    });
    if (activeProfile.notes) {
      message += `\nTailor Notes: ${activeProfile.notes}\n`;
    }
    message += `\nMeasured via Sui Dhaga Tailoring`;

    try {
      await Share.share({ message });
    } catch {
      Alert.alert("Share", "Unable to open share sheet.");
    }
  };

  return (
    <MccScreenShell bottomTabs={<MccTabsPreview active="Profile" />}>
      <MccHeader title="Measurements" rightIcon="notifications-outline" />
      <View className="px-5 pb-8">
        <MeasurementDiagram />

        {/* Profiles Selector Pills */}
        <View className="mt-4 mb-2">
          <Text className="text-[12px] font-bold tracking-wider text-brand-gray uppercase mb-2">
            Saved Fit Profiles
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {measurements.map((profile) => {
              const isSelected = activeProfile?.id === profile.id;
              return (
                <TouchableOpacity
                  key={profile.id}
                  onPress={() => setActiveProfile(profile)}
                  className={`mr-2 flex-row items-center rounded-full px-3.5 py-2 border ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-white border-brand-border"
                  }`}
                >
                  <Ionicons
                    name="person-outline"
                    size={13}
                    color={isSelected ? "#FFFFFF" : "#6B7280"}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    className={`text-[12px] font-semibold ${
                      isSelected ? "text-white" : "text-brand-dark"
                    }`}
                  >
                    {profile.profileName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="mt-2">
          <SectionTitle
            title={activeProfile?.profileName || "My Measurements"}
            action="Details"
            onActionPress={() => {
              if (activeProfile?.id) {
                router.push(`/measurements/${activeProfile.id}` as any);
              }
            }}
          />
        </View>

        {isLoading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : (
          <View className="rounded-2xl border border-brand-border bg-white px-4 py-3 shadow-xs">
            {rows.map(([label, value]) => (
              <InfoRow key={label} icon="radio-button-on" label={label} value={value} />
            ))}

            {activeProfile?.notes ? (
              <View className="mt-3 pt-3 border-t border-brand-border/60">
                <Text className="text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1">
                  Tailor Notes
                </Text>
                <Text className="text-[12px] text-brand-gray leading-4 italic">
                  &ldquo;{activeProfile.notes}&rdquo;
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Action Buttons Row */}
        <View className="mt-4 flex-row gap-2.5">
          <TouchableOpacity
            onPress={() => setShowSizeGuide(true)}
            className="h-[46px] flex-1 items-center justify-center rounded-xl border border-primary bg-white"
          >
            <Text className="text-[13px] font-semibold text-primary">
              📏 Size Guide
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShareCard}
            className="h-[46px] flex-1 items-center justify-center rounded-xl border border-brand-border bg-[#F8FAFC]"
          >
            <Text className="text-[13px] font-semibold text-brand-dark">
              📲 Share Card
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-2.5">
          <MccButton
            title="+ Add New Profile"
            onPress={() => router.push("/measurements/new" as never)}
          />
        </View>
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
