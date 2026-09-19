import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MessageRow } from "../components/MessageRow";
import { useConversations } from "../hooks/useConversations";
import { useAuthStore } from "../../../stores/auth.store";
import { usePresence } from "../../../hooks/usePresence";

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

  const curId = currentUserId ? String(currentUserId).toLowerCase().trim() : "";

  const extractAvatar = (obj: any): string | null => {
    if (!obj || typeof obj !== "object") return null;
    return (
      obj.avatarUrl ||
      obj.avatar_url ||
      obj.avatar ||
      obj.profileImage ||
      obj.profile_image ||
      obj.imageUrl ||
      obj.image_url ||
      obj.image ||
      obj.photoUrl ||
      obj.photo_url ||
      obj.photo ||
      null
    );
  };

  const extractPersonName = (obj: any, fallback = "User"): string => {
    if (!obj || typeof obj !== "object") return fallback;
    const name =
      obj.fullName ||
      obj.full_name ||
      obj.name ||
      obj.firstName ||
      obj.first_name ||
      (obj.user?.fullName || obj.user?.full_name || obj.user?.name) ||
      (obj.profile?.fullName || obj.profile?.full_name || obj.profile?.name) ||
      obj.shopName ||
      obj.shop_name ||
      obj.businessName ||
      fallback;
    return typeof name === "string" && name.trim() ? name.trim() : fallback;
  };

  // 1. If backend gave participant object
  if (conv.participant) {
    const pId = String(
      conv.participant.id ||
      conv.participant._id ||
      conv.participant.userId ||
      conv.participant.user_id ||
      ""
    ).toLowerCase();

    if (!curId || pId !== curId) {
      const avatar = extractAvatar(conv.participant);
      return {
        id: conv.participant.id || conv.participant._id || conv.participant.userId || conv.participant.user_id || "",
        name: extractPersonName(conv.participant, "User"),
        avatarUrl: avatar,
        avatar_url: avatar,
        role: conv.participant.role || "",
      };
    }
  }

  // 2. If backend gave tailor object
  if (conv.tailor) {
    const tId = String(
      conv.tailor.userId || conv.tailor.user_id || conv.tailor.id || conv.tailor._id || ""
    ).toLowerCase();
    if (!curId || tId !== curId) {
      const avatar = extractAvatar(conv.tailor);
      return {
        id: conv.tailor.userId || conv.tailor.user_id || conv.tailor.id || conv.tailor._id || "",
        name: extractPersonName(conv.tailor, "Tailor"),
        avatarUrl: avatar,
        avatar_url: avatar,
        role: "Tailor",
      };
    }
  }

  // 3. If backend gave customer or user object
  const customerOrUser = conv.customer || conv.user;
  if (customerOrUser) {
    const cId = String(
      customerOrUser.id || customerOrUser._id || customerOrUser.userId || ""
    ).toLowerCase();
    if (!curId || cId !== curId) {
      const avatar = extractAvatar(customerOrUser);
      return {
        id: customerOrUser.id || customerOrUser._id || customerOrUser.userId || "",
        name: extractPersonName(customerOrUser, "Customer"),
        avatarUrl: avatar,
        avatar_url: avatar,
        role: customerOrUser.role || "Customer",
      };
    }
  }

  // 4. If backend gave participant1 and participant2 / user_1 and user_2
  const p1 = conv.participant1 || conv.user_1 || conv.user1 || conv.sender;
  const p2 = conv.participant2 || conv.user_2 || conv.user2 || conv.recipient || conv.receiver;
  if (p1 && p2) {
    const p1Id = String(p1.id || p1._id || p1.userId || conv.participant1_id || "").toLowerCase();
    const other = curId && p1Id === curId ? p2 : p1;
    const avatar = extractAvatar(other);
    return {
      id: other.id || other._id || other.userId || (other === p1 ? conv.participant1_id : conv.participant2_id) || "",
      name: extractPersonName(other, "User"),
      avatarUrl: avatar,
      avatar_url: avatar,
      role: other.role || "",
    };
  }

  // 5. If backend gave participants array
  if (Array.isArray(conv.participants) && conv.participants.length > 0) {
    const other =
      conv.participants.find((p: any) => {
        const pId = String(p.id || p._id || p.userId || p.user_id || "").toLowerCase();
        return !curId || pId !== curId;
      }) || conv.participants[0];

    const avatar = extractAvatar(other);
    return {
      id: other.id || other._id || other.userId || other.user_id || "",
      name: extractPersonName(other, "User"),
      avatarUrl: avatar,
      avatar_url: avatar,
      role: other.role || "",
    };
  }

  // 6. Fallback from generic properties
  const fallbackAvatar =
    conv.participantAvatar ||
    conv.participant_avatar ||
    conv.tailorAvatar ||
    conv.tailor_avatar ||
    conv.customerAvatar ||
    conv.customer_avatar ||
    conv.avatarUrl ||
    conv.avatar_url ||
    conv.avatar ||
    conv.imageUrl ||
    conv.image_url ||
    conv.image ||
    null;

  return {
    id: conv.participantId || conv.participant_id || conv.tailorId || conv.id || "",
    name:
      conv.participantName ||
      conv.participant_name ||
      conv.userName ||
      conv.user_name ||
      conv.fullName ||
      conv.full_name ||
      conv.tailorName ||
      conv.tailor_name ||
      conv.name ||
      "Tailor",
    avatarUrl: fallbackAvatar,
    avatar_url: fallbackAvatar,
    role: "",
  };
}

