import { Text, TouchableOpacity, View } from "react-native";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

type DashActionButtonProps = {
  title: string;
  variant?: "primary" | "outline" | "danger";
  onPress?: () => void;
  disabled?: boolean;
  showTexture?: boolean;
};

export function DashActionButton({
  title,
  variant = "primary",
  onPress,
  disabled,
  showTexture = true,
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
      className={`relative h-[42px] flex-1 items-center justify-center rounded-md border overflow-hidden ${buttonClass} ${disabled ? "opacity-50" : ""}`}
    >
      {showTexture && variant === "primary" && (
        <ButtonTexture variant="greenish" borderRadius={6} />
      )}
      <View className="z-10 items-center justify-center px-2">
        <Text
          className={`text-[13px] font-bold ${textClass}`}
          style={{
            textShadowColor: variant === "primary" ? "rgba(0,0,0,0.2)" : "transparent",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

