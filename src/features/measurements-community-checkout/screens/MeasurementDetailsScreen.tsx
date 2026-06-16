import { Text, View } from "react-native";

import { MccButton } from "../components/MccButton";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PlaceholderVisual } from "../components/PlaceholderVisual";

const bustGuide = require("@/assets/illustrations/measurements-community-checkout/measurements/bust-guide.png");

export default function MeasurementDetailsScreen() {
  return (
    <MccScreenShell>
      <MccHeader title="Measurement Details" showBack rightText="Edit" />
      <View className="px-5">
        <Text className="text-[15px] font-semibold text-brand-dark">Bust</Text>
        <View className="mt-4 flex-row items-end">
          <Text className="text-[36px] font-bold text-brand-dark">34</Text>
          <Text className="mb-2 ml-2 text-[14px] text-brand-dark">in</Text>
        </View>
        <Text className="mb-8 mt-1 text-[12px] text-brand-gray">inches</Text>

        <Text className="mb-3 text-[13px] font-semibold text-brand-dark">How to Measure</Text>
        <View className="mb-6 flex-row">
          <Text className="flex-1 text-[12px] leading-5 text-brand-dark">
            Measure around the fullest part of your bust.
          </Text>
          <PlaceholderVisual image={bustGuide} variant="body" size="sm" tone="cream" />
        </View>

        <Text className="text-[12px] font-semibold text-brand-dark">Added On</Text>
        <Text className="mb-5 mt-2 text-[12px] text-brand-dark">12 May 2024, 10:30 AM</Text>
        <Text className="text-[12px] font-semibold text-brand-dark">Last Updated</Text>
        <Text className="mt-2 text-[12px] text-brand-dark">12 May 2024, 10:30 AM</Text>

        <View className="mt-28 flex-row gap-3">
          <View className="flex-1">
            <MccButton title="Delete" variant="outline" />
          </View>
          <View className="flex-1">
            <MccButton title="Edit" />
          </View>
        </View>
      </View>
    </MccScreenShell>
  );
}
