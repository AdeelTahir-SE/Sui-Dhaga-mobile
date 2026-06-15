import { Text, View } from "react-native";

import { colorSwatches } from "../constants/designStudioAssets";

type SwatchesProps = {
  colors?: string[];
};

export function Swatches({ colors = colorSwatches }: SwatchesProps) {
  return (
    <View className="flex-row items-center gap-3">
      {colors.map((color) => (
        <View
          key={color}
          className="h-8 w-8 rounded-full border border-brand-border"
          style={{ backgroundColor: color }}
        />
      ))}
      <View className="rounded-lg border border-brand-border px-3 py-2">
        <Text className="text-[11px] font-medium text-brand-dark">+ More</Text>
      </View>
    </View>
  );
}
