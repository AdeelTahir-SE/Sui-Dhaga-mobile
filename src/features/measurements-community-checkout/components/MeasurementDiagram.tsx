import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function MeasurementDiagram() {
  return (
    <View className="flex-row justify-center gap-8 rounded-2xl bg-brand-surface py-5">
      {["Front", "Back"].map((side) => (
        <View key={side} className="items-center">
          <View className="h-[180px] w-[82px] items-center justify-center rounded-full bg-primary-50">
            <Ionicons name="body-outline" size={60} color="#14919B" />
          </View>
          <Text className="mt-2 text-[10px] font-medium text-brand-gray">
            {side}
          </Text>
        </View>
      ))}
    </View>
  );
}
