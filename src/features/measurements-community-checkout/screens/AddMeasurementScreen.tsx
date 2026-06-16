import { Text, TextInput, View } from "react-native";

import { MccButton } from "../components/MccButton";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PlaceholderVisual } from "../components/PlaceholderVisual";

const bustGuide = require("@/assets/illustrations/measurements-community-checkout/measurements/bust-guide.png");

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-semibold text-brand-dark">{label}</Text>
      <View className="rounded-xl border border-brand-border px-4 py-3">
        <TextInput editable={false} value={value} className="text-[13px] text-brand-dark" />
      </View>
    </View>
  );
}

export default function AddMeasurementScreen() {
  return (
    <MccScreenShell>
      <MccHeader title="Add Measurement" showBack rightText="" />
      <View className="px-5">
        <Text className="mb-2 text-[13px] font-semibold text-brand-dark">Unit</Text>
        <View className="mb-5 flex-row self-end rounded-xl bg-brand-surface p-1">
          <View className="rounded-lg px-5 py-2">
            <Text className="text-[12px] text-brand-dark">cm</Text>
          </View>
          <View className="rounded-lg bg-primary px-5 py-2">
            <Text className="text-[12px] font-semibold text-white">in</Text>
          </View>
        </View>

        <Field label="Measurement Name" value="Bust" />
        <Text className="mb-2 text-[13px] font-semibold text-brand-dark">How to Measure</Text>
        <View className="mb-4 flex-row rounded-xl border border-brand-border p-3">
          <Text className="flex-1 text-[12px] leading-5 text-brand-dark">
            Measure around the fullest part of your bust.
          </Text>
          <PlaceholderVisual image={bustGuide} variant="body" size="sm" tone="cream" />
        </View>
        <Field label="Value" value="34                                      inches" />
        <View className="mb-7">
          <Text className="mb-2 text-[13px] font-semibold text-brand-dark">Notes (Optional)</Text>
          <View className="rounded-xl border border-brand-border px-4 py-3">
            <TextInput editable={false} multiline value="Add notes" className="min-h-[80px] text-[13px] text-brand-gray" />
          </View>
        </View>
        <MccButton title="Save Measurement" />
      </View>
    </MccScreenShell>
  );
}
