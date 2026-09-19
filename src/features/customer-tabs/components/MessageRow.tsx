import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type MessageRowProps = {
  name: string;
  message: string;
  time: string;
  image?: ImageSource | string;
  avatarUrl?: string;
  avatar_url?: string;
  unread?: string | number;
  onPress?: () => void;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  isOnline?: boolean;
  isOutgoing?: boolean;
  isRead?: boolean;
};

const toneBg: Record<string, string> = {
  teal: "bg-[#E0F7F7] text-[#0D7377]",
  coral: "bg-[#FDF2F2] text-[#E85D5D]",
  gold: "bg-[#FFF9EB] text-[#D97706]",
  blue: "bg-[#EFF6FF] text-[#2563EB]",
  mint: "bg-[#ECFDF5] text-[#059669]",
  cream: "bg-[#FDF8F0] text-[#B45309]",
};

export function MessageRow({
  name,
  message,
  time,
  image,
  avatarUrl,
  avatar_url,
  unread,
  onPress,
  tone = "teal",
  isOnline = false,
  isOutgoing = false,
  isRead = false,
}: MessageRowProps) {
  const [imageError, setImageError] = React.useState(false);
  const rawSrc = avatar_url || avatarUrl || image;
  const imgSrc = !imageError && rawSrc ? rawSrc : undefined;
  const initial = (name || "U").charAt(0).toUpperCase();
  const unreadCount = typeof unread === "number" ? unread : unread ? parseInt(unread, 10) || 0 : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center border-b border-brand-border py-3.5 px-0.5"
    >
      {/* Avatar / Initial with Realtime Presence Dot */}
      <View style={{ position: "relative", marginRight: 14 }}>
        <View
          style={{ width: 44, height: 44, borderRadius: 22 }}
          className="overflow-hidden items-center justify-center border border-brand-border bg-brand-surface"
        >
          {imgSrc ? (
            <Image
              source={typeof imgSrc === "string" ? { uri: imgSrc } : imgSrc}
              style={{ width: 44, height: 44, borderRadius: 22 }}
              contentFit="cover"
              transition={200}
              onError={() => setImageError(true)}
            />
          ) : (
            <View
              style={{ width: 44, height: 44, borderRadius: 22 }}
              className={`w-full h-full items-center justify-center ${
                toneBg[tone] || "bg-[#E0F7F7]"
              }`}
            >
              <Text className="text-[16px] font-black text-primary-dark">
                {initial}
              </Text>
            </View>
          )}
        </View>

        {/* Realtime Online (Green) or Offline (Grey) Presence Dot */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: isOnline ? "#22C55E" : "#94A3B8",
            borderWidth: 2,
            borderColor: "#FFFFFF",
          }}
        />
      </View>

      {/* Message Info */}
      <View className="flex-1 pr-2">
        <Text
          numberOfLines={1}
          className="text-[15px] font-bold text-brand-dark"
        >
          {name}
        </Text>
        <View className="flex-row items-center mt-1">
          {isOutgoing && (
            <Ionicons
              name={isRead ? "checkmark-done" : "checkmark"}
              size={13}
              color={isRead ? "#0284C7" : "#94A3B8"}
              style={{ marginRight: 3 }}
            />
          )}
          {message && (message.toLowerCase().includes("voice message") || message.toLowerCase().includes("voice_message")) ? (
            <View className="flex-row items-center mr-1">
              <Ionicons name="mic" size={13} color="#14919B" />
              <Text
                numberOfLines={1}
                className={`ml-1 text-[13px] ${
                  unreadCount > 0 ? "font-bold text-primary" : "font-medium text-primary"
                }`}
              >
                Voice message
              </Text>
            </View>
          ) : (
            <Text
              numberOfLines={1}
              className={`flex-1 text-[13px] ${
                unreadCount > 0 ? "font-bold text-brand-dark" : "font-medium text-brand-gray"
              }`}
            >
              {message || "No messages yet"}
            </Text>
          )}
        </View>
      </View>

      {/* Time & Unread Badge */}
      <View className="items-end justify-center">
        <Text className="text-[11px] text-brand-gray font-medium">
          {time}
        </Text>
        {unreadCount > 0 ? (
          <View className="mt-1.5 min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-primary">
            <Text className="text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
