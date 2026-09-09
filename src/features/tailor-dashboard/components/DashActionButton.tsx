import { Text, TouchableOpacity } from "react-native";

type DashActionButtonProps = {
  title: string;
  variant?: "primary" | "outline" | "danger";
  onPress?: () => void;
  disabled?: boolean;
};

export function DashActionButton({
  title,
  variant = "primary",
  onPress,
  disabled,
}: DashActionButtonProps) {
  const buttonClass =
    variant === "primary"
      ? "bg-primary border-primary shadow-xs active:bg-primary-dark"
      : variant === "danger"
        ? "bg-white border-brand-border active:bg-red-50"
        : "bg-white border-brand-border active:bg-gray-50";
  const textClass =
    variant === "primary"
      ? "text-white"
      : variant === "danger"
        ? "text-[#F05A57]"
        : "text-primary";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={`h-[42px] flex-1 items-center justify-center rounded-md border ${buttonClass} ${disabled ? "opacity-50" : ""}`}
    >
      <Text className={`text-[13px] font-bold ${textClass}`}>{title}</Text>
    </TouchableOpacity>
  );
}
