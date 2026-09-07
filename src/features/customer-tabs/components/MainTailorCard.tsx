import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { TabPlaceholder } from "./TabPlaceholder";

type MainTailorCardProps = {
  id?: string;
  name: string;
  rating: string;
  distance: string;
  specialty: string;
  image?: any;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  topRated?: boolean;
  onPress?: () => void;
  price?: string | number;
};

export function MainTailorCard({
  id,
  name,
  rating,
  distance,
  specialty,
  image,
  tone = "coral",
  topRated,
  onPress,
  price = "Rs. 1,500",
}: MainTailorCardProps) {
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
    <View className="mb-4 rounded-md border border-brand-border bg-white p-4 shadow-sm">
      <View className="flex-row">
        <TabPlaceholder image={image} variant="person" size="md" tone={tone} />
        <View className="ml-3.5 flex-1 justify-between">
          <View>
            <View className="flex-row items-start justify-between">
              <Text className="text-[17px] font-bold text-brand-dark">{name}</Text>
              <TouchableOpacity activeOpacity={0.7} className="p-1">
                <Ionicons name="heart-outline" size={22} color="#1A1D1F" />
              </TouchableOpacity>
            </View>
            <View className="mt-1 flex-row items-center">
              <Ionicons name="star" size={15} color="#F4B400" />
              <Text className="ml-1 text-[13px] font-semibold text-brand-dark">{rating}</Text>
              <Text className="ml-2 text-[13px] font-medium text-brand-gray">• {distance}</Text>
            </View>
            <Text className="mt-1.5 text-[13px] font-medium text-brand-gray leading-[18px]" numberOfLines={2}>
              {specialty}
            </Text>
          </View>

          <View className="mt-2.5 flex-row gap-2">
            <Text className="rounded-md bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary">
              ✓ Verified
            </Text>
            {topRated ? (
              <Text className="rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                ★ Top Rated
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View className="mt-4 pt-3 border-t border-brand-border/60 flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] font-medium text-brand-gray">Starting from</Text>
          <Text className="text-[15px] font-bold text-brand-dark">{typeof price === 'number' ? `Rs. ${price.toLocaleString()}` : price}</Text>
        </View>
        <TouchableOpacity
          onPress={handleViewProfile}
          activeOpacity={0.8}
          className="h-[40px] px-5 rounded-md bg-primary items-center justify-center active:bg-primary-dark"
        >
          <Text className="text-[13px] font-bold text-white">View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
