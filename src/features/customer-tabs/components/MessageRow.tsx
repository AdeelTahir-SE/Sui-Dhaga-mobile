import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Image, type ImageSource } from "expo-image";

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
      {/* Avatar / Initial */}
      <View
        style={{ width: 44, height: 44, borderRadius: 22 }}
        className="overflow-hidden mr-3.5 items-center justify-center border border-brand-border bg-brand-surface"
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

      {/* Message Info */}
      <View className="ml-3.5 flex-1 pr-2">
        <Text
          numberOfLines={1}
          className="text-[15px] font-bold text-brand-dark"
        >
          {name}
        </Text>
        <Text
          numberOfLines={1}
          className={`mt-1 text-[13px] ${
            unreadCount > 0 ? "font-bold text-brand-dark" : "font-medium text-brand-gray"
          }`}
        >
          {message || "No messages yet"}
        </Text>
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
