import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type InfoRowProps = {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  highlight?: boolean;
};

export function InfoRow({ label, value, icon, highlight }: InfoRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center">
        {icon ? (
          <Ionicons
            name={icon}
            size={15}
            color="#14919B"
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text className="text-[12px] text-brand-gray">{label}</Text>
      </View>
      <Text
        className={`text-right text-[12px] ${
          highlight ? "font-bold text-brand-dark" : "font-medium text-brand-dark"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
