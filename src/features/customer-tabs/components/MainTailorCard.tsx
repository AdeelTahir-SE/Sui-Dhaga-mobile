import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { TabPlaceholder } from "./TabPlaceholder";

type MainTailorCardProps = {
  name: string;
  rating: string;
  distance: string;
  specialty: string;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  topRated?: boolean;
};

export function MainTailorCard({
  name,
  rating,
  distance,
  specialty,
  tone = "coral",
  topRated,
}: MainTailorCardProps) {
  return (
    <View className="mb-3 rounded-xl border border-brand-border p-3">
      <View className="flex-row">
        <TabPlaceholder variant="person" size="md" tone={tone} />
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[14px] font-bold text-brand-dark">{name}</Text>
            <Ionicons name="heart-outline" size={20} color="#1A1D1F" />
          </View>
          <View className="mt-1 flex-row items-center">
            <Ionicons name="star" size={12} color="#F4B400" />
            <Text className="ml-1 text-[11px] text-brand-dark">{rating}</Text>
            <Text className="ml-2 text-[11px] text-brand-gray">• {distance}</Text>
          </View>
          <Text className="mt-2 text-[11px] text-brand-gray">{specialty}</Text>
          <View className="mt-2 flex-row gap-2">
            <Text className="rounded bg-primary-50 px-2 py-1 text-[9px] font-medium text-primary">
              Verified
            </Text>
            {topRated ? (
              <Text className="rounded bg-brand-surface px-2 py-1 text-[9px] font-medium text-brand-dark">
                Top Rated
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/tailors/rekha-tailors" as never)}
        className="mt-3 self-end rounded-lg border border-primary px-5 py-2"
      >
        <Text className="text-[11px] font-semibold text-primary">View Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
