import React from "react";
import { ActivityIndicator, View } from "react-native";

import { SearchAndFilters } from "../components/SearchAndFilters";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorListCard } from "../components/TailorListCard";
import { TailorScreenShell } from "../components/TailorScreenShell";
import { useTailors } from "../hooks/useTailors";

export default function TailorsScreen() {
  const { tailors, isLoading } = useTailors();

  const getTone = (index: number) => {
    const tones: ("coral" | "blue" | "gold" | "teal")[] = ["coral", "blue", "gold", "teal"];
    return tones[index % tones.length];
  };

  return (
    <TailorScreenShell bottomTabs={<TailorBottomTabs />}>
      <TailorHeader
        title="Tailors"
        subtitle="Find the perfect tailor for your style"
      />
      <View className="px-5 pb-6">
        <SearchAndFilters />

        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        ) : (
          <View className="mt-5">
            {tailors.map((tailor, index) => (
              <TailorListCard
                key={tailor.id || index}
                image={tailor.image || tailor.imageUrl}
                name={tailor.name || tailor.businessName || "Tailor"}
                rating={`${tailor.rating || 4.8} (${tailor.reviews || tailor.reviewsCount || 0})`}
                distance={tailor.distance || "2.1 km"}
                specialty={tailor.specialty || tailor.specialties?.join(', ') || "Bespoke Tailoring"}
                topRated={tailor.topRated || tailor.isTopRated}
                tone={getTone(index)}
              />
            ))}
          </View>
        )}
      </View>
    </TailorScreenShell>
  );
}
