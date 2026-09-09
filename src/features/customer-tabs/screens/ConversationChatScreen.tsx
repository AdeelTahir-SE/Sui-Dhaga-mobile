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
  Modal,
} from "react-native";

import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { conversationsApi } from "../../../api/conversations.api";
import { useAuthStore } from "../../../stores/auth.store";
import { MessageItem, ConversationItem } from "../../../types/api";
import { CONFIG } from "../../../constants/config";

export function resolveMediaUrl(uri?: any): string | null {
  if (!uri) return null;
  if (typeof uri === "object") {
    uri =
      uri.url ||
      uri.uri ||
      uri.fileUrl ||
      uri.file_url ||
      uri.imageUrl ||
      uri.image_url ||
      uri.path ||
      uri.src ||
      uri.filePath ||
      uri.file_path ||
      "";
  }
  if (typeof uri !== "string" || !uri.trim()) return null;
  uri = uri.trim();

  // If already absolute URL or local file URI
  if (
    uri.startsWith("http://") ||
    uri.startsWith("https://") ||
    uri.startsWith("file://") ||
    uri.startsWith("data:") ||
    uri.startsWith("content://") ||
    uri.startsWith("ph://")
  ) {
    return uri;
  }

  const base = (CONFIG.BACKEND_URL || CONFIG.API_URL || "").replace(/\/+$/, "");
  const cleanPath = uri.startsWith("/") ? uri : `/${uri}`;
  return `${base}${cleanPath}`;
}

export function extractMessageAttachments(item: any): string[] {
  if (!item) return [];
  const rawList: any[] = [];

  const candidates = [
    item.attachments,
    item.attachment,
    item.attachmentUrl,
    item.attachment_url,
    item.attachmentUrls,
    item.attachment_urls,
    item.files,
    item.file,
    item.fileUrl,
    item.file_url,
    item.media,
    item.images,
    item.image,
    item.imageUrl,
    item.image_url,
    item.photos,
    item.photo,
  ];

  candidates.forEach((cand) => {
    if (!cand) return;
    if (Array.isArray(cand)) {
      rawList.push(...cand);
    } else if (typeof cand === "string") {
      const trimmed = cand.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            rawList.push(...parsed);
            return;
          }
        } catch {}
      }
      rawList.push(trimmed);
    } else if (typeof cand === "object") {
      rawList.push(cand);
    }
  });

  const resolved = rawList
    .map(resolveMediaUrl)
    .filter((url): url is string => Boolean(url && typeof url === "string" && url.length > 0));

  return Array.from(new Set(resolved));
}

