import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";

const tealEdge = require("@/assets/illustrations/auth-flow/edges/edge-teal.png");
const coralEdge = require("@/assets/illustrations/auth-flow/edges/edge-coral.png");
const goldEdge = require("@/assets/illustrations/auth-flow/edges/edge-gold.png");

type AuthEdgeDecorationsProps = {
  variant?: "teal" | "coral" | "gold";
};

export function AuthEdgeDecorations({
  variant = "teal",
}: AuthEdgeDecorationsProps) {
  const source =
    variant === "coral" ? coralEdge : variant === "gold" ? goldEdge : tealEdge;
  const isRight = variant === "coral";

  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <Image
        source={source}
        contentFit="cover"
        className={`absolute bottom-0 h-[190px] w-[190px] ${
          isRight ? "right-0" : "left-0"
        }`}
      />
      <View
        className={`absolute h-2 w-2 rounded-full ${
          variant === "gold" ? "bg-primary" : "bg-[#F05A57]"
        } ${isRight ? "right-20 bottom-36" : "left-20 bottom-36"}`}
      />
      <View
        className={`absolute h-1.5 w-1.5 rounded-full ${
          variant === "teal" ? "bg-[#F6B52E]" : "bg-primary"
        } ${isRight ? "right-32 bottom-44" : "left-32 bottom-44"}`}
      />
    </View>
  );
}
