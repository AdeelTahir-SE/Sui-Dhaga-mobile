import { Text, View } from "react-native";

type StatusTone = "teal" | "blue" | "gold" | "green" | "red" | "gray";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

const stylesByTone: Record<StatusTone, string> = {
  teal: "bg-primary-50 text-primary",
  blue: "bg-[#EAF3FF] text-[#2D6EBB]",
  gold: "bg-[#FFF6DA] text-[#C08300]",
  green: "bg-[#EAF8EE] text-[#2B9A52]",
  red: "bg-[#FFF0F0] text-[#F05A57]",
  gray: "bg-brand-surface text-brand-gray",
};

export function StatusPill({ label, tone = "teal" }: StatusPillProps) {
  const toneClass = stylesByTone[tone];

  return (
    <View className={`rounded-md px-2 py-1 ${toneClass.split(" ")[0]}`}>
      <Text className={`text-[10px] font-medium ${toneClass.split(" ")[1]}`}>
        {label}
      </Text>
    </View>
  );
}
