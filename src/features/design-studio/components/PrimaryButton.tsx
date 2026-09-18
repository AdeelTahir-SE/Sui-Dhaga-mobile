import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  showTexture?: boolean;
};

export function PrimaryButton({
  title,
  onPress,
  showTexture = true,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      className="relative h-[52px] flex-row items-center justify-center rounded-xl bg-[#00949D] overflow-hidden shadow-sm"
    >
      {showTexture && <ButtonTexture variant="greenish" borderRadius={12} />}
      <View className="flex-row items-center justify-center z-10 px-4">
        <Text className="text-[15px] font-semibold text-white">{title}</Text>
        <Ionicons
          name="sparkles"
          size={16}
          color="#FBD36C"
          style={{ marginLeft: 7 }}
        />
      </View>
    </TouchableOpacity>
  );
}

