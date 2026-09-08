import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

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
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(
    Boolean(params.conversationId && params.conversationId !== "new")
  );
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const markUnreadMessagesAsRead = useCallback(
    (msgs: MessageItem[]) => {
      if (!currentUser?.id || !Array.isArray(msgs)) return;
      const curId = String(currentUser.id).toLowerCase();
      msgs.forEach((m) => {
        const senderId = m.senderId ? String(m.senderId).toLowerCase() : "";
        if (m.id && senderId && senderId !== curId && m.isRead === false) {
          conversationsApi.markAsRead(m.id).catch(() => {});
        }
      });
    },
    [currentUser?.id]
  );

  const loadData = useCallback(async () => {
    let convId = activeConvId;

    if (!convId || convId === "new") {
      if (params.recipientId) {
        try {
          const targets = [params.recipientId].filter(Boolean) as string[];
          const targetNames = [params.name].filter(Boolean) as string[];
          const existing = await conversationsApi.findExistingConversation(
            targets,
            currentUser?.id,
            targetNames
          );
          if (existing && (existing.id || (existing as any)._id)) {
            const foundId = existing.id || (existing as any)._id;
            convId = foundId;
            setActiveConvId(foundId);
            setConversation(existing);
          } else {
            // Create conversation if it doesn't exist yet
            try {
              const startRes = await conversationsApi.startConversation({
                participantId: params.recipientId,
                participant_id: params.recipientId,
                tailorId: params.recipientId,
                tailor_id: params.recipientId,
                recipientId: params.recipientId,
                recipient_id: params.recipientId,
              });
              const createdConv = (startRes?.data as any)?.conversation || startRes?.data;
              const newId = createdConv?.id || (createdConv as any)?._id;
              if (newId) {
                convId = newId;
                setActiveConvId(newId);
                if (createdConv) setConversation(createdConv);
              }
            } catch (createErr) {
              console.warn("Failed to auto-create conversation on load:", createErr);
            }
          }
        } catch {
          // Gracefully continue
        }
      }
    }

    if (!convId || convId === "new") {
      setIsLoading(false);
      return;
    }

    try {
      const [convRes, msgsRes] = await Promise.all([
        conversationsApi.getConversationById(convId).catch(() => null),
        conversationsApi.getMessages(convId).catch(() => null),
      ]);

      if (convRes?.data) setConversation(convRes.data);
      if (msgsRes?.data && Array.isArray(msgsRes.data)) {
        setMessages(msgsRes.data);
        markUnreadMessagesAsRead(msgsRes.data);
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }, [activeConvId, params.recipientId, params.name, currentUser?.id, markUnreadMessagesAsRead]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePickAttachment = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (uri) {
          setPendingAttachments((prev) => [...prev, uri]);
        }
      }
    } catch {
      Alert.alert("Attachment", "Unable to open image gallery.");
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const textToSend = inputText.trim();
    const attachmentsToSend = [...pendingAttachments];
    if ((!textToSend && attachmentsToSend.length === 0) || isSending) return;

    setInputText("");
    setPendingAttachments([]);
    setIsSending(true);

    // Optimistic message
    const tempMessage: MessageItem = {
      id: "temp_" + Date.now(),
      conversationId: activeConvId || "temp",
      senderId: currentUser?.id,
      text: textToSend || (attachmentsToSend.length > 0 ? "Sent an attachment" : ""),
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      if (activeConvId && activeConvId !== "new") {
        const res = await conversationsApi.sendMessage(activeConvId, {
          text: textToSend || "Attachment",
          attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
        });
        if (res?.data) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempMessage.id ? res.data! : m))
          );
        }
      } else if (params.recipientId) {
        const targetNames = [params.name].filter(Boolean) as string[];
        const startRes = await conversationsApi.getOrCreateConversation(
          params.recipientId,
          undefined,
          currentUser?.id,
          textToSend || "Attachment",
          targetNames
        );
        const createdConv = (startRes?.data as any)?.conversation || startRes?.data;
        const newId = createdConv?.id || (createdConv as any)?._id;
        if (newId) {
          setActiveConvId(newId);
          if (createdConv) setConversation(createdConv);
          try {
            const msgs = await conversationsApi.getMessages(newId);
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
    participant.shopName ||
    params.name ||
    "Tailor";

  const avatarUrl =
    participant.avatarUrl ||
    participant.avatar ||
    participant.imageUrl ||
    params.avatar;

  const canSend = (inputText.trim().length > 0 || pendingAttachments.length > 0) && !isSending;

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
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
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
              const curId = currentUser?.id ? String(currentUser.id).toLowerCase() : "";
              const senderId = (
                item.senderId ||
                (item as any).sender_id ||
                (item as any).sender?.id ||
                (item as any).sender?._id ||
                (item as any).userId ||
                (item as any).user_id ||
                ""
              ).toString().toLowerCase();

              const isOutgoing =
                (curId && senderId === curId) ||
                (item.id && String(item.id).startsWith("temp_")) ||
                (item as any).isSender === true ||
                (item as any).is_sender === true;

              const text =
                item.text ||
                (item as any).content ||
                (item as any).message ||
                (item as any).body ||
                "";

              const attachments =
                item.attachments ||
                (item as any).media ||
                (item as any).images ||
                [];

              return (
                <View
                  key={item.id || idx}
                  className={`mb-3 max-w-[82%] rounded-2xl px-4 py-3 ${
                    isOutgoing
                      ? "self-end bg-primary rounded-br-none"
                      : "self-start bg-brand-surface border border-brand-border rounded-bl-none"
                  }`}
                >
                  {Array.isArray(attachments) && attachments.length > 0 && (
                    <View className="mb-2 gap-2">
                      {attachments.map((attUri: string, attIdx: number) => (
                        <Image
                          key={attIdx}
                          source={{ uri: attUri }}
                          className="h-40 w-52 rounded-xl bg-black/10"
                          contentFit="cover"
                        />
                      ))}
                    </View>
                  )}
                  {text ? (
                    <Text
                      className={`text-[13px] leading-5 ${
                        isOutgoing ? "text-white font-medium" : "text-brand-dark"
                      }`}
                    >
                      {text}
                    </Text>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Pending Attachments Preview */}
        {pendingAttachments.length > 0 && (
          <View className="flex-row flex-wrap gap-2 px-4 py-2 border-t border-brand-border bg-brand-surface">
            {pendingAttachments.map((uri, idx) => (
              <View key={idx} className="relative">
                <Image
                  source={{ uri }}
                  className="w-16 h-16 rounded-lg border border-brand-border"
                  contentFit="cover"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveAttachment(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-dark rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Input Bar */}
        <View
          className="flex-row items-center border-t border-brand-border px-4 py-3 bg-white"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <TouchableOpacity onPress={handlePickAttachment} className="p-2 mr-1">
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
            disabled={!canSend}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              canSend ? "bg-primary" : "bg-gray-200"
            }`}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={canSend ? "#FFFFFF" : "#9CA3AF"}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

