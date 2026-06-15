import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { RatingLine } from "../components/RatingLine";
import { TailorBadge } from "../components/TailorBadge";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { TailorScreenShell } from "../components/TailorScreenShell";

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="mb-3 mt-5 flex-row items-center justify-between">
      <Text className="text-[14px] font-semibold text-brand-dark">{title}</Text>
      <Text className="text-[11px] font-semibold text-primary">See All</Text>
    </View>
  );
}

export default function TailorProfileScreen() {
  return (
    <TailorScreenShell>
      <View className="relative">
        <TailorPlaceholder variant="map" size="wide" tone="cream" />
        <View className="absolute left-0 right-0 top-0">
          <TailorHeader title="" showBack rightIcon="heart-outline" />
        </View>
        <View className="absolute bottom-4 right-4">
          <TailorBadge label="Verified" />
        </View>
      </View>

      <View className="px-5">
        <View className="-mt-8 flex-row items-end">
          <TailorPlaceholder size="md" tone="coral" />
          <View className="ml-4 flex-1 pb-1">
            <Text className="text-[21px] font-bold text-brand-dark">
              Rekha Tailors
            </Text>
            <RatingLine rating="4.8" reviews="128 reviews" distance="2.1 km" />
            <Text className="mt-1 text-[12px] text-brand-gray">
              C-Scheme, Jaipur, Rajasthan
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          {["Bridal", "Suits", "Sarees", "Lehengas", "Alterations"].map(
            (tag) => (
              <View
                key={tag}
                className="rounded-lg border border-brand-border px-3 py-2"
              >
                <Text className="text-[11px] font-medium text-brand-dark">
                  {tag}
                </Text>
              </View>
            ),
          )}
        </View>

        <SectionHeader title="Gallery" />
        <View className="flex-row gap-2">
          {["teal", "blue", "coral", "gold", "cream"].map((tone, index) => (
            <View key={tone} className="flex-1">
              <TailorPlaceholder
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
          Experienced in creating custom outfits with perfect fit and beautiful
          finishing. 12+ years of experience.
        </Text>

        <SectionHeader title="Services" />
        <View className="flex-row gap-3">
          {[
            ["Custom Anarkali Suit", "₹12,500", "7 - 10 Days", "teal"],
            ["Bridal Lehenga", "₹28,000", "15 - 20 Days", "coral"],
          ].map(([title, price, days, tone]) => (
            <View
              key={title}
              className="flex-1 rounded-xl border border-brand-border p-3"
            >
              <TailorPlaceholder
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

        <View className="mt-5 flex-row gap-3">
          <TouchableOpacity className="h-[52px] flex-1 flex-row items-center justify-center rounded-xl border border-primary">
            <Ionicons name="chatbubble-outline" size={17} color="#14919B" />
            <Text className="ml-2 text-[14px] font-semibold text-primary">
              Message
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/booking/rekha-tailors" as never)}
            className="h-[52px] flex-1 flex-row items-center justify-center rounded-xl bg-primary"
          >
            <Ionicons name="calendar-outline" size={17} color="#FFFFFF" />
            <Text className="ml-2 text-[14px] font-semibold text-white">
              Book Appointment
            </Text>
          </TouchableOpacity>
        </View>

        <TailorBottomTabs />
      </View>
    </TailorScreenShell>
  );
}
