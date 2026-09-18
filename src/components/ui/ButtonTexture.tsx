import React from "react";
import { Image, View, StyleSheet } from "react-native";

export const TEXTURE_ASSETS = {
  greenish: require("../../../assets/texture/button-greenish-texture.png"),
  reddish: require("../../../assets/texture/button-reddish-texture.png"),
} as const;

export type ButtonTextureVariant = "greenish" | "reddish" | "none";

type ButtonTextureProps = {
  variant?: ButtonTextureVariant;
  opacity?: number;
  borderRadius?: number;
};

/**
 * Renders the pure textile pattern from assets/texture/ (greenish / reddish).
 */
export function ButtonTexture({
  variant = "greenish",
  opacity = 1,
  borderRadius = 12,
}: ButtonTextureProps) {
  if (variant === "none") return null;

  const source = TEXTURE_ASSETS[variant];

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius,
          overflow: "hidden",
          backgroundColor: variant === "greenish" ? "#00949D" : "#F05A57",
        },
      ]}
    >
      {/* Pure textile pattern image from assets/texture/ */}
      <Image
        source={source}
        resizeMode="cover"
        style={[
          StyleSheet.absoluteFill,
          {
            width: "100%",
            height: "100%",
            opacity,
          },
        ]}
      />
    </View>
  );
}

