import { View } from "react-native";
import { Image } from "expo-image";

const measurementGuide = require("@/assets/illustrations/generated/measurement-guide.png");

export function MeasurementDiagram() {
  return (
    <View className="flex-row justify-center gap-8 rounded-2xl bg-brand-surface py-5">
      <Image
        source={measurementGuide}
        contentFit="contain"
        className="h-[190px] w-full"
      />
    </View>
  );
}
