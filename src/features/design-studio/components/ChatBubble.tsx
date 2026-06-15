import React from "react";
import { Text, View } from "react-native";

type ChatBubbleProps = {
  children: React.ReactNode;
  outgoing?: boolean;
};

export function ChatBubble({ children, outgoing }: ChatBubbleProps) {
  return (
    <View
      className={`mb-3 max-w-[82%] rounded-xl px-4 py-3 ${
        outgoing ? "self-end bg-primary-50" : "self-start bg-brand-surface"
      }`}
    >
      <Text className="text-[12px] leading-5 text-brand-dark">{children}</Text>
    </View>
  );
}
