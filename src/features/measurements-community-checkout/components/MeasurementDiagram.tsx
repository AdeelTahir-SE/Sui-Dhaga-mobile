import { View } from "react-native";
import { Image } from "expo-image";

const measurementDiagram = require("@/assets/illustrations/measurements-community-checkout/measurements/body-diagram.png");

export function MeasurementDiagram() {
  return (
    <View className="flex-row justify-center gap-8 rounded-2xl bg-brand-surface py-5">
      <Image
        source={measurementDiagram}
        contentFit="contain"
        style={{ height: 190, width: "100%" }}
      />
    </View>
  );
}
