import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MessageRow } from "../components/MessageRow";
import { useConversations } from "../hooks/useConversations";
import { useAuthStore } from "../../../stores/auth.store";

function formatMessageTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function getOtherParticipant(conv: any, currentUserId?: string) {
  if (!conv) return { id: "", name: "Tailor", avatarUrl: null, role: "" };

  const curId = currentUserId ? String(currentUserId).toLowerCase() : "";

  // 1. If backend gave participant object
  if (conv.participant) {
    const pId = String(
      conv.participant.id ||
      conv.participant._id ||
      conv.participant.userId ||
      ""
    ).toLowerCase();

    if (!curId || pId !== curId) {
      return {
        id: conv.participant.id || conv.participant._id || conv.participant.userId || "",
        name:
          conv.participant.shopName ||
          conv.participant.shop_name ||
          conv.participant.fullName ||
          conv.participant.full_name ||
          conv.participant.name ||
          "User",
        avatarUrl:
          conv.participant.avatarUrl ||
          conv.participant.avatar_url ||
          conv.participant.avatar ||
          null,
        role: conv.participant.role || "",
      };
    }
  }

  // 2. If backend gave user_1 and user_2
  const u1 = conv.user_1 || conv.user1 || conv.sender;
  const u2 = conv.user_2 || conv.user2 || conv.recipient || conv.receiver;
  if (u1 && u2) {
    const u1Id = String(u1.id || u1._id || "").toLowerCase();
    const other = curId && u1Id === curId ? u2 : u1;
    return {
      id: other.id || other._id || "",
      name:
        other.shopName ||
        other.shop_name ||
        other.fullName ||
        other.full_name ||
        other.name ||
        "User",
      avatarUrl: other.avatarUrl || other.avatar_url || other.avatar || null,
      role: other.role || "",
    };
  }

  // 3. If backend gave participants array
  if (Array.isArray(conv.participants) && conv.participants.length > 0) {
    const other =
      conv.participants.find((p: any) => {
        const pId = String(p.id || p._id || p.userId || "").toLowerCase();
        return !curId || pId !== curId;
      }) || conv.participants[0];

    return {
      id: other.id || other._id || other.userId || "",
      name:
        other.shopName ||
        other.shop_name ||
        other.fullName ||
        other.full_name ||
        other.name ||
        "User",
      avatarUrl: other.avatarUrl || other.avatar_url || other.avatar || null,
      role: other.role || "",
    };
  }

  // 4. Fallback from generic properties
  return {
    id: conv.participantId || conv.participant_id || conv.id || "",
    name: conv.participantName || conv.title || conv.name || "Tailor",
    avatarUrl: conv.participantAvatar || conv.avatarUrl || null,
    role: "",
  };
}

