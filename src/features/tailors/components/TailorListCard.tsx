import { useState, useMemo, memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import type { ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { RatingLine } from "./RatingLine";
import { TailorBadge } from "./TailorBadge";
import { TailorPlaceholder } from "./TailorPlaceholder";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";
import { lightHaptic } from "../../../utils/haptics";

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

export const TailorListCard = memo(function TailorListCard({
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
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggleFavorite = () => {
    lightHaptic();
    setIsFavorite((prev) => !prev);
  };

  const handleViewProfile = () => {
    lightHaptic();
    if (onPress) {
      onPress();
    } else if (id) {
      router.push(`/tailors/${id}` as any);
    } else {
      router.push("/tailors/rekha-tailors" as any);
    }
  };

  const { hasActualPrice, formattedPrice, priceLabel } = useMemo(() => {
    const rawVal =
      startingPrice !== undefined && startingPrice !== null && startingPrice !== ""
        ? startingPrice
        : price;

    let hasActual = false;
    let formatted = "Pricing on request";
    let label = "Pricing";

    if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
      if (typeof rawVal === "number" && rawVal > 0) {
        hasActual = true;
        formatted = `Rs. ${rawVal.toLocaleString()}`;
        label = "Starting from";
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
              hasActual = true;
              formatted = trimmed.startsWith("Rs")
                ? trimmed
                : `Rs. ${numParsed.toLocaleString()}`;
              label = "Starting from";
            }
          }
        }
      }
    }

    return { hasActualPrice: hasActual, formattedPrice: formatted, priceLabel: label };
  }, [price, startingPrice]);

  return (
    <View className="mb-3 rounded-md border border-brand-border bg-white p-3.5 shadow-xs">
      <View className="flex-row">
        <TailorPlaceholder image={image} size="md" tone={tone} />
        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[15px] font-bold text-brand-dark">
              {name}
            </Text>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={21}
                color={isFavorite ? "#EF4444" : "#1A1D1F"}
              />
            </TouchableOpacity>
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
});
