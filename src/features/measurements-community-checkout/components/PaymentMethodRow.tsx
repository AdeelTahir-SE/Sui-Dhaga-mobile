import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PaymentMethodRowProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
};

export function PaymentMethodRow({
  title,
  subtitle,
  icon,
  selected,
}: PaymentMethodRowProps) {
  return (
    <View className="h-[58px] flex-row items-center border-b border-brand-border">
      <Ionicons name={icon} size={20} color="#1A1D1F" />
      <View className="ml-3 flex-1">
        <Text className="text-[12px] font-semibold text-brand-dark">
          {title}
        </Text>
        <Text className="mt-1 text-[10px] text-brand-gray">{subtitle}</Text>
      </View>
      {selected ? (
        <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      )}
    </View>
  );
}
