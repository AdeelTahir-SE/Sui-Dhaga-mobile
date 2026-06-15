import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
};

export function PrimaryButton({ title, onPress }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      className="h-[52px] flex-row items-center justify-center rounded-xl bg-primary"
    >
      <Text className="text-[15px] font-semibold text-white">{title}</Text>
      <Ionicons
        name="sparkles"
        size={16}
        color="#FBD36C"
        style={{ marginLeft: 7 }}
      />
    </TouchableOpacity>
  );
}
