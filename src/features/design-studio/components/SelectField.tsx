import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SelectFieldProps = {
  label: string;
  value: string;
};

export function SelectField({ label, value }: SelectFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-semibold text-brand-dark">
        {label}
      </Text>
      <View className="h-[48px] flex-row items-center justify-between rounded-xl border border-brand-border bg-white px-4">
        <Text className="text-[13px] text-brand-dark">{value}</Text>
        <Ionicons name="chevron-down" size={17} color="#1A1D1F" />
      </View>
    </View>
  );
}
