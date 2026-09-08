import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { RatingLine } from "../components/RatingLine";
import { TailorBadge } from "../components/TailorBadge";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { FixedBottomTabs } from "@/components/layout/FixedBottomTabs";
import { useTailors } from "../hooks/useTailors";

const mapImage = require("@/assets/illustrations/tailor-discovery/map/tailors-map.png");

export default function TailorsMapScreen() {
  const { tailors, isLoading } = useTailors();
  const selectedTailor = tailors.length > 0 ? tailors[0] : null;

  const tailorName =
    selectedTailor?.shopName ||
    selectedTailor?.businessName ||
    selectedTailor?.name ||
    "Tailor Studio";
  const ratingText = selectedTailor?.rating
    ? `${Number(selectedTailor.rating).toFixed(1)} (${selectedTailor.reviewsCount ?? selectedTailor.reviews ?? 0})`
    : "New";
  const distanceText =
    selectedTailor?.city ||
    (typeof selectedTailor?.location === "object"
      ? selectedTailor.location?.city
      : null) ||
    selectedTailor?.address ||
    "Nearby";
  const specialtiesText =
    Array.isArray(selectedTailor?.specialties) &&
    selectedTailor.specialties.length > 0
      ? `Specializes in ${selectedTailor.specialties.join(", ")}`
      : selectedTailor?.bio || "Bespoke & Custom Tailoring";
  const tailorImage =
    selectedTailor?.imageUrl ||
    selectedTailor?.image ||
    selectedTailor?.avatar;

  return (
    <View className="flex-1 bg-[#F4EFE3]">
      <View className="relative flex-1 overflow-hidden">
        <Image
          source={mapImage}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />

        <View className="absolute left-5 right-5 top-14 z-10 h-[52px] flex-row items-center rounded-md bg-white px-4">
          <Ionicons name="search" size={19} color="#1A1D1F" />
          <Text className="ml-3 flex-1 text-[13px] text-brand-dark">
            Search this area
          </Text>
          <View className="h-10 w-10 items-center justify-center rounded-md bg-brand-surface">
            <Ionicons name="options-outline" size={18} color="#1A1D1F" />
          </View>
        </View>

        {isLoading ? (
          <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white px-5 pb-28 pt-8 items-center justify-center">
            <ActivityIndicator size="small" color="#14919B" />
          </View>
        ) : selectedTailor ? (
          <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white px-5 pb-28 pt-4">
            <View className="mb-3 self-center h-1 w-11 rounded-full bg-brand-border" />
            <View className="flex-row">
              <TailorPlaceholder
                image={tailorImage}
                size="md"
                tone="coral"
              />
              <View className="ml-3 flex-1">
                <View className="flex-row items-start justify-between">
                  <Text className="text-[18px] font-bold text-brand-dark">
                    {tailorName}
                  </Text>
                  <Ionicons name="heart-outline" size={22} color="#1A1D1F" />
                </View>
                <RatingLine rating={ratingText} distance={distanceText} />
                <Text
                  className="mt-2 text-[12px] text-brand-gray"
                  numberOfLines={2}
                >
                  {specialtiesText}
                </Text>
                <View className="mt-3 flex-row gap-2">
                  <TailorBadge label="Verified" />
                  {(selectedTailor.topRated || selectedTailor.isTopRated) && (
                    <TailorBadge label="Top Rated" tone="gray" />
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push(
                  (selectedTailor.id
                    ? `/tailors/${selectedTailor.id}`
                    : "/tailors") as never
                )
              }
              className="mt-4 h-[52px] items-center justify-center rounded-md bg-primary"
            >
              <Text className="text-[15px] font-semibold text-white">
                View Profile
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white px-5 pb-28 pt-6 items-center">
            <Text className="text-[14px] text-brand-gray">
              No tailors found in this area
            </Text>
          </View>
        )}
        <FixedBottomTabs>
          <TailorBottomTabs />
        </FixedBottomTabs>
      </View>
    </View>
  );
}
