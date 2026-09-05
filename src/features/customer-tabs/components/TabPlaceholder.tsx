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
  xs: "h-12 w-12",
  sm: "h-20 w-20",
  md: "h-28 w-24",
  lg: "h-32 w-28",
  wide: "h-[130px] w-full",
  hero: "h-[150px] w-[170px]",
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
      className={`${sizeClasses[size] || sizeClasses.md} items-center justify-center overflow-hidden rounded-2xl ${toneClasses[tone]}`}
    >
      <Image
        source={image ?? generatedAssets[variant]}
        contentFit="contain"
        style={StyleSheet.absoluteFill}
      />
      <View className="absolute inset-0 bg-white/10" />
      {size === "xs" ? (
        <Ionicons name={icon} size={18} color={iconColors[tone]} />
      ) : null}
      {label ? (
        <Text className="absolute bottom-1.5 rounded-md bg-white/90 px-2 py-0.5 text-center text-[11px] font-bold text-brand-dark shadow-xs">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
