import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type InfoRowProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export function InfoRow({ icon, label, value }: InfoRowProps) {
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
        <Text className="text-[12px] text-brand-gray">{label}</Text>
      </View>
      <Text className="text-right text-[12px] font-medium text-brand-dark">
        {value}
      </Text>
    </View>
  );
}
