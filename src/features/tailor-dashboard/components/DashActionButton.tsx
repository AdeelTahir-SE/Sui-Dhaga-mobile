import { Text, TouchableOpacity } from "react-native";

type DashActionButtonProps = {
  title: string;
  variant?: "primary" | "outline" | "danger";
};

export function DashActionButton({
  title,
  variant = "primary",
}: DashActionButtonProps) {
  const buttonClass =
    variant === "primary"
      ? "bg-primary border-primary"
      : variant === "danger"
        ? "bg-white border-brand-border"
        : "bg-white border-brand-border";
  const textClass =
    variant === "primary"
      ? "text-white"
      : variant === "danger"
        ? "text-[#F05A57]"
        : "text-primary";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      className={`h-[42px] flex-1 items-center justify-center rounded-lg border ${buttonClass}`}
    >
      <Text className={`text-[12px] font-semibold ${textClass}`}>{title}</Text>
    </TouchableOpacity>
  );
}
