import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { RatingLine } from "../components/RatingLine";
import { TailorBadge } from "../components/TailorBadge";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { TailorScreenShell } from "../components/TailorScreenShell";
import { useTailorDetails } from "../hooks/useTailors";

const profileHeroImage = require("@/assets/illustrations/tailor-discovery/profile-hero.png");
const rekhaImage = require("@/assets/illustrations/customer-tabs/tailors/rekha.png");

const galleryImages = [
  require("@/assets/illustrations/tailor-discovery/gallery/mint-anarkali.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/gold-saree.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/coral-lehenga.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/teal-sherwani.png"),
  require("@/assets/illustrations/tailor-discovery/gallery/cream-kurta.png"),
];

const serviceImages = [
  require("@/assets/illustrations/tailor-discovery/services/custom-anarkali.png"),
  require("@/assets/illustrations/tailor-discovery/services/bridal-lehenga.png"),
];

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="mb-3 mt-5 flex-row items-center justify-between">
      <Text className="text-[14px] font-semibold text-brand-dark">{title}</Text>
      <Text className="text-[11px] font-semibold text-primary">See All</Text>
    </View>
  );
}

export default function TailorProfileScreen() {
  const { tailorId } = useLocalSearchParams<{ tailorId?: string }>();
  const { tailor, isLoading } = useTailorDetails(tailorId || "1");

  const name = tailor?.name || tailor?.businessName || "Rekha Tailors";
  const rating = String(tailor?.rating || "4.8");
  const reviewsCount = `${tailor?.reviews || tailor?.reviewsCount || 128} reviews`;
  const distance = tailor?.distance || "2.1 km";
  const location = tailor?.location?.address || "C-Scheme, Jaipur, Rajasthan";
  const bio = tailor?.bio || "Experienced in creating custom outfits with perfect fit and beautiful finishing. 12+ years of experience.";
  const tags = tailor?.specialties || ["Bridal", "Suits", "Sarees", "Lehengas", "Alterations"];

  return (
    <TailorScreenShell bottomTabs={<TailorBottomTabs />}>
      <View className="relative">
        <TailorPlaceholder
          image={profileHeroImage}
          variant="map"
          size="wide"
          tone="cream"
        />
        <View className="absolute left-0 right-0 top-0">
          <TailorHeader title="" showBack rightIcon="heart-outline" />
        </View>
        <View className="absolute bottom-4 right-4">
          <TailorBadge label="Verified" />
        </View>
      </View>

      <View className="px-5 pb-8">
        <View className="-mt-8 flex-row items-end">
          <TailorPlaceholder image={tailor?.image || tailor?.imageUrl || rekhaImage} size="md" tone="coral" />
          <View className="ml-4 flex-1 pb-1">
            <Text className="text-[21px] font-bold text-brand-dark">
              {name}
            </Text>
            <RatingLine rating={rating} reviews={reviewsCount} distance={distance} />
            <Text className="mt-1 text-[12px] text-brand-gray">
              {location}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <View
              key={tag}
              className="rounded-lg border border-brand-border px-3 py-2 bg-white"
            >
              <Text className="text-[11px] font-medium text-brand-dark">
                {tag}
              </Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Gallery" />
        <View className="flex-row gap-2">
          {["teal", "blue", "coral", "gold", "cream"].map((tone, index) => (
            <View key={tone} className="flex-1">
              <TailorPlaceholder
                image={galleryImages[index]}
                variant="garment"
                size="sm"
                tone={tone as "teal" | "blue" | "coral" | "gold" | "cream"}
                label={`Look ${index + 1}`}
              />
            </View>
          ))}
        </View>

        <Text className="mb-2 mt-5 text-[14px] font-semibold text-brand-dark">
          About
        </Text>
        <Text className="text-[12px] leading-5 text-brand-gray">
          {bio}
        </Text>

        <SectionHeader title="Services" />
        <View className="flex-row gap-3">
          {[
            ["Custom Anarkali Suit", "₹12,500", "7 - 10 Days", "teal"],
            ["Bridal Lehenga", "₹28,000", "15 - 20 Days", "coral"],
          ].map(([title, price, days, tone]) => (
            <View
              key={title}
              className="flex-1 rounded-xl border border-brand-border p-3 bg-white"
            >
              <TailorPlaceholder
                image={serviceImages[tone === "teal" ? 0 : 1]}
                variant="garment"
                size="sm"
                tone={tone as "teal" | "coral"}
              />
              <Text className="mt-3 text-[12px] font-semibold text-brand-dark">
                {title}
              </Text>
              <Text className="mt-1 text-[12px] font-bold text-brand-dark">
                {price}
              </Text>
              <Text className="mt-1 text-[10px] text-brand-gray">{days}</Text>
            </View>
          ))}
        </View>

        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push("/messages" as any)}
            className="h-[52px] flex-1 flex-row items-center justify-center rounded-xl border border-primary bg-white"
          >
            <Ionicons name="chatbubble-outline" size={17} color="#14919B" />
            <Text className="ml-2 text-[14px] font-semibold text-primary">
              Message
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/booking/${tailorId || "1"}` as never)}
            className="h-[52px] flex-1 flex-row items-center justify-center rounded-xl bg-primary"
          >
            <Ionicons name="calendar-outline" size={17} color="#FFFFFF" />
            <Text className="ml-2 text-[14px] font-semibold text-white">
              Book Appointment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TailorScreenShell>
  );
}
