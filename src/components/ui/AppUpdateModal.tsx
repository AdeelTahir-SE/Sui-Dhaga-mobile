import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ButtonTexture } from "./ButtonTexture";
import type { UpdateCheckResult } from "../../services/app-update.service";

interface AppUpdateModalProps {
  visible: boolean;
  updateInfo: UpdateCheckResult | null;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function AppUpdateModal({
  visible,
  updateInfo,
  onUpdate,
  onDismiss,
}: AppUpdateModalProps) {
  if (!updateInfo) return null;

  const isMandatory = updateInfo.isMandatory;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Only allow Android hardware back button to dismiss if optional
        if (!isMandatory) {
          onDismiss();
        }
      }}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.70)" }}
      >
        <View
          className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl items-center border border-brand-border"
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
            className={`mb-4 h-20 w-20 items-center justify-center rounded-full ${
              isMandatory
                ? "bg-amber-50 border-2 border-amber-200"
                : "bg-primary-light/60 border-2 border-primary/20"
            }`}
          >
            <View
              className={`h-14 w-14 items-center justify-center rounded-full shadow-sm ${
                isMandatory ? "bg-amber-600" : "bg-primary"
              }`}
            >
              <Ionicons
                name={isMandatory ? "warning-outline" : "cloud-download-outline"}
                size={28}
                color="#FFFFFF"
              />
            </View>
          </View>

          {/* Badge */}
          <View
            className={`mb-2.5 rounded-full px-3.5 py-1 border ${
              isMandatory
                ? "bg-amber-100 border-amber-300"
                : "bg-primary-50 border-primary/20"
            }`}
          >
            <Text
              className={`text-[11px] font-bold tracking-wider uppercase ${
                isMandatory ? "text-amber-800" : "text-primary-dark"
              }`}
            >
              {isMandatory ? "Mandatory Update" : "Update Available"}
            </Text>
          </View>

          {/* Title */}
          <Text className="mb-1 text-center text-xl font-extrabold text-brand-dark">
            {isMandatory ? "Update Required" : "New Version Available"}
          </Text>

          {/* Version Comparison */}
          <View className="mb-4 flex-row items-center justify-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <Text className="text-[12px] font-medium text-brand-gray">
              v{updateInfo.currentVersion}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={12}
              color="#6F767E"
              style={{ marginHorizontal: 6 }}
            />
            <Text className="text-[12px] font-bold text-primary-dark">
              v{updateInfo.latestVersion}
            </Text>
          </View>

          {/* Description */}
          <Text className="mb-3 text-center text-[13.5px] leading-5 text-brand-gray px-1 font-medium">
            {isMandatory
              ? "To continue using Sui Dhaga with all latest services and security fixes, please update now."
              : "A new version of Sui Dhaga is ready. Update now to enjoy the latest features and enhancements."}
          </Text>

          {/* Release Notes */}
          {updateInfo.releaseNotes ? (
            <View className="w-full mb-5 max-h-36 rounded-2xl bg-gray-50 border border-gray-100 p-3.5">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                What's New:
              </Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <Text className="text-[12.5px] leading-5 text-gray-700">
                  {updateInfo.releaseNotes}
                </Text>
              </ScrollView>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View className="w-full gap-2.5">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onUpdate}
              className="relative w-full overflow-hidden rounded-2xl py-3.5 items-center justify-center shadow-sm"
              style={{ minHeight: 48 }}
            >
              <ButtonTexture variant={isMandatory ? "reddish" : "greenish"} borderRadius={16} />
              <View className="flex-row items-center justify-center">
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                <Text className="ml-2 text-[15px] font-bold text-white tracking-wide">
                  Update Now
                </Text>
              </View>
            </TouchableOpacity>

            {!isMandatory ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onDismiss}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 items-center justify-center"
              >
                <Text className="text-[14px] font-semibold text-brand-gray">
                  Maybe Later
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
