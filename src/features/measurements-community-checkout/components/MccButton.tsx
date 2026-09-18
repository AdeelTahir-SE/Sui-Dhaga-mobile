import { Text, TouchableOpacity, View } from "react-native";
import { ButtonTexture, type ButtonTextureVariant } from "../../../components/ui/ButtonTexture";

type MccButtonProps = {
  title: string;
  variant?: "primary" | "outline" | "danger" | "gold";
  onPress?: () => void;
  showTexture?: boolean;
};

export function MccButton({
  title,
  variant = "primary",
  onPress,
  showTexture = true,
}: MccButtonProps) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const hasTexture = showTexture && (isPrimary || isDanger);
  const textureVariant: ButtonTextureVariant = isPrimary
    ? "greenish"
    : isDanger
    ? "reddish"
    : "none";

  const styles = {
    primary: "bg-[#00949D] border-[#00949D] shadow-sm",
    outline: "bg-white border-[#00949D]",
    danger: "bg-[#F05A57] border-[#F05A57] shadow-sm",
    gold: "bg-[#F6B52E] border-[#F6B52E] shadow-sm",
  }[variant];
  const textStyle = variant === "outline" ? "text-[#00949D]" : "text-white";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onPress}
      className={`relative h-[52px] items-center justify-center rounded-xl border overflow-hidden ${styles}`}
    >
      {hasTexture && (
        <ButtonTexture variant={textureVariant} borderRadius={12} />
      )}
      <View className="z-10 items-center justify-center px-4">
        <Text
          className={`text-[14px] font-semibold ${textStyle}`}
          style={{
            textShadowColor: variant !== "outline" ? "rgba(0,0,0,0.22)" : "transparent",
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

