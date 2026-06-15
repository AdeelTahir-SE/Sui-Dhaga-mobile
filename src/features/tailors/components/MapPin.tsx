import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type MapPinProps = {
  top: number;
  left: number;
  label: string;
  featured?: boolean;
};

export function MapPin({ top, left, label, featured }: MapPinProps) {
  return (
    <View className="absolute items-center" style={{ top, left }}>
      <View
        className={`items-center justify-center rounded-full ${
          featured ? "h-16 w-16 border-2 border-primary bg-white" : "h-10 w-10 bg-primary"
        }`}
      >
        {featured ? (
          <Ionicons name="person" size={28} color="#14919B" />
        ) : (
          <Ionicons name="location" size={22} color="#FFFFFF" />
        )}
      </View>
      <View className="mt-1 rounded bg-white px-2 py-1">
        <Text className="text-[10px] font-semibold text-brand-dark">
          ★ {label}
        </Text>
      </View>
    </View>
  );
}
