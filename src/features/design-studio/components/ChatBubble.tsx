import React from "react";
import { Text, View } from "react-native";

type ChatBubbleProps = {
  children: React.ReactNode;
  outgoing?: boolean;
};

export function ChatBubble({ children, outgoing }: ChatBubbleProps) {
  return (
    <View
      style={
        outgoing
          ? {
              alignSelf: "flex-end",
              backgroundColor: "#14919B",
              borderRadius: 16,
              borderTopRightRadius: 3,
              paddingHorizontal: 14,
              paddingVertical: 10,
              maxWidth: "82%",
              marginBottom: 10,
              shadowColor: "#14919B",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1,
            }
          : {
              alignSelf: "flex-start",
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              borderTopLeftRadius: 3,
              borderWidth: 1,
              borderColor: "#EAE5DD",
              paddingHorizontal: 14,
              paddingVertical: 10,
              maxWidth: "82%",
              marginBottom: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 2,
              elevation: 1,
            }
      }
    >
      <Text
        style={{
          fontSize: 13,
          lineHeight: 19,
          fontWeight: "500",
          color: outgoing ? "#FFFFFF" : "#1A1D1F",
        }}
      >
        {children}
      </Text>
    </View>
  );
}

