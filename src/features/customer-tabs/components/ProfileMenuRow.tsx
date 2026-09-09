import { Text, TouchableOpacity, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const profileActionIcons = require("@/assets/illustrations/customer-tabs/profile-action-icons.png");

type ProfileMenuRowProps = {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  image?: ImageSource;
  highlighted?: boolean;
  badge?: string | number;
  onPress?: () => void;
  showChevron?: boolean;
};

export function ProfileMenuRow({
  title,
  subtitle,
  icon,
  iconColor = "#14919B",
  iconBg = "bg-primary-50",
  image,
  highlighted,
  badge,
  onPress,
  showChevron = true,
}: ProfileMenuRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      className={`mb-2.5 flex-row items-center rounded-2xl p-3.5 border transition-all ${
        highlighted
          ? "bg-[#FFF8EF] border-[#F2DFC4] shadow-xs"
          : "bg-white border-brand-border/60 shadow-xs"
      }`}
    >
      <View
        className={`h-10 w-10 overflow-hidden rounded-xl items-center justify-center ${
          image ? "bg-primary-50" : iconBg
        }`}
      >
        {image ? (
          <Image
            source={image ?? profileActionIcons}
            contentFit="contain"
            style={{ height: "100%", width: "100%" }}
          />
        ) : icon ? (
          <Ionicons name={icon} size={20} color={iconColor} />
        ) : (
          <Ionicons name="folder-outline" size={18} color="#14919B" />
        )}
      </View>
      <View className="ml-3.5 flex-1 pr-2">
        <View className="flex-row items-center">
          <Text className="text-[14px] font-bold text-brand-dark tracking-tight">
            {title}
          </Text>
          {badge !== undefined && badge !== null && (
            <View className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 border border-primary/20">
              <Text className="text-[10px] font-black text-primary">
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Text
          className="mt-0.5 text-[11px] font-medium text-brand-gray"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      {showChevron && (
        <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-surface">
          <Ionicons
            name={highlighted ? "pencil-outline" : "chevron-forward"}
            size={14}
            color={highlighted ? "#14919B" : "#8A94A6"}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

