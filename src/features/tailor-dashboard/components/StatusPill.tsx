import { Text, View } from "react-native";

type StatusTone = "gold" | "teal" | "blue" | "green" | "red" | "gray";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

const toneClasses: Record<StatusTone, [string, string]> = {
  gold: ["bg-[#FFF6DA]", "text-[#C08300]"],
  teal: ["bg-primary-50", "text-primary"],
  blue: ["bg-[#EAF3FF]", "text-[#2D6EBB]"],
  green: ["bg-[#EAF8EE]", "text-[#2B9A52]"],
  red: ["bg-[#FFF0F0]", "text-[#F05A57]"],
  gray: ["bg-brand-surface", "text-brand-gray"],
};

export function StatusPill({ label, tone = "teal" }: StatusPillProps) {
  const [background, text] = toneClasses[tone];

  return (
    <View className={`rounded-md px-2 py-1 ${background}`}>
      <Text className={`text-[10px] font-medium ${text}`}>{label}</Text>
    </View>
  );
}
