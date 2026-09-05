import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  ScrollView,
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
import { ConversationItem } from "../../../types/api";

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

export default function MessagesScreen() {
  const { conversations, isLoading, isRefreshing, error, refresh } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((item) => {
      const participantName =
        item.participant?.name ||
        item.participant?.fullName ||
        item.participants?.[0]?.name ||
        "";
      const lastMsg =
        typeof item.lastMessage === "string"
          ? item.lastMessage
          : item.lastMessage?.text || "";
      return (
        participantName.toLowerCase().includes(q) ||
        lastMsg.toLowerCase().includes(q)
      );
    });
  }, [conversations, searchQuery]);

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Messages" />}>
      <CustomerHeader title="Messages" rightIcon="settings-outline" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#14919B"
            colors={["#14919B"]}
          />
        }
      >
        {/* Search Bar */}
        <View className="mb-4 h-[48px] flex-row items-center rounded-xl border border-brand-border px-4 bg-white">
          <Ionicons name="search" size={17} color="#6F767E" />
          <TextInput
            className="ml-3 flex-1 text-[13px] text-brand-dark"
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
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#14919B" />
            <Text className="mt-3 text-[13px] text-brand-gray">
              Loading conversations...
            </Text>
          </View>
        ) : error && conversations.length === 0 ? (
          <View className="py-16 items-center justify-center px-4">
            <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center mb-3">
              <Ionicons name="cloud-offline-outline" size={26} color="#DC2626" />
            </View>
            <Text className="text-[15px] font-bold text-brand-dark text-center">
              Unable to load messages
            </Text>
            <Text className="mt-1 text-[13px] text-brand-gray text-center mb-4">
              {error}
            </Text>
            <TouchableOpacity
              onPress={refresh}
              className="px-4 py-2 rounded-xl bg-primary"
            >
              <Text className="text-[13px] font-semibold text-white">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View
            className="flex-1 items-center justify-center px-6 py-12"
            style={{ minHeight: 440, justifyContent: "center", alignItems: "center" }}
          >
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons name="chatbubbles-outline" size={36} color="#14919B" />
            </View>
            <Text className="text-[18px] font-bold text-brand-dark text-center">
              {searchQuery.trim() ? "No results found" : "No Messages Yet"}
            </Text>
            <Text className="mt-2 text-[13px] text-brand-gray text-center leading-[19px] mb-6">
              {searchQuery.trim()
                ? `No conversations match "${searchQuery}".`
                : "When you contact tailors, inquire about orders, or chat with stylists, your conversations will appear here."}
            </Text>
            {!searchQuery.trim() && (
              <TouchableOpacity
                onPress={() => router.push("/tailors" as any)}
                activeOpacity={0.8}
                className="h-[48px] px-6 rounded-xl bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
                style={{
                  height: 48,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#14919B",
                }}
              >
                <Text
                  className="text-[14px] font-semibold text-white"
                  style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Explore Tailors
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>
            {filteredConversations.map((item, index) => {
              const participant =
                item.participant ||
                item.participants?.[0] ||
                ({ name: "Tailor", id: item.id } as any);
              const participantName =
                participant.name || participant.fullName || "User";
              const lastMsgText =
                typeof item.lastMessage === "string"
                  ? item.lastMessage
                  : item.lastMessage?.text || "";
              const msgTime = formatMessageTime(
                typeof item.lastMessage === "object"
                  ? item.lastMessage?.createdAt
                  : item.lastMessageAt || item.updatedAt || item.createdAt
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
                  name={participantName}
                  message={lastMsgText}
                  time={msgTime}
                  avatarUrl={participant.avatarUrl || participant.avatar}
                  unread={item.unreadCount}
                  tone={tone}
                  onPress={() => {
                    if (item.id) {
                      router.push(`/messages/${item.id}` as any);
                    }
                  }}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </CustomerTabShell>
  );
}
