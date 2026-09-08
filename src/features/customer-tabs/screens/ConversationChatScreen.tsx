import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { conversationsApi } from "../../../api/conversations.api";
import { useAuthStore } from "../../../stores/auth.store";
import { MessageItem, ConversationItem } from "../../../types/api";

export default function ConversationChatScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    conversationId?: string;
    recipientId?: string;
    name?: string;
    avatar?: string;
  }>();

  const [activeConvId, setActiveConvId] = useState<string | null>(
    params.conversationId && params.conversationId !== "new"
      ? params.conversationId
      : null
  );
  const currentUser = useAuthStore((state) => state.user);

  const [conversation, setConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(
    Boolean(params.conversationId && params.conversationId !== "new")
  );
  const [isSending, setIsSending] = useState(false);

  const loadData = useCallback(async () => {
    if (!activeConvId || activeConvId === "new") {
      setIsLoading(false);
      return;
    }
    try {
      const [convRes, msgsRes] = await Promise.all([
        conversationsApi.getConversationById(activeConvId).catch(() => null),
        conversationsApi.getMessages(activeConvId).catch(() => null),
      ]);

      if (convRes?.data) setConversation(convRes.data);
      if (msgsRes?.data && Array.isArray(msgsRes.data)) {
        setMessages(msgsRes.data);
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }, [activeConvId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Optimistic message
    const tempMessage: MessageItem = {
      id: "temp_" + Date.now(),
      conversationId: activeConvId || "temp",
      senderId: currentUser?.id,
      text: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      if (activeConvId && activeConvId !== "new") {
        const res = await conversationsApi.sendMessage(activeConvId, {
          text: textToSend,
        });
        if (res?.data) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempMessage.id ? res.data! : m))
          );
        }
      } else if (params.recipientId) {
        const startRes = await conversationsApi.startConversation({
          participantId: params.recipientId,
          initialMessage: textToSend,
        });
        if (startRes?.data && startRes.data.id) {
          setActiveConvId(startRes.data.id);
          setConversation(startRes.data);
          try {
            const msgs = await conversationsApi.getMessages(startRes.data.id);
            if (msgs?.data && Array.isArray(msgs.data) && msgs.data.length > 0) {
              setMessages(msgs.data);
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const participant =
    conversation?.participant ||
    conversation?.participants?.[0] ||
    ({
      name: params.name || "Tailor",
      fullName: params.name || "Tailor",
      avatarUrl: params.avatar,
      role: "Tailor",
    } as any);

  const participantName =
    participant.name ||
    participant.fullName ||
    params.name ||
    "Tailor";

  const avatarUrl =
    participant.avatarUrl ||
    participant.avatar ||
    params.avatar;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-brand-border px-4 py-3 bg-white">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center mr-1"
          >
            <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
          </TouchableOpacity>

          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-10 h-10 rounded-full border border-brand-border bg-brand-surface"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center border border-primary/20">
              <Text className="text-[14px] font-bold text-primary">
                {participantName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View className="ml-3 flex-1">
            <Text numberOfLines={1} className="text-[15px] font-bold text-brand-dark">
              {participantName}
            </Text>
            <Text className="text-[11px] text-emerald-600 font-medium">Online</Text>
          </View>
        </View>

        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-vertical" size={18} color="#6F767E" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Message List */}
        <ScrollView
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator color="#14919B" />
            </View>
          ) : messages.length === 0 ? (
            <View className="py-12 items-center justify-center px-6">
              <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-3">
                <Ionicons name="chatbubble-ellipses-outline" size={28} color="#14919B" />
              </View>
              <Text className="text-[15px] font-bold text-brand-dark text-center">
                Start a conversation
              </Text>
              <Text className="text-[12px] text-brand-gray text-center mt-1">
                Say hello and discuss your outfit designs, fittings, or timelines.
              </Text>
            </View>
          ) : (
            messages.map((item, idx) => {
              const isOutgoing =
                item.senderId === currentUser?.id || item.id.startsWith("temp_");
              return (
                <View
                  key={item.id || idx}
                  className={`mb-3 max-w-[80%] rounded-2xl px-4 py-3 ${
                    isOutgoing
                      ? "self-end bg-primary rounded-br-none"
                      : "self-start bg-brand-surface border border-brand-border rounded-bl-none"
                  }`}
                >
                  <Text
                    className={`text-[13px] leading-5 ${
                      isOutgoing ? "text-white font-medium" : "text-brand-dark"
                    }`}
                  >
                    {item.text}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input Bar */}
        <View
          className="flex-row items-center border-t border-brand-border px-4 py-3 bg-white"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <TouchableOpacity className="p-2 mr-1">
            <Ionicons name="attach-outline" size={22} color="#6F767E" />
          </TouchableOpacity>

          <TextInput
            className="flex-1 min-h-[44px] max-h-[100px] rounded-2xl bg-brand-surface px-4 text-[14px] text-brand-dark border border-brand-border mr-2"
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              inputText.trim() ? "bg-primary" : "bg-gray-200"
            }`}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