export default function MessagesScreen() {
  const currentUser = useAuthStore((state) => state.user);
  const { conversations, isLoading, isRefreshing, error, refresh } =
    useConversations();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    // 1. Filter only conversations belonging to current user
    let result = conversations;
    if (currentUser?.id) {
      const curId = String(currentUser.id).toLowerCase();
      result = result.filter((item: any) => {
        const ids = [
          item.userId,
          item.user_id,
          item.user1Id,
          item.user1_id,
          item.user2Id,
          item.user2_id,
          item.senderId,
          item.sender_id,
          item.receiverId,
          item.receiver_id,
          item.participantId,
          item.participant_id,
          item.user_1?.id,
          item.user1?.id,
          item.user_2?.id,
          item.user2?.id,
          ...(Array.isArray(item.participants)
            ? item.participants.map((p: any) => p.id || p._id || p.userId)
            : []),
        ]
          .filter(Boolean)
          .map((id) => String(id).toLowerCase());

        // If no user fields were provided on the item, assume it was fetched for the authenticated user
        if (ids.length === 0) return true;
        return ids.includes(curId);
      });
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const other = getOtherParticipant(item, currentUser?.id);
        const lastMsg =
          typeof item.lastMessage === "string"
            ? item.lastMessage
            : typeof (item as any).last_message === "string"
            ? (item as any).last_message
            : item.lastMessage?.text ||
              (item as any)?.last_message?.text ||
              "";
        return (
          other.name.toLowerCase().includes(q) ||
          lastMsg.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [conversations, searchQuery, currentUser?.id]);

  return (
    <CustomerTabShell
      bottomTabs={<CustomerTabsPreview active="Messages" />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor="#14919B"
          colors={["#14919B"]}
        />
      }
    >
      <CustomerHeader title="Messages" rightIcon="settings-outline" />

      <View className="flex-1 px-5 pb-6">
        {/* Search Bar */}
        <View className="mb-4 h-[48px] flex-row items-center rounded-md border border-brand-border px-4 bg-white">
          <Ionicons name="search" size={17} color="#6F767E" />
          <TextInput
            className="ml-3 flex-1 text-[13px] font-medium text-brand-dark"
            placeholder="Search messages..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="mr-2">
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          <Ionicons name="options-outline" size={18} color="#1A1D1F" />
        </View>

        {/* Content States */}
        {isLoading && !isRefreshing ? (
          <View className="flex-1 items-center justify-center py-20" style={{ minHeight: 380 }}>
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] font-medium text-brand-gray">
              Loading your conversations...
            </Text>
          </View>
        ) : error && conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center py-16 px-4" style={{ minHeight: 380 }}>
            <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center mb-3">
              <Ionicons name="cloud-offline-outline" size={26} color="#DC2626" />
            </View>
            <Text className="text-[15px] font-bold text-brand-dark text-center">
              Unable to load messages
            </Text>
            <Text className="mt-1 text-[13px] font-medium text-brand-gray text-center mb-4">
              {error}
            </Text>
            <TouchableOpacity
              onPress={refresh}
              className="px-4 py-2 rounded-md bg-primary"
            >
              <Text className="text-[13px] font-bold text-white tracking-wide">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 py-12 min-h-[440px]">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons name="chatbubbles-outline" size={36} color="#14919B" />
            </View>
            <Text className="text-[18px] font-bold text-brand-dark text-center tracking-tight">
              {searchQuery.trim() ? "No results found" : "No Messages Yet"}
            </Text>
            <Text className="mt-2 text-[13px] font-medium text-brand-gray text-center leading-[19px] mb-6">
              {searchQuery.trim()
                ? `No conversations match "${searchQuery}".`
                : "When you contact tailors or inquire about orders, your personal chats will appear here."}
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity
                onPress={() => router.push("/tailors" as any)}
                activeOpacity={0.8}
                className="h-[48px] px-6 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              >
                <Text className="text-[13px] font-bold text-white tracking-wide">
                  Explore Tailors
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>
            {filteredConversations.map((item, index) => {
              const other = getOtherParticipant(item, currentUser?.id);
              const lastMsgText =
                typeof item.lastMessage === "string"
                  ? item.lastMessage
                  : typeof (item as any).last_message === "string"
                  ? (item as any).last_message
                  : item.lastMessage?.text ||
                    (item as any)?.last_message?.text ||
                    "";
              const msgTime = formatMessageTime(
                typeof item.lastMessage === "object"
                  ? item.lastMessage?.createdAt
                  : (item as any)?.last_message?.created_at ||
                    (item as any)?.last_message_at ||
                    item.lastMessageAt ||
                    item.updatedAt ||
                    item.createdAt
              );
              const tones: ("teal" | "coral" | "gold" | "blue" | "mint")[] = [
                "teal",
                "coral",
                "gold",
                "blue",
                "mint",
              ];
              const tone = tones[index % tones.length];

              return (
                <MessageRow
                  key={item.id || index}
                  name={other.name}
                  message={lastMsgText}
                  time={msgTime}
                  avatarUrl={other.avatarUrl || undefined}
                  unread={item.unreadCount ?? (item as any).unread_count}
                  tone={tone}
                  onPress={() => {
                    if (item.id) {
                      router.push({
                        pathname: `/messages/${item.id}`,
                        params: {
                          conversationId: item.id,
                          recipientId: other.id,
                          name: other.name,
                          avatar: other.avatarUrl || "",
                        },
                      } as any);
                    }
                  }}
                />
              );
            })}
          </View>
        )}
      </View>
    </CustomerTabShell>
  );
}
