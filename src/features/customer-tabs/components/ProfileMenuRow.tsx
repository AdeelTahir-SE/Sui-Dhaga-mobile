import { Text, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const profileActionIcons = require("@/assets/illustrations/customer-tabs/profile-action-icons.png");

type ProfileMenuRowProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  image?: ImageSource;
  highlighted?: boolean;
};

export function ProfileMenuRow({
  title,
  subtitle,
  icon,
  image,
  highlighted,
}: ProfileMenuRowProps) {
  return (
    <View
      className={`mb-2 flex-row items-center rounded-md p-4 ${
        highlighted ? "bg-[#FFF8EF] border border-[#F2DFC4]" : "bg-white"
      }`}
    >
      <View className="h-9 w-9 overflow-hidden rounded-md bg-primary-50">
        <Image
          source={image ?? profileActionIcons}
          contentFit="contain"
          style={{ height: "100%", width: "100%" }}
        />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-bold text-brand-dark">{title}</Text>
        <Text className="mt-0.5 text-[11px] font-medium text-brand-gray">{subtitle}</Text>
      </View>
      <Ionicons name={highlighted ? "pencil-outline" : "chevron-forward"} size={17} color="#9CA3AF" />
    </View>
  );
}
