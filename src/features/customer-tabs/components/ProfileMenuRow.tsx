import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ProfileMenuRowProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  highlighted?: boolean;
};

export function ProfileMenuRow({ title, subtitle, icon, highlighted }: ProfileMenuRowProps) {
  return (
    <View
      className={`mb-2 flex-row items-center rounded-xl p-4 ${
        highlighted ? "bg-[#FFF8EF] border border-[#F2DFC4]" : "bg-white"
      }`}
    >
      <Ionicons name={icon} size={22} color={highlighted ? "#14919B" : "#1A1D1F"} />
      <View className="ml-3 flex-1">
        <Text className="text-[13px] font-semibold text-brand-dark">{title}</Text>
        <Text className="mt-1 text-[10px] text-brand-gray">{subtitle}</Text>
      </View>
      <Ionicons name={highlighted ? "pencil-outline" : "chevron-forward"} size={17} color="#9CA3AF" />
    </View>
  );
}
