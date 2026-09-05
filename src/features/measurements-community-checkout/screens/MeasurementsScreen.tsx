import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { InfoRow } from "../components/InfoRow";
import { MccButton } from "../components/MccButton";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { MccTabsPreview } from "../components/MccTabsPreview";
import { MeasurementDiagram } from "../components/MeasurementDiagram";
import { SectionTitle } from "../components/SectionTitle";
import { useMeasurements } from "../hooks/useMeasurements";

export default function MeasurementsScreen() {
  const { activeProfile, isLoading } = useMeasurements();

  const unit = activeProfile?.unit || "in";

  const rows = [
    ["Bust", activeProfile?.chest ? `${activeProfile.chest} ${unit}` : "34 in"],
    ["Waist", activeProfile?.waist ? `${activeProfile.waist} ${unit}` : "28 in"],
    ["Hips", activeProfile?.hips ? `${activeProfile.hips} ${unit}` : "36 in"],
    ["Shoulder", activeProfile?.shoulder ? `${activeProfile.shoulder} ${unit}` : "14.5 in"],
    ["Arm Length", activeProfile?.sleeveLength ? `${activeProfile.sleeveLength} ${unit}` : "22 in"],
    ["Top Length", activeProfile?.shirtLength ? `${activeProfile.shirtLength} ${unit}` : "15 in"],
  ];

  return (
    <MccScreenShell bottomTabs={<MccTabsPreview active="Profile" />}>
      <MccHeader title="Measurements" rightIcon="notifications-outline" />
      <View className="px-5 pb-8">
        <MeasurementDiagram />

        <SectionTitle title={activeProfile?.profileName || "My Measurements"} action="View All" />

        {isLoading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : (
          <View className="rounded-xl border border-brand-border px-4 py-2">
            {rows.map(([label, value]) => (
              <InfoRow key={label} icon="radio-button-on" label={label} value={value} />
            ))}
          </View>
        )}

        <View className="mt-5 flex-row gap-3">
          <TouchableOpacity className="h-[48px] flex-1 items-center justify-center rounded-xl border border-primary bg-white">
            <Text className="text-[13px] font-semibold text-primary">
              Size Guide
            </Text>
          </TouchableOpacity>
          <View className="flex-1">
            <MccButton
              title="+ Add New"
              onPress={() => router.push("/measurements/new" as never)}
            />
          </View>
        </View>

      </View>
    </MccScreenShell>
  );
}
