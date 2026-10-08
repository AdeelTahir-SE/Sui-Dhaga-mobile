import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAlertStore, ThemedAlertButton, AlertType } from "../../stores/alert.store";
import { ButtonTexture } from "./ButtonTexture";

/**
 * Visual styling and metadata configuration for each alert type
 */
function getAlertConfig(type: AlertType, badgeOverride?: string, iconOverride?: string) {
  switch (type) {
    case "success":
      return {
        badge: badgeOverride || "SUCCESS",
        badgeBg: "bg-primary-50 border-primary/20",
        badgeText: "text-primary-dark",
        outerRing: "bg-teal-50 border-2 border-primary/25",
        innerCircle: "bg-primary",
        iconName: (iconOverride as any) || "checkmark",
        iconColor: "#FFFFFF",
        textureVariant: "greenish" as const,
      };
    case "block":
      return {
        badge: badgeOverride || "BLOCKED",
        badgeBg: "bg-rose-100 border-rose-200",
        badgeText: "text-rose-800",
        outerRing: "bg-rose-50 border-2 border-rose-200",
        innerCircle: "bg-rose-600",
        iconName: (iconOverride as any) || "ban-outline",
        iconColor: "#FFFFFF",
        textureVariant: "reddish" as const,
      };
    case "warning":
      return {
        badge: badgeOverride || "CONFIRMATION",
        badgeBg: "bg-amber-100 border-amber-300",
        badgeText: "text-amber-800",
        outerRing: "bg-amber-50 border-2 border-amber-200",
        innerCircle: "bg-amber-600",
        iconName: (iconOverride as any) || "alert-outline",
        iconColor: "#FFFFFF",
        textureVariant: "reddish" as const,
      };
    case "error":
      return {
        badge: badgeOverride || "NOTICE",
        badgeBg: "bg-red-100 border-red-200",
        badgeText: "text-red-800",
        outerRing: "bg-red-50 border-2 border-red-200",
        innerCircle: "bg-red-600",
        iconName: (iconOverride as any) || "close-circle-outline",
        iconColor: "#FFFFFF",
        textureVariant: "reddish" as const,
      };
    case "info":
    default:
      return {
        badge: badgeOverride || "NOTICE",
        badgeBg: "bg-primary-50 border-primary/20",
        badgeText: "text-primary-dark",
        outerRing: "bg-primary-light/60 border-2 border-primary/20",
        innerCircle: "bg-primary",
        iconName: (iconOverride as any) || "information-outline",
        iconColor: "#FFFFFF",
        textureVariant: "greenish" as const,
      };
  }
}

