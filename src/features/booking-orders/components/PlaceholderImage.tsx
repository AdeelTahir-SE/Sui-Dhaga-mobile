import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PlaceholderImageProps = {
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

export function PlaceholderImage({
  label,
  variant = "person",
  size = "md",
  tone = "teal",
}: PlaceholderImageProps) {
  return (
    <View
      className={`${sizeClasses[size]} items-center justify-center overflow-hidden rounded-xl ${toneClasses[tone]}`}
    >
      <Ionicons
        name={variant === "person" ? "person" : "shirt-outline"}
        size={size === "lg" ? 38 : 26}
        color={iconColors[tone]}
      />
      {label ? (
        <Text className="mt-1 px-1 text-center text-[9px] font-medium text-brand-gray">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
