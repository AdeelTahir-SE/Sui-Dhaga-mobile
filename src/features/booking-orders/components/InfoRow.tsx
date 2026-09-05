import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type InfoRowProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  highlight?: boolean;
};

export function InfoRow({ icon, label, value, highlight }: InfoRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center">
        {icon ? (
          <Ionicons
            name={icon}
            size={15}
            color="#6F767E"
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text className={`text-[12px] ${highlight ? "font-bold text-brand-dark" : "text-brand-gray"}`}>{label}</Text>
      </View>
      <Text className={`text-right text-[12px] ${highlight ? "font-bold text-primary" : "font-medium text-brand-dark"}`}>
        {value}
      </Text>
    </View>
  );
}
