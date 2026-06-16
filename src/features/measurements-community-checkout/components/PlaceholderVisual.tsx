import { StyleSheet, Text, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type Tone = "teal" | "coral" | "gold" | "blue" | "mint" | "cream";

type PlaceholderVisualProps = {
  image?: ImageSource;
  label?: string;
  variant?: "body" | "garment" | "person" | "card";
  size?: "xs" | "sm" | "md" | "lg" | "wide";
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
  lg: "h-[260px] w-full",
  wide: "h-[150px] w-full",
};

const generatedAssets = {
  body: require("@/assets/illustrations/generated/measurement-guide.png"),
  garment: require("@/assets/illustrations/generated/garment-set.png"),
  person: require("@/assets/illustrations/generated/action-icons.png"),
  card: require("@/assets/illustrations/generated/checkout-status.png"),
};

export function PlaceholderVisual({
  image,
  label,
  variant = "garment",
  size = "md",
  tone = "teal",
}: PlaceholderVisualProps) {
  const icon =
    variant === "body"
      ? "body-outline"
      : variant === "person"
        ? "person"
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
        <Text className="absolute bottom-1 rounded bg-white/80 px-2 text-center text-[9px] font-medium text-brand-gray">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
