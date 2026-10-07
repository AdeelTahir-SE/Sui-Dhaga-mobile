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
  price?: string | number;
  startingPrice?: string | number;
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
  price,
  startingPrice,
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

  const rawVal =
    startingPrice !== undefined && startingPrice !== null && startingPrice !== ""
      ? startingPrice
      : price;

  let hasActualPrice = false;
  let formattedPrice = "Pricing on request";
  let priceLabel = "Pricing";

  if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
    if (typeof rawVal === "number" && rawVal > 0) {
      hasActualPrice = true;
      formattedPrice = `Rs. ${rawVal.toLocaleString()}`;
      priceLabel = "Starting from";
    } else if (typeof rawVal === "string") {
      const trimmed = rawVal.trim();
      const lower = trimmed.toLowerCase();
      if (
        lower &&
        lower !== "0" &&
        lower !== "rs. 0" &&
        !lower.includes("on request") &&
        lower !== "not set"
      ) {
        const numMatch = trimmed.match(/[0-9,.]+/);
        if (numMatch) {
          const numParsed = Number(numMatch[0].replace(/,/g, ""));
          if (!isNaN(numParsed) && numParsed > 0) {
            hasActualPrice = true;
            formattedPrice = trimmed.startsWith("Rs")
              ? trimmed
              : `Rs. ${numParsed.toLocaleString()}`;
            priceLabel = "Starting from";
          }
        }
      }
    }
  }

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
          {topRated ? (
            <View className="mt-2.5 flex-row">
              <TailorBadge label="Top Rated" tone="gray" />
            </View>
          ) : null}
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <View>
          <Text style={{ fontSize: 10, fontWeight: "600", color: "#94A3B8", textTransform: "uppercase" }}>
            {priceLabel}
          </Text>
          <Text
            style={{
              fontSize: hasActualPrice ? 14 : 12.5,
              fontWeight: "700",
              color: hasActualPrice ? "#0F172A" : "#64748B",
            }}
          >
            {formattedPrice}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleViewProfile}
          activeOpacity={0.82}
          style={{
            borderRadius: 6,
            overflow: "hidden",
            position: "relative",
            paddingHorizontal: 18,
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
    </View>
  );
}
