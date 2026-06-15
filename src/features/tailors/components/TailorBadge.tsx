import { Text, View } from "react-native";

type TailorBadgeProps = {
  label: string;
  tone?: "teal" | "gray" | "gold";
};

const badgeStyles = {
  teal: ["bg-primary-50", "text-primary"],
  gray: ["bg-brand-surface", "text-brand-dark"],
  gold: ["bg-[#FFF6DA]", "text-[#C08300]"],
};

export function TailorBadge({ label, tone = "teal" }: TailorBadgeProps) {
  const [background, text] = badgeStyles[tone];

  return (
    <View className={`rounded-md px-2 py-1 ${background}`}>
      <Text className={`text-[10px] font-medium ${text}`}>{label}</Text>
    </View>
  );
}
