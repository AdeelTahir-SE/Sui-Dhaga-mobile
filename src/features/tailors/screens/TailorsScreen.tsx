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
            <ActivityIndicator size="small" color="#14919B" />
          </View>
        ) : (
          <View className="mt-5">
            {tailors.map((tailor, index) => (
              <TailorListCard
                key={tailor.id || index}
                id={tailor.id}
                image={
                  tailor.avatarUrl ||
                  tailor.avatar ||
                  (tailor as any).profile?.avatar_url ||
                  (tailor as any).user?.avatar_url ||
                  tailor.imageUrl ||
                  tailor.image
                }
                name={tailor.shopName || tailor.businessName || tailor.name || "Tailor Studio"}
                rating={
                  tailor.rating
                    ? `${Number(tailor.rating).toFixed(1)} (${tailor.reviewsCount ?? tailor.reviews ?? 0})`
                    : "New"
                }
                distance={
                  tailor.city ||
                  (typeof tailor.location === "object" ? tailor.location?.city : null) ||
                  tailor.address ||
                  tailor.distance ||
                  "Nearby"
                }
                specialty={
                  Array.isArray(tailor.specialties) && tailor.specialties.length > 0
                    ? tailor.specialties.join(", ")
                    : tailor.specialty || "Custom Tailoring"
                }
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