export default function ConversationChatScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    conversationId?: string;
    tailorId?: string;
    clientId?: string;
    recipientId?: string;
    name?: string;
    avatar?: string;
  }>();

  const currentUser = useAuthStore((state) => state.user);
  const isTailor = currentUser?.role === "tailor";

  const resolvedTailorId =
    params.tailorId ||
    (isTailor ? currentUser?.id : params.recipientId) ||
    "";

  const resolvedClientId =
    params.clientId ||
    (!isTailor ? currentUser?.id : params.recipientId) ||
    "";

  const [activeConvId, setActiveConvId] = useState<string | null>(
    params.conversationId && params.conversationId !== "new"
      ? params.conversationId
      : null
  );

  const [conversation, setConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
    try {
      // 1. Primary path: Use tailorId and clientId
      if (resolvedTailorId && resolvedClientId) {
        const [convRes, msgsRes] = await Promise.all([
          conversationsApi.getConversationBetween(resolvedTailorId, resolvedClientId).catch(() => null),
          conversationsApi.getMessagesBetween(resolvedTailorId, resolvedClientId).catch(() => null),
        ]);

        if (convRes?.data?.conversation) {
          setConversation(convRes.data.conversation);
          if (convRes.data.conversation.id) {
            setActiveConvId(convRes.data.conversation.id);
          }
        }
        if (msgsRes?.data && Array.isArray(msgsRes.data)) {
          setMessages(msgsRes.data);
          markUnreadMessagesAsRead(msgsRes.data);
        }
        return;
      }

      // 2. Fallback: If only activeConvId is known
      const convId = activeConvId || (params.conversationId !== "new" ? params.conversationId : null);
      if (convId) {
        const [convRes, msgsRes] = await Promise.all([
          conversationsApi.getConversationById(convId).catch(() => null),
          conversationsApi.getMessages(convId).catch(() => null),
        ]);

        if (convRes?.data) setConversation(convRes.data);
        if (msgsRes?.data && Array.isArray(msgsRes.data)) {
          setMessages(msgsRes.data);
          markUnreadMessagesAsRead(msgsRes.data);
        }
      }
    } catch (err) {
      console.warn("Failed to load conversation messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    resolvedTailorId,
    resolvedClientId,
    activeConvId,
    params.conversationId,
    markUnreadMessagesAsRead,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access your gallery is required to send images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((a) => a.uri).filter(Boolean);
        if (uris.length > 0) {
          setPendingAttachments((prev) => [...prev, ...uris]);
        }
      }
    } catch {
      Alert.alert("Attachment", "Unable to open photo library.");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access your camera is required to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
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
      Alert.alert("Camera", "Unable to launch camera.");
    }
  };

  const handlePickAttachment = () => {
    Alert.alert("Send Image / Design File", "Choose an option to attach photos or design references:", [
      {
        text: "Take Photo",
        onPress: handleTakePhoto,
      },
      {
        text: "Choose from Gallery",
        onPress: handlePickFromGallery,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllAttachments = () => {
    setPendingAttachments([]);
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
      let createdMessage: MessageItem | null = null;
      const firstFileUri = attachmentsToSend[0];

      // Prepare payload with files for multipart/form-data
      const messagePayload = {
        text: textToSend || (attachmentsToSend.length > 0 ? "Check out this attachment" : "Hello"),
        file: firstFileUri ? { uri: firstFileUri } : undefined,
        files: attachmentsToSend.map((u) => ({ uri: u })),
        senderId: currentUser?.id,
      };

      // 1. If conversationId is known, send directly to POST /conversations/:conversationId/messages with multipart/form-data
      if (activeConvId && activeConvId !== "new") {
        const res = await conversationsApi.sendMessage(activeConvId, messagePayload);
        let rawData: any = res?.data;
        if (rawData && typeof rawData === "object") {
          createdMessage = rawData.message || rawData.data || rawData;
        }
      } else if (resolvedTailorId && resolvedClientId) {
        // 2. Send using tailorId and clientId
        const res = await conversationsApi.sendMessageBetween(resolvedTailorId, resolvedClientId, messagePayload);
        let rawData: any = res?.data;
        if (rawData && typeof rawData === "object") {
          createdMessage = rawData.message || rawData.data || rawData;
          if ((createdMessage as any)?.conversationId && !activeConvId) {
            setActiveConvId((createdMessage as any).conversationId);
          }
        }
      } else if (params.recipientId) {
        // 3. Fallback: getOrCreateConversation
        const targetNames = [params.name].filter(Boolean) as string[];
        const startRes = await conversationsApi.getOrCreateConversation(
          params.recipientId,
          undefined,
          currentUser?.id,
          textToSend || "Hello",
          targetNames
        );
        const createdConv = (startRes?.data as any)?.conversation || startRes?.data;
        const newId = createdConv?.id || (createdConv as any)?._id;
        if (newId) {
          setActiveConvId(newId);
          if (createdConv) setConversation(createdConv);
          if (attachmentsToSend.length > 0) {
            const sendRes = await conversationsApi.sendMessage(newId, messagePayload);
            let rawData: any = sendRes?.data;
            if (rawData && typeof rawData === "object") {
              createdMessage = rawData.message || rawData.data || rawData;
            }
          }
        }
      }

      // If backend message response has attachments, use them; otherwise fallback to local previews
      if (createdMessage) {
        const backendAttachments = extractMessageAttachments(createdMessage);

        const finalAttachments =
          backendAttachments.length > 0
            ? backendAttachments
            : attachmentsToSend.length > 0
            ? attachmentsToSend
            : undefined;

        const finalMsg: MessageItem = {
          ...createdMessage,
          id: createdMessage.id || (createdMessage as any)._id || tempMessage.id,
          attachments: finalAttachments,
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? finalMsg : m))
        );
      }
    } catch (err) {
      console.warn("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };


  const curUserId = currentUser?.id ? String(currentUser.id).toLowerCase() : "";
  const resolvedOtherParticipant =
    conversation?.participant ||
    (conversation?.participant1 && conversation?.participant2
      ? String(conversation.participant1.id || conversation.participant1._id || conversation.participant1_id || "").toLowerCase() === curUserId
        ? conversation.participant2
        : conversation.participant1
      : null) ||
    conversation?.participant2 ||
    conversation?.participant1 ||
    conversation?.participants?.[0] ||
    ({
      name: params.name || "Tailor",
      fullName: params.name || "Tailor",
      avatarUrl: params.avatar,
      role: "Tailor",
    } as any);

  const participant = resolvedOtherParticipant;

  const participantName =
    participant.fullName ||
    participant.full_name ||
    participant.name ||
    params.name ||
    participant.shopName ||
    participant.shop_name ||
    "Tailor";

  const avatarUrl =
    participant.avatarUrl ||
    participant.avatar_url ||
    participant.avatar ||
    participant.imageUrl ||
    participant.image_url ||
    participant.image ||
    participant.profileImage ||
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

          <View
            style={{ width: 40, height: 40, borderRadius: 20 }}
            className="overflow-hidden mr-3 items-center justify-center border border-brand-border bg-brand-surface"
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View
                style={{ width: 40, height: 40, borderRadius: 20 }}
                className="w-full h-full bg-primary-50 items-center justify-center border border-primary/20"
              >
                <Text className="text-[15px] font-bold text-primary">
                  {participantName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1">
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

              const attachments = extractMessageAttachments(item);

              const messageAvatar =
                (item as any).senderAvatar ||
                (item as any).sender_avatar ||
                (item as any).sender?.avatar_url ||
                (item as any).sender?.avatarUrl ||
                (item as any).sender?.avatar ||
                avatarUrl;

              return (
                <View
                  key={item.id || idx}
                  className={
                    isOutgoing
                      ? "mb-3 flex-row items-end justify-end self-end max-w-[85%]"
                      : "mb-3 flex-row items-end justify-start self-start max-w-[85%]"
                  }
                >
                  {/* Incoming person avatar */}
                  {!isOutgoing && (
                    <View
                      style={{ width: 28, height: 28, borderRadius: 14 }}
                      className="overflow-hidden mr-2 mb-0.5 items-center justify-center border border-brand-border bg-brand-surface"
                    >
                      {messageAvatar ? (
                        <Image
                          source={{ uri: messageAvatar }}
                          style={{ width: 28, height: 28, borderRadius: 14 }}
                          contentFit="cover"
                          transition={200}
                        />
                      ) : (
                        <View
                          style={{ width: 28, height: 28, borderRadius: 14 }}
                          className="w-full h-full bg-primary-50 items-center justify-center"
                        >
                          <Text className="text-[11px] font-bold text-primary">
                            {participantName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Message Bubble */}
                  <View
                    className={
                      isOutgoing
                        ? "rounded-2xl px-4 py-3 bg-primary rounded-br-none"
                        : "rounded-2xl px-4 py-3 bg-brand-surface border border-brand-border rounded-bl-none"
                    }
                  >
                    {attachments.length > 0 && (
                      <View className="mb-2 gap-2">
                        {attachments.map((attUri: string, attIdx: number) => (
                          <TouchableOpacity
                            key={attIdx}
                            activeOpacity={0.9}
                            onPress={() => setPreviewImageUri(attUri)}
                            style={{
                              borderRadius: 12,
                              overflow: "hidden",
                              backgroundColor: isOutgoing ? "rgba(255,255,255,0.15)" : "#F3F4F6",
                            }}
                          >
                            <Image
                              source={{ uri: attUri }}
                              style={{ width: 220, height: 160, borderRadius: 12 }}
                              contentFit="cover"
                              transition={200}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {text ? (
                      <Text
                        className={
                          isOutgoing
                            ? "text-[13px] leading-5 text-white font-medium"
                            : "text-[13px] leading-5 text-brand-dark"
                        }
                      >
                        {text}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Enhanced Pending Attachments Preview Bar */}
        {pendingAttachments.length > 0 && (
          <View className="border-t border-brand-border bg-[#F8FAFB] px-4 py-2.5">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="images" size={15} color="#14919B" />
                <Text className="ml-1.5 text-[12px] font-bold text-brand-dark">
                  Attached Files ({pendingAttachments.length})
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClearAllAttachments}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center"
              >
                <Text className="text-[11px] font-bold text-red-500">Clear All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingVertical: 2 }}
            >
              {pendingAttachments.map((uri, idx) => (
                <View key={idx} className="relative">
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setPreviewImageUri(uri)}
                    className="overflow-hidden rounded-xl border-2 border-primary/40 bg-white"
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: 68, height: 68 }}
                      contentFit="cover"
                      transition={150}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveAttachment(idx)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    style={{ elevation: 2 }}
                    className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-red-500 border-2 border-white items-center justify-center"
                  >
                    <Ionicons name="close" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar */}
        <View
          className="flex-row items-center border-t border-brand-border px-4 py-3 bg-white"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <TouchableOpacity
            onPress={handlePickAttachment}
            className="h-11 w-11 items-center justify-center rounded-full bg-primary/10 mr-2 border border-primary/20"
          >
            <Ionicons name="attach" size={22} color="#14919B" />
          </TouchableOpacity>

          <TextInput
            className="flex-1 min-h-[44px] max-h-[100px] rounded-2xl bg-brand-surface px-4 text-[14px] text-brand-dark border border-brand-border mr-2"
            placeholder="Type a message or note..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: canSend ? "#14919B" : "#E5E7EB",
              elevation: canSend ? 2 : 0,
            }}
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

      {/* Full-screen Image Preview Modal */}
      <Modal
        visible={Boolean(previewImageUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}
      >
        <View className="flex-1 bg-black/95 items-center justify-center relative">
          <TouchableOpacity
            onPress={() => setPreviewImageUri(null)}
            className="absolute top-12 right-6 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {previewImageUri && (
            <Image
              source={{ uri: previewImageUri }}
              style={{ width: "90%", height: "80%" }}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}



