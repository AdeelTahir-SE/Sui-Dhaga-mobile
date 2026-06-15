import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MainTailorCard } from "../components/MainTailorCard";

export default function MainTailorsScreen() {
  return (
    <CustomerTabShell>
      <CustomerHeader title="Find Tailors" subtitle="Jaipur, Rajasthan" />
      <View className="px-5">
        <View className="h-[48px] flex-row items-center rounded-xl border border-brand-border px-4">
          <Ionicons name="search" size={17} color="#6F767E" />
          <Text className="ml-3 flex-1 text-[12px] text-brand-gray">
            Search by name, specialty or location
          </Text>
          <Ionicons name="options-outline" size={18} color="#1A1D1F" />
        </View>
        <View className="my-4 flex-row gap-2">
          {["Filters", "Near Me", "Rating 4+", "Verified"].map((filter) => (
            <View key={filter} className="rounded-lg border border-brand-border px-3 py-2">
              <Text className="text-[11px] font-medium text-brand-dark">{filter}</Text>
            </View>
          ))}
        </View>
        <MainTailorCard name="Rekha Tailors" rating="4.8 (128)" distance="2.1 km" specialty="Specializes in Bridal, Suits" topRated tone="coral" />
        <MainTailorCard name="Stitch Craft" rating="4.7 (96)" distance="3.4 km" specialty="Specializes in Men's Wear" tone="blue" />
        <MainTailorCard name="Aarav Bespoke" rating="4.6 (72)" distance="4.2 km" specialty="Specializes in Indo-Western" tone="gold" />
        <MainTailorCard name="Noor & Thread" rating="4.5 (64)" distance="5.1 km" specialty="Specializes in Sarees" tone="teal" />
        <CustomerTabsPreview active="Tailors" />
      </View>
    </CustomerTabShell>
  );
}
