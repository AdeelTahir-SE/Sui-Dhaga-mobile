import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { RatingLine } from "./RatingLine";
import { TailorBadge } from "./TailorBadge";
import { TailorPlaceholder } from "./TailorPlaceholder";

type TailorListCardProps = {
  image?: ImageSource;
  name: string;
  rating: string;
  distance: string;
  specialty: string;
  tone?: "teal" | "coral" | "gold" | "blue" | "cream";
  topRated?: boolean;
};

export function TailorListCard({
  image,
  name,
  rating,
  distance,
  specialty,
  tone = "coral",
  topRated,
}: TailorListCardProps) {
  return (
    <View className="mb-3 rounded-xl border border-brand-border bg-white p-3">
      <View className="flex-row">
        <TailorPlaceholder image={image} size="md" tone={tone} />
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[15px] font-bold text-brand-dark">
              {name}
            </Text>
            <Ionicons name="heart-outline" size={21} color="#1A1D1F" />
          </View>
          <RatingLine rating={rating} distance={distance} />
          <Text className="mt-2 text-[12px] text-brand-gray">{specialty}</Text>
          <View className="mt-3 flex-row gap-2">
            <TailorBadge label="Verified" />
            {topRated ? <TailorBadge label="Top Rated" tone="gray" /> : null}
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/tailors/rekha-tailors" as never)}
        className="mt-3 self-end rounded-lg border border-primary px-5 py-2"
      >
        <Text className="text-[12px] font-semibold text-primary">
          View Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}
