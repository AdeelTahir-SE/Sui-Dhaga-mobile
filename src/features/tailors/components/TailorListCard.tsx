import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { RatingLine } from "./RatingLine";
import { TailorBadge } from "./TailorBadge";
import { TailorPlaceholder } from "./TailorPlaceholder";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

type TailorListCardProps = {
  id?: string;
  image?: any;
  name: string;
  rating: string;
  distance: string;
  specialty: string;
  tone?: "teal" | "coral" | "gold" | "blue" | "cream";
  topRated?: boolean;
  onPress?: () => void;
};

export function TailorListCard({
  id,
  image,
  name,
  rating,
  distance,
  specialty,
  tone = "coral",
  topRated,
  onPress,
}: TailorListCardProps) {
  const handleViewProfile = () => {
    if (onPress) {
      onPress();
    } else if (id) {
      router.push(`/tailors/${id}` as any);
    } else {
      router.push("/tailors/rekha-tailors" as any);
    }
  };

  return (
    <View className="mb-3 rounded-md border border-brand-border bg-white p-3.5 shadow-xs">
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
        onPress={handleViewProfile}
        activeOpacity={0.82}
        style={{
          marginTop: 12,
          alignSelf: "flex-end",
          borderRadius: 6,
          overflow: "hidden",
          position: "relative",
          paddingHorizontal: 20,
          paddingVertical: 8,
          backgroundColor: "#078B87",
        }}
      >
        <ButtonTexture variant="greenish" borderRadius={6} />
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#FFFFFF", zIndex: 1 }}>
          View Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}
