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
      className="flex-1 items-center justify-between rounded-md border border-brand-border/80 bg-white px-1.5 py-2.5 shadow-sm active:bg-brand-surface min-h-[92px]"
    >
      <View className="h-11 w-11 items-center justify-center rounded-md bg-primary/10">
        <Ionicons name={icon} size={23} color="#14919B" />
      </View>
      <Text
        numberOfLines={2}
        className="mt-1 text-center text-[11px] font-semibold text-brand-dark leading-[14px]"
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
