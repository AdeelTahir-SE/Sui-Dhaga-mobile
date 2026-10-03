import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ButtonTexture } from "./ButtonTexture";

interface AiNotSupportedModalProps {
  visible: boolean;
}

/**
 * Full-screen modal shown on AI feature screens (AI Studio, AI Chat, AI Designer)
 * informing the user that this version of the app doesn't support AI features.
 */
export function AiNotSupportedModal({ visible }: AiNotSupportedModalProps) {
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home" as never);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleGoBack}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
      >
        <View
          className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl items-center border border-brand-border"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* Visual Header / Brand Icon */}
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-light/60 border-2 border-primary/20">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-sm">
              <Ionicons name="sparkles" size={26} color="#FFFFFF" />
            </View>
          </View>

          {/* Badge */}
          <View className="mb-2.5 rounded-full bg-primary-50 px-3 py-1 border border-primary/20">
            <Text className="text-[11px] font-bold tracking-wider text-primary-dark uppercase">
              AI Features
            </Text>
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-xl font-extrabold text-brand-dark">
            AI Not Available
          </Text>

          {/* Description */}
          <Text className="mb-6 text-center text-[13.5px] leading-5 text-brand-gray px-1 font-medium">
            This version of Sui Dhaga does not support AI features. Please
            update to the latest version to access AI Studio, AI Assistant, and
            AI Designer.
          </Text>

          {/* Back Button */}
          <TouchableOpacity
            onPress={handleGoBack}
            activeOpacity={0.85}
            className="relative h-[52px] w-full flex-row items-center justify-center overflow-hidden rounded-xl bg-primary shadow-sm"
          >
            <ButtonTexture variant="greenish" borderRadius={12} opacity={1} />
            <View className="z-10 flex-row items-center justify-center px-4">
              <Ionicons
                name="arrow-back"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-bold tracking-wide text-white">
                Go Back
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
