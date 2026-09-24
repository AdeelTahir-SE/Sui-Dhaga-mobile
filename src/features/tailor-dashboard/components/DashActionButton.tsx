import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";

type DashActionButtonProps = {
  title: string;
  variant?: "primary" | "outline" | "danger" | "black";
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  showTexture?: boolean;
};

export function DashActionButton({
  title,
  variant = "primary",
  onPress,
  disabled,
  loading,
  showTexture = true,
}: DashActionButtonProps) {
  const buttonClass =
    variant === "primary"
      ? "bg-primary border-primary shadow-xs active:bg-primary-dark"
      : variant === "black"
        ? "bg-[#1A1D1F] border-[#1A1D1F] shadow-xs active:bg-black"
        : variant === "danger"
          ? "bg-white border-brand-border active:bg-red-50"
          : "bg-white border-brand-border active:bg-gray-50";

  const textClass =
    variant === "primary" || variant === "black"
      ? "text-white"
      : variant === "danger"
        ? "text-[#F05A57]"
        : "text-primary";

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={`relative h-[42px] flex-1 items-center justify-center rounded-md border overflow-hidden ${buttonClass} ${isDisabled ? "opacity-60" : ""}`}
    >
      {showTexture && variant === "primary" && (
        <ButtonTexture variant="greenish" borderRadius={6} />
      )}
      <View className="z-10 flex-row items-center justify-center px-2">
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" || variant === "black" ? "#FFFFFF" : "#14919B"}
            style={{ marginRight: 6 }}
          />
        ) : null}
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

