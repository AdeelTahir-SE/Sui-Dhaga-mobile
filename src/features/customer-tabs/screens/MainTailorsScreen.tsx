import React from "react";
import { ActivityIndicator, RefreshControl, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MainTailorCard } from "../components/MainTailorCard";
import { useTailors } from "../../tailors/hooks/useTailors";

export default function MainTailorsScreen() {
  const { tailors, isLoading, isRefreshing, refresh } = useTailors();

  const getTone = (index: number) => {
    const tones: ("coral" | "blue" | "gold" | "teal")[] = ["coral", "blue", "gold", "teal"];
    return tones[index % tones.length];
  };

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Tailors" />}>
      <CustomerHeader title="Find Tailors" subtitle="Jaipur, Rajasthan" />
      <View className="px-5 pb-6">
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

        {isLoading && !isRefreshing ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
            <Text className="mt-2 text-[12px] text-brand-gray">Loading tailors...</Text>
          </View>
        ) : (
          tailors.map((tailor, index) => (
            <MainTailorCard
              key={tailor.id || index}
              name={tailor.name || tailor.businessName || "Tailor"}
              rating={`${tailor.rating || 4.8} (${tailor.reviews || tailor.reviewsCount || 0})`}
              distance={tailor.distance || "2.0 km"}
              specialty={tailor.specialty || tailor.specialties?.join(', ') || "Bespoke Stitching"}
              image={tailor.image || tailor.imageUrl}
              topRated={tailor.topRated || tailor.isTopRated}
              tone={getTone(index)}
            />
          ))
        )}
      </View>
    </CustomerTabShell>
  );
}
