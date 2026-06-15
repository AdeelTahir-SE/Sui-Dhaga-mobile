import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ExportRowProps = {
  title: string;
  value: string;
};

export function ExportRow({ title, value }: ExportRowProps) {
  return (
    <TouchableOpacity className="h-[44px] flex-row items-center justify-between border-t border-brand-border">
      <Text className="text-[12px] font-medium text-brand-dark">{title}</Text>
      <View className="flex-row items-center">
        <Text className="mr-2 text-[11px] text-brand-gray">{value}</Text>
        <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}
