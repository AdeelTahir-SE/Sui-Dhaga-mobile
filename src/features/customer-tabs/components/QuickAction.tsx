import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type QuickActionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function QuickAction({ title, icon, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 items-center justify-between rounded-2xl border border-brand-border/80 bg-white p-3 shadow-sm active:bg-brand-surface min-h-[96px]"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        <Ionicons name={icon} size={25} color="#14919B" />
      </View>
      <Text className="mt-1.5 text-center text-[12px] font-semibold text-brand-dark leading-[16px]">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
