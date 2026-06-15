import { Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type Tone = "teal" | "coral" | "gold" | "blue" | "mint" | "cream";

type TailorDashPlaceholderProps = {
  label?: string;
  variant?: "person" | "garment" | "machine" | "money" | "chart";
  size?: "xs" | "sm" | "md" | "hero" | "chart";
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
  md: "h-20 w-20",
  hero: "h-[130px] w-[150px]",
  chart: "h-[170px] w-full",
};

const generatedAssets = {
  person: require("@/assets/illustrations/generated/action-icons.png"),
  garment: require("@/assets/illustrations/generated/garment-set.png"),
  machine: require("@/assets/illustrations/generated/tailoring-hero.png"),
  money: require("@/assets/illustrations/generated/tailor-dashboard-set.png"),
  chart: require("@/assets/illustrations/generated/tailor-dashboard-set.png"),
};

export function TailorDashPlaceholder({
  label,
  variant = "garment",
  size = "md",
  tone = "teal",
}: TailorDashPlaceholderProps) {
  const icon =
    variant === "person"
      ? "person"
      : variant === "machine"
        ? "construct-outline"
        : variant === "money"
          ? "cash-outline"
          : variant === "chart"
            ? "trending-up-outline"
            : "shirt-outline";

  return (
    <View
      className={`${sizeClasses[size]} items-center justify-center overflow-hidden rounded-xl ${toneClasses[tone]}`}
    >
      <Image
        source={generatedAssets[variant]}
        contentFit="cover"
        className="absolute inset-0 h-full w-full"
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