export function ThemedAlertModal() {
  const { visible, title, message, buttons, options, type, dismissAlert } = useAlertStore();

  if (!visible) return null;

  const isCancelable = options?.cancelable ?? true;
  const config = getAlertConfig(type, options?.badge, options?.icon);

  const handleDismiss = () => {
    if (!isCancelable) return;
    dismissAlert();
    if (options?.onDismiss) {
      options.onDismiss();
    }
  };

  const handleButtonPress = (btn: ThemedAlertButton) => {
    dismissAlert();
    if (btn.onPress) {
      // Execute callback asynchronously to allow modal animation to trigger cleanly
      setTimeout(() => {
        btn.onPress?.();
      }, 50);
    }
  };

  // Check if we have standard 2-button layout (e.g. Cancel + Confirm/Destructive)
  const isTwoButtons = buttons.length === 2;
  const isSingleButton = buttons.length <= 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)" }}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              className="w-full max-w-[330px] rounded-3xl bg-white p-6 shadow-2xl items-center border border-brand-border"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 14,
              }}
            >
              {/* Visual Header / Brand Icon */}
              <View
                className={`mb-3.5 h-20 w-20 items-center justify-center rounded-full ${config.outerRing}`}
              >
                <View
                  className={`h-14 w-14 items-center justify-center rounded-full shadow-sm ${config.innerCircle}`}
                >
                  <Ionicons
                    name={config.iconName}
                    size={28}
                    color={config.iconColor}
                  />
                </View>
              </View>

              {/* Tag / Badge */}
              <View
                className={`mb-2 rounded-full px-3 py-1 border ${config.badgeBg}`}
              >
                <Text
                  className={`text-[11px] font-bold tracking-wider uppercase ${config.badgeText}`}
                >
                  {config.badge}
                </Text>
              </View>

              {/* Title */}
              <Text className="mb-1.5 text-center text-[19px] font-extrabold text-brand-dark leading-6">
                {title}
              </Text>

              {/* Message */}
              {!!message && (
                <Text className="mb-5 text-center text-[13.5px] leading-5 text-brand-gray px-1 font-medium">
                  {message}
                </Text>
              )}

              {/* Action Buttons */}
              <View className="w-full mt-1">
                {isSingleButton ? (
                  // Single Button
                  (() => {
                    const btn = buttons[0] || { text: "OK", style: "default" };
                    const isDestructive = btn.style === "destructive" || type === "block";
                    return (
                      <TouchableOpacity
                        key={0}
                        onPress={() => handleButtonPress(btn)}
                        activeOpacity={0.85}
                        className={`relative h-[48px] w-full flex-row items-center justify-center overflow-hidden rounded-xl shadow-sm ${
                          isDestructive ? "bg-rose-600" : "bg-primary"
                        }`}
                      >
                        <ButtonTexture
                          variant={isDestructive ? "reddish" : "greenish"}
                          borderRadius={12}
                          opacity={1}
                        />
                        <View className="z-10 flex-row items-center justify-center px-4">
                          <Text className="text-[15px] font-bold tracking-wide text-white">
                            {btn.text || "OK"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })()
                ) : isTwoButtons ? (
                  // Two Buttons Side-by-Side
                  <View className="flex-row items-center justify-between gap-2.5">
                    {buttons.map((btn, idx) => {
                      const isCancel = btn.style === "cancel";
                      const isDestructive =
                        btn.style === "destructive" || (type === "block" && !isCancel);

                      if (isCancel) {
                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => handleButtonPress(btn)}
                            activeOpacity={0.75}
                            className="flex-1 h-[48px] items-center justify-center rounded-xl bg-slate-100 border border-slate-200"
                          >
                            <Text className="text-[14px] font-bold text-slate-700">
                              {btn.text || "Cancel"}
                            </Text>
                          </TouchableOpacity>
                        );
                      }

                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handleButtonPress(btn)}
                          activeOpacity={0.85}
                          className={`relative flex-1 h-[48px] items-center justify-center overflow-hidden rounded-xl shadow-sm ${
                            isDestructive ? "bg-rose-600" : "bg-primary"
                          }`}
                        >
                          <ButtonTexture
                            variant={isDestructive ? "reddish" : "greenish"}
                            borderRadius={12}
                            opacity={1}
                          />
                          <View className="z-10 flex-row items-center justify-center px-2">
                            <Text
                              numberOfLines={1}
                              className="text-[14px] font-bold tracking-wide text-white"
                            >
                              {btn.text || "OK"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  // 3+ Buttons Stacked
                  <View className="gap-2">
                    {buttons.map((btn, idx) => {
                      const isCancel = btn.style === "cancel";
                      const isDestructive = btn.style === "destructive";

                      if (isCancel) {
                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => handleButtonPress(btn)}
                            activeOpacity={0.75}
                            className="h-[46px] w-full items-center justify-center rounded-xl bg-slate-100 border border-slate-200"
                          >
                            <Text className="text-[14px] font-bold text-slate-700">
                              {btn.text || "Cancel"}
                            </Text>
                          </TouchableOpacity>
                        );
                      }

                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handleButtonPress(btn)}
                          activeOpacity={0.85}
                          className={`relative h-[46px] w-full items-center justify-center overflow-hidden rounded-xl shadow-sm ${
                            isDestructive ? "bg-rose-600" : "bg-primary"
                          }`}
                        >
                          <ButtonTexture
                            variant={isDestructive ? "reddish" : "greenish"}
                            borderRadius={12}
                            opacity={1}
                          />
                          <View className="z-10 flex-row items-center justify-center px-4">
                            <Text className="text-[14px] font-bold tracking-wide text-white">
                              {btn.text || "OK"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
