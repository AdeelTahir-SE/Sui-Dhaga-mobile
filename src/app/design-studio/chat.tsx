import React from "react";
import { View } from "react-native";
import { AiNotSupportedModal } from "@/components/ui/AiNotSupportedModal";

export default function AiChatPage() {
  return (
    <View className="flex-1 bg-white">
      <AiNotSupportedModal visible={true} />
    </View>
  );
}
