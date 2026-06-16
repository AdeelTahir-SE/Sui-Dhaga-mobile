import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { InfoRow } from "../components/InfoRow";
import { MccButton } from "../components/MccButton";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { MccTabsPreview } from "../components/MccTabsPreview";
import { MeasurementDiagram } from "../components/MeasurementDiagram";
import { SectionTitle } from "../components/SectionTitle";

export default function MeasurementsScreen() {
  return (
    <MccScreenShell bottomTabs={<MccTabsPreview active="Profile" />}>
      <MccHeader title="Measurements" rightIcon="notifications-outline" />
      <View className="px-5">
        <MeasurementDiagram />

        <SectionTitle title="My Measurements" action="View All" />
        <View className="rounded-xl border border-brand-border px-4 py-2">
          {[
            ["Bust", "34 in"],
            ["Waist", "28 in"],
            ["Hips", "36 in"],
            ["Shoulder", "14.5 in"],
            ["Arm Length", "22 in"],
            ["Top Length", "15 in"],
          ].map(([label, value]) => (
            <InfoRow key={label} icon="radio-button-on" label={label} value={value} />
          ))}
        </View>

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
