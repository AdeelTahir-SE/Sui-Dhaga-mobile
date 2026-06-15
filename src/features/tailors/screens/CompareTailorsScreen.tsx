import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CompareCell } from "../components/CompareCell";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { TailorScreenShell } from "../components/TailorScreenShell";

function FeatureRow({
  feature,
  values,
  checks,
}: {
  feature: string;
  values?: string[];
  checks?: boolean[];
}) {
  return (
    <View className="flex-row border-t border-brand-border">
      <View className="min-h-[46px] w-[84px] justify-center px-2">
        <Text className="text-[11px] font-medium text-brand-dark">
          {feature}
        </Text>
      </View>
      {[0, 1, 2].map((index) => (
        <CompareCell key={index} check={checks?.[index]}>
          {values?.[index] ?? "-"}
        </CompareCell>
      ))}
    </View>
  );
}

export default function CompareTailorsScreen() {
  return (
    <TailorScreenShell>
      <TailorHeader
        title="Compare Tailors"
        subtitle="Compare and choose the best for you"
        showBack
        rightIcon="settings-outline"
      />
      <View className="px-5">
        <View className="mb-5 flex-row items-start justify-between">
          {[
            ["Rekha Tailors", "coral"],
            ["Stitch Craft", "blue"],
            ["Aarav Bespoke", "gold"],
          ].map(([name, tone]) => (
            <View key={name} className="items-center">
              <View className="relative">
                <TailorPlaceholder
                  size="sm"
                  tone={tone as "coral" | "blue" | "gold"}
                />
                <View className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-white">
                  <Ionicons name="close" size={14} color="#1A1D1F" />
                </View>
              </View>
              <Text className="mt-2 text-center text-[10px] font-medium text-brand-dark">
                {name}
              </Text>
            </View>
          ))}
          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-xl border border-dashed border-primary">
              <Ionicons name="add" size={22} color="#14919B" />
            </View>
            <Text className="mt-2 text-center text-[10px] font-medium text-brand-dark">
              Add Tailor
            </Text>
          </View>
        </View>

        <View className="overflow-hidden rounded-xl border border-brand-border">
          <View className="flex-row bg-brand-surface">
            <View className="h-[56px] w-[84px] justify-center px-2">
              <Text className="text-[12px] font-bold text-brand-dark">
                Feature
              </Text>
            </View>
            {["coral", "blue", "gold"].map((tone) => (
              <View
                key={tone}
                className="flex-1 items-center justify-center border-l border-brand-border"
              >
                <TailorPlaceholder
                  size="xs"
                  tone={tone as "coral" | "blue" | "gold"}
                />
              </View>
            ))}
          </View>
          <FeatureRow feature="Rating" values={["4.8 ★\n(128)", "4.7 ★\n(96)", "4.6 ★\n(72)"]} />
          <FeatureRow feature="Experience" values={["12+ Years", "8+ Years", "10+ Years"]} />
          <FeatureRow feature="Specialties" values={["Bridal, Suits,\nSarees", "Men's Wear", "Indo-Western,\nSuits"]} />
          <FeatureRow feature="Starting Price\n(Anarkali Suit)" values={["₹12,500", "₹9,500", "₹13,000"]} />
          <FeatureRow feature="Delivery Time" values={["7 - 10 Days", "5 - 7 Days", "7 - 12 Days"]} />
          <FeatureRow feature="Location" values={["2.1 km away", "3.4 km away", "4.2 km away"]} />
          <FeatureRow feature="Verified" checks={[true, true, true]} />
          <FeatureRow feature="Top Rated" checks={[true, true, false]} />
          <View className="flex-row border-t border-brand-border">
            <View className="h-[58px] w-[84px]" />
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                className="flex-1 items-center justify-center border-l border-brand-border px-2"
              >
                <TouchableOpacity className="w-full rounded-lg bg-primary py-2">
                  <Text className="text-center text-[11px] font-semibold text-white">
                    Book
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TailorBottomTabs />
      </View>
    </TailorScreenShell>
  );
}