export default function MessagesScreen() {
  const currentUser = useAuthStore((state) => state.user);
  const { conversations, isLoading, isRefreshing, error, refresh } =
    useConversations();
  const { isOnline } = usePresence();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filterOptions = [
    {
      label: "All Messages",
      value: null,
      desc: "Show all conversations",
      icon: "chatbubbles-outline",
      badge: "All",
    },
    {
      label: "Unread",
      value: "unread",
      desc: "Show chats with unread messages",
      icon: "mail-unread-outline",
      badge: "Unread",
    },
    {
      label: "Recent",
      value: "recent",
      desc: "Conversations active in the last 7 days",
      icon: "time-outline",
      badge: "7 Days",
    },
  ];

  const userConversations = useMemo(() => {
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
          item.participant1_id,
          item.participant2_id,
          item.participant1?.id,
          item.participant1?._id,
          item.participant1?.userId,
          item.participant2?.id,
          item.participant2?._id,
          item.participant2?.userId,
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

    // 2. Deduplicate: Ensure only ONE conversation per participant is shown (most recent first)
    const sorted = [...result].sort((a, b) => {
      const timeA = new Date(
        a.lastMessageAt ||
          (typeof a.lastMessage === "object" ? a.lastMessage?.createdAt : null) ||
          (a as any)?.last_message_at ||
          a.updatedAt ||
          a.createdAt ||
          0
      ).getTime();
      const timeB = new Date(
        b.lastMessageAt ||
          (typeof b.lastMessage === "object" ? b.lastMessage?.createdAt : null) ||
          (b as any)?.last_message_at ||
          b.updatedAt ||
          b.createdAt ||
          0
      ).getTime();
      return timeB - timeA;
    });

    const deduplicated: any[] = [];
    const seenOtherIds = new Set<string>();

    for (const conv of sorted) {
      const other = getOtherParticipant(conv, currentUser?.id);
      const otherKey = other.id
        ? String(other.id).toLowerCase()
        : other.name
        ? String(other.name).toLowerCase()
        : conv.id;
      if (!seenOtherIds.has(otherKey)) {
        seenOtherIds.add(otherKey);
        deduplicated.push(conv);
      }
    }

    return deduplicated;
  }, [conversations, currentUser?.id]);

  const getConversationCount = (filterVal: string | null) => {
    if (filterVal === null) return userConversations.length;
    if (filterVal === "unread") {
      return userConversations.filter(
        (c) => (c.unreadCount ?? (c as any).unread_count ?? 0) > 0
      ).length;
    }
    if (filterVal === "recent") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return userConversations.filter((c) => {
        const time = new Date(
          c.lastMessageAt ||
            (typeof c.lastMessage === "object" ? c.lastMessage?.createdAt : null) ||
            (c as any)?.last_message_at ||
            c.updatedAt ||
            c.createdAt ||
            0
        ).getTime();
        return time >= sevenDaysAgo;
      }).length;
    }
    return userConversations.length;
  };

  const filteredConversations = useMemo(() => {
    let result = [...userConversations];

    // 1. Filter option
    if (activeFilter === "unread") {
      result = result.filter(
        (c) => (c.unreadCount ?? (c as any).unread_count ?? 0) > 0
      );
    } else if (activeFilter === "recent") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter((c) => {
        const time = new Date(
          c.lastMessageAt ||
            (typeof c.lastMessage === "object" ? c.lastMessage?.createdAt : null) ||
            (c as any)?.last_message_at ||
            c.updatedAt ||
            c.createdAt ||
            0
        ).getTime();
        return time >= sevenDaysAgo;
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
  }, [userConversations, searchQuery, activeFilter, currentUser?.id]);

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
      <CustomerHeader
        title="Messages"
        hideRightIcon={true}
      />

      <View className="flex-1 px-5 pb-6">
        {/* Search Bar & Dedicated Filter Button */}
        <View className="flex-row items-center gap-2.5 mb-4">
          <View
            className="flex-1 flex-row items-center px-3.5 bg-[#F8FAFC] shadow-xs"
            style={{ height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
          >
            <Ionicons name="search" size={19} color="#14919B" />
            <TextInput
              style={{ paddingVertical: 0 }}
              className="ml-2.5 flex-1 text-[13px] font-medium text-brand-dark"
              placeholder="Search messages..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="p-1"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={17} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => {
              setSelectedFilter(activeFilter);
              setIsFilterModalVisible(true);
            }}
            activeOpacity={0.8}
            className="items-center justify-center shadow-xs"
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
            accessibilityLabel="Filter messages"
          >
            <Ionicons
              name="filter"
              size={21}
              color="#14919B"
            />
            {activeFilter !== null && (
              <View
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: "#14919B",
                }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Modal: Message Filter */}
        <Modal
          visible={isFilterModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsFilterModalVisible(false)}
        >
          <View
            className="flex-1 justify-end"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
          >
            <View className="rounded-t-[36px] bg-white px-5 pb-8 pt-3 shadow-2xl max-h-[88%]">
              {/* Drag handle indicator */}
              <View className="h-1.5 w-12 rounded-full bg-slate-200 self-center mb-3 mt-1" />

              {/* Header */}
              <View className="flex-row items-center justify-between pb-3">
                <View className="flex-row items-center flex-1">
                  <View className="h-10 w-10 items-center justify-center rounded-md bg-[#E0F7F7] mr-3">
                    <Ionicons name="filter" size={20} color="#14919B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-bold text-brand-dark">
                      Filter Messages
                    </Text>
                    <Text className="text-[12px] font-medium text-brand-gray">
                      Filter your conversations
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsFilterModalVisible(false)}
                  className="h-8 w-8 items-center justify-center rounded-md bg-slate-100 active:bg-slate-200"
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Subtle hairline divider */}
              <View className="h-[1px] bg-slate-100 mb-3.5" />

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Filter Options
                </Text>

                <View className="gap-2.5 mb-4">
                  {filterOptions.map((opt) => {
                    const isSelected = selectedFilter === opt.value;
                    const count = getConversationCount(opt.value);
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        onPress={() => setSelectedFilter(opt.value)}
                        activeOpacity={0.75}
                        className="flex-row items-center rounded-md p-3.5"
                        style={{
                          backgroundColor: isSelected ? "#F0FAFA" : "#FFFFFF",
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? "#14919B" : "#E2E8F0",
                        }}
                      >
                        <View
                          className="h-10 w-10 items-center justify-center rounded-md mr-3"
                          style={{
                            backgroundColor: isSelected ? "#14919B" : "#F0FAFA",
                          }}
                        >
                          <Ionicons
                            name={opt.icon as any}
                            size={20}
                            color={isSelected ? "#FFFFFF" : "#14919B"}
                          />
                        </View>
                        <View className="flex-1 mr-2">
                          <View className="flex-row items-center">
                            <Text
                              className={`text-[14px] font-bold ${
                                isSelected
                                  ? "text-[#14919B]"
                                  : "text-brand-dark"
                              }`}
                            >
                              {opt.label}
                            </Text>
                            <View
                              className="ml-2 px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: isSelected
                                  ? "#E0F7F7"
                                  : "#F1F5F9",
                              }}
                            >
                              <Text
                                className={`text-[10px] font-bold ${
                                  isSelected
                                    ? "text-[#0D7377]"
                                    : "text-slate-500"
                                }`}
                              >
                                {opt.badge}
                              </Text>
                            </View>
                          </View>
                          <Text
                            className={`text-[12px] mt-0.5 ${
                              isSelected ? "text-[#0D7377]" : "text-brand-gray"
                            }`}
                          >
                            {opt.desc}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text
                            className={`mr-2 text-[11px] font-bold ${
                              isSelected ? "text-[#14919B]" : "text-slate-400"
                            }`}
                          >
                            {count} {count === 1 ? "chat" : "chats"}
                          </Text>
                          <View
                            className="h-5 w-5 rounded-md items-center justify-center"
                            style={{
                              backgroundColor: isSelected
                                ? "#14919B"
                                : "#FFFFFF",
                              borderWidth: isSelected ? 0 : 1.5,
                              borderColor: "#CBD5E1",
                            }}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={13}
                                color="#FFFFFF"
                              />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Fixed Bottom Action Buttons */}
              <View
                className="mt-3.5 pt-3 pb-1 flex flex-row items-center justify-center gap-3"
                style={{ borderTopWidth: 1, borderTopColor: "#E2E8F0" }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFilter(null);
                    setActiveFilter(null);
                  }}
                  activeOpacity={0.7}
                  className="h-[50px] px-5 flex-1 items-center justify-center rounded-md bg-white shadow-xs"
                  style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
                >
                  <Text className="text-[13px] font-bold text-brand-gray">
                    Reset
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsFilterModalVisible(false);
                    setActiveFilter(selectedFilter);
                  }}
                  activeOpacity={0.85}
                  className="h-[50px] flex-1 items-center justify-center rounded-md bg-primary active:bg-primary-dark shadow-sm px-4"
                >
                  <Text className="text-[14px] font-bold text-white">
                    Show Results ({filteredConversations.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
              {searchQuery.trim() || activeFilter ? "No results found" : "No Messages Yet"}
            </Text>
            <Text className="mt-2 text-[13px] font-medium text-brand-gray text-center leading-[19px] mb-6">
              {searchQuery.trim() || activeFilter
                ? `No conversations match your search or filter criteria.`
                : "When you contact tailors or inquire about orders, your personal chats will appear here."}
            </Text>
            {searchQuery.trim() || activeFilter ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setActiveFilter(null);
                  setSelectedFilter(null);
                }}
                activeOpacity={0.8}
                className="h-[48px] px-6 rounded-md bg-primary items-center justify-center shadow-sm active:bg-primary-dark"
              >
                <Text className="text-[13px] font-bold text-white tracking-wide">
                  Clear Filters
                </Text>
              </TouchableOpacity>
            ) : (
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
              const lastMsg = item.lastMessage || (item as any).last_message;
              const lastSenderId = typeof lastMsg === "object" ? (lastMsg?.senderId || (lastMsg as any)?.sender_id) : undefined;
              const isLastMsgOutgoing = Boolean(lastSenderId && currentUser?.id && String(lastSenderId).toLowerCase() === String(currentUser.id).toLowerCase());
              const isLastMsgRead = typeof lastMsg === "object" ? (lastMsg?.isRead === true || (lastMsg as any)?.is_read === true) : false;

              return (
                <MessageRow
                  key={item.id || index}
                  name={other.name}
                  message={lastMsgText}
                  time={msgTime}
                  avatar_url={other.avatar_url || other.avatarUrl || undefined}
                  avatarUrl={other.avatarUrl || other.avatar_url || undefined}
                  unread={item.unreadCount ?? (item as any).unread_count}
                  tone={tone}
                  isOnline={isOnline(other.id)}
                  isOutgoing={isLastMsgOutgoing}
                  isRead={isLastMsgRead}
                  onPress={() => {
                    const tailorId = item.participant2_id || item.tailorId || (item as any).tailor_id || other.id;
                    const clientId = item.participant1_id || item.customerId || (item as any).customer_id || currentUser?.id;
                    router.push({
                      pathname: "/messages/[conversationId]",
                      params: {
                        conversationId: item.id || "new",
                        tailorId,
                        clientId,
                        recipientId: other.id,
                        name: other.name,
                        avatar: other.avatar_url || other.avatarUrl || "",
                      },
                    } as any);
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
