import React from "react";
import { useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";

type AuthEdgeDecorationsProps = {
  variant?: "teal" | "coral" | "gold";
};

const edgeSources = {
  teal: require("@/assets/illustrations/auth-flow/edges/edge-teal.png"),
  coral: require("@/assets/illustrations/auth-flow/edges/edge-coral.png"),
  gold: require("@/assets/illustrations/auth-flow/edges/edge-gold.png"),
};

export function AuthEdgeDecorations({
  variant = "teal",
}: AuthEdgeDecorationsProps) {
  const { width } = useWindowDimensions();
  const alignRight = variant === "coral";
  const edgeSize = Math.min(Math.max(width * 0.78, 285), 430);

  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <Image
        source={edgeSources[variant]}
        contentFit="contain"
        style={{
          position: "absolute",
          bottom: 0,
          width: edgeSize,
          height: edgeSize,
          ...(alignRight ? { right: 0 } : { left: 0 }),
        }}
      />
    </View>
  );
}
