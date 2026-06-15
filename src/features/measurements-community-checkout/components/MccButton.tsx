import { Text, TouchableOpacity } from "react-native";

type MccButtonProps = {
  title: string;
  variant?: "primary" | "outline" | "danger" | "gold";
  onPress?: () => void;
};

export function MccButton({
  title,
  variant = "primary",
  onPress,
}: MccButtonProps) {
  const styles = {
    primary: "bg-primary border-primary",
    outline: "bg-white border-primary",
    danger: "bg-[#F05A57] border-[#F05A57]",
    gold: "bg-[#F6B52E] border-[#F6B52E]",
  }[variant];
  const textStyle = variant === "outline" ? "text-primary" : "text-white";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      className={`h-[52px] items-center justify-center rounded-xl border ${styles}`}
    >
      <Text className={`text-[14px] font-semibold ${textStyle}`}>{title}</Text>
    </TouchableOpacity>
  );
}
