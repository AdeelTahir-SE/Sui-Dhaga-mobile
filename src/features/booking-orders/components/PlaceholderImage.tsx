import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type PlaceholderImageProps = {
  image?: any;
  label?: string;
  variant?: "person" | "garment";
  size?: "sm" | "md" | "lg";
  tone?: "teal" | "coral" | "gold" | "blue";
};

const toneClasses = {
  teal: "bg-primary-50",
  coral: "bg-[#FFF0EC]",
  gold: "bg-[#FFF6DA]",
  blue: "bg-[#EAF3FF]",
};

const iconColors = {
  teal: "#14919B",
  coral: "#F05A57",
  gold: "#D79A00",
  blue: "#3B77C9",
};

const sizeClasses = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-[118px] w-[92px]",
};

const generatedAssets = {
  person: require("@/assets/illustrations/generated/action-icons.png"),
  garment: require("@/assets/illustrations/generated/garment-set.png"),
};

export function PlaceholderImage({
  image,
  label,
  variant = "person",
  size = "md",
  tone = "teal",
}: PlaceholderImageProps) {
  const hasCustomImage = Boolean(
    image &&
      (typeof image === "string"
        ? image.trim().length > 0
        : typeof image === "object" && image.uri
        ? String(image.uri).trim().length > 0
        : true)
  );

  const imageSource =
    typeof image === "string" ? { uri: image } : image || generatedAssets[variant];

  return (
    <View
      className={`${sizeClasses[size]} items-center justify-center overflow-hidden rounded-md ${toneClasses[tone]}`}
    >
      <Image
        source={imageSource}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
      />
      {!hasCustomImage && size === "sm" ? (
        <Ionicons
          name={variant === "person" ? "person" : "shirt-outline"}
          size={14}
          color={iconColors[tone]}
        />
      ) : null}
      {label ? (
        <Text className="absolute bottom-1 rounded bg-white/80 px-1 text-center text-[9px] font-medium text-brand-gray">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
