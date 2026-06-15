import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PlaceholderTone = "teal" | "coral" | "gold" | "blue" | "cream";

type TailorPlaceholderProps = {
  label?: string;
  variant?: "person" | "garment" | "map";
  size?: "xs" | "sm" | "md" | "lg" | "wide";
  tone?: PlaceholderTone;
};

const toneClasses: Record<PlaceholderTone, string> = {
  teal: "bg-primary-50",
  coral: "bg-[#FFF0EC]",
  gold: "bg-[#FFF6DA]",
  blue: "bg-[#EAF3FF]",
  cream: "bg-[#F8F4EA]",
};

const iconColors: Record<PlaceholderTone, string> = {
  teal: "#14919B",
  coral: "#F05A57",
  gold: "#D79A00",
  blue: "#3B77C9",
  cream: "#B18A4A",
};

const sizeClasses = {
  xs: "h-10 w-10",
  sm: "h-16 w-16",
  md: "h-20 w-20",
  lg: "h-[156px] w-full",
  wide: "h-[220px] w-full",
};

export function TailorPlaceholder({
  label,
  variant = "person",
  size = "md",
  tone = "teal",
}: TailorPlaceholderProps) {
  const icon =
    variant === "map"
      ? "map-outline"
      : variant === "garment"
        ? "shirt-outline"
        : "person";

  return (
    <View
      className={`${sizeClasses[size]} items-center justify-center overflow-hidden rounded-xl ${toneClasses[tone]}`}
    >
      <Ionicons
        name={icon}
        size={size === "xs" ? 19 : size === "wide" ? 46 : 28}
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
