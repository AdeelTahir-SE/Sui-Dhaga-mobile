import { StyleSheet, Text, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type Tone = "teal" | "coral" | "gold" | "blue" | "mint" | "cream";

type TabPlaceholderProps = {
  image?: any;
  label?: string;
  variant?: "person" | "garment" | "machine" | "card";
  size?: "xs" | "sm" | "md" | "wide" | "hero";
  tone?: Tone;
};

const toneClasses: Record<Tone, string> = {
  teal: "bg-primary-50",
  coral: "bg-[#FFF0EC]",
  gold: "bg-[#FFF6DA]",
  blue: "bg-[#EAF3FF]",
  mint: "bg-[#EAF8EE]",
  cream: "bg-[#F8F4EA]",
};

const iconColors: Record<Tone, string> = {
  teal: "#14919B",
  coral: "#F05A57",
  gold: "#D79A00",
  blue: "#3B77C9",
  mint: "#29A45B",
  cream: "#B18A4A",
};

const sizeClasses = {
  xs: "h-10 w-10",
  sm: "h-16 w-16",
  md: "h-24 w-20",
  wide: "h-[116px] w-full",
  hero: "h-[132px] w-[150px]",
};

const generatedAssets = {
  garment: require("@/assets/illustrations/customer-tabs/category-tiles.png"),
  person: require("@/assets/illustrations/customer-tabs/tailor-avatars.png"),
  machine: require("@/assets/illustrations/customer-tabs/home-hero.png"),
  card: require("@/assets/illustrations/customer-tabs/profile-action-icons.png"),
};

export function TabPlaceholder({
  image,
  label,
  variant = "garment",
  size = "md",
  tone = "teal",
}: TabPlaceholderProps) {
  const icon =
    variant === "person"
      ? "person"
      : variant === "machine"
        ? "construct-outline"
        : variant === "card"
          ? "card-outline"
          : "shirt-outline";

  return (
    <View
      className={`${sizeClasses[size]} items-center justify-center overflow-hidden rounded-xl ${toneClasses[tone]}`}
    >
      <Image
        source={image ?? generatedAssets[variant]}
        contentFit="contain"
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute inset-0 bg-white/10" />
      {size === "xs" ? (
        <Ionicons name={icon} size={14} color={iconColors[tone]} />
      ) : null}
      {label ? (
        <Text className="absolute bottom-1 rounded bg-white/80 px-1 text-center text-[9px] font-medium text-brand-gray">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
