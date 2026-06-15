import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type QuickActionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function QuickAction({ title, icon }: QuickActionProps) {
  return (
    <TouchableOpacity className="flex-1 items-center rounded-xl border border-brand-border p-3">
      <Ionicons name={icon} size={22} color="#14919B" />
      <Text className="mt-2 text-center text-[10px] font-medium text-brand-dark">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
