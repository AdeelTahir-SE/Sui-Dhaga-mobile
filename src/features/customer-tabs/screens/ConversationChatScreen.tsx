import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  conversationsApi,
  isAudioAttachment,
} from "../../../api/conversations.api";
import { CONFIG } from "../../../constants/config";
import { useAuthStore } from "../../../stores/auth.store";
import { ConversationItem, MessageItem } from "../../../types/api";
import { VoiceMessagePlayer } from "../components/VoiceMessagePlayer";
import { VoiceRecorderBar } from "../components/VoiceRecorderBar";

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

  // If already local file URI, data URI, content URI, or blob URI
  if (
    uri.startsWith("file://") ||
    uri.startsWith("data:") ||
    uri.startsWith("content://") ||
    uri.startsWith("ph://") ||
    uri.startsWith("blob:")
  ) {
    return uri;
  }

  const base = (CONFIG.API_URL || CONFIG.BACKEND_URL || "").replace(/\/+$/, "");
  const apiPrefix = base.endsWith("/api/v1") ? base : `${base}/api/v1`;

  // If Supabase storage public URL for message-attachments or other buckets
  const supabaseStorageMatch = uri.match(
    /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/,
  );
  if (supabaseStorageMatch) {
    const bucket = supabaseStorageMatch[1];
    const filePath = supabaseStorageMatch[2];
    return `${apiPrefix}/media/${bucket}/${filePath}`;
  }

  // If signed URL or other absolute http/https URL
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  const cleanPath = uri.startsWith("/") ? uri : `/${uri}`;
  if (
    uri.startsWith("message-attachments/") ||
    uri.startsWith("avatars/") ||
    uri.startsWith("designs/") ||
    uri.startsWith("community-posts/")
  ) {
    return `${apiPrefix}/media/${uri}`;
  }

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
      // Handle JSON array string
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            rawList.push(...parsed);
            return;
          }
        } catch {}
      }
      // Handle PostgreSQL array format: {url1,url2}
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        const inner = trimmed.slice(1, -1).trim();
        if (inner) {
          const items = inner
            .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            .map((s) => s.replace(/^"|"$/g, "").trim())
            .filter(Boolean);
          rawList.push(...items);
          return;
        }
      }
      rawList.push(trimmed);
    } else if (typeof cand === "object") {
      const objUri =
        cand.url ||
        cand.uri ||
        cand.fileUrl ||
        cand.file_url ||
        cand.imageUrl ||
        cand.image_url ||
        cand.path ||
        cand.src;
      if (objUri) {
        rawList.push(objUri);
      }
    }
  });

  const resolved = rawList
    .map(resolveMediaUrl)
    .filter((url): url is string =>
      Boolean(url && typeof url === "string" && url.length > 0),
    );

  return Array.from(new Set(resolved));
}

function formatMessageTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function getMessageDateDivider(dateString?: string): string {
  if (!dateString) return "Today";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Today";

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) return "Today";

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return "Yesterday";

    const diffDays = Math.round(
      (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
    );
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "long" });
    }

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Today";
  }
}

const QUICK_SUGGESTIONS = [
  "👋 Hi! I'd like to ask about stitching a custom design.",
  "📏 Can I book a fitting or measurement appointment?",
  "🧵 What is your typical turnaround time?",
  "✨ Do you handle alterations and resizing?",
];

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
    params.tailorId || (isTailor ? currentUser?.id : params.recipientId) || "";

  const resolvedClientId =
    params.clientId || (!isTailor ? currentUser?.id : params.recipientId) || "";

  const [activeConvId, setActiveConvId] = useState<string | null>(
    params.conversationId && params.conversationId !== "new"
      ? params.conversationId
      : null,
  );

  const [conversation, setConversation] = useState<ConversationItem | null>(
    null,
  );
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 200);

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
    [currentUser?.id],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Primary path: Use tailorId and clientId
      if (resolvedTailorId && resolvedClientId) {
        const [convRes, msgsRes] = await Promise.all([
          conversationsApi
            .getConversationBetween(resolvedTailorId, resolvedClientId)
            .catch(() => null),
          conversationsApi
            .getMessagesBetween(resolvedTailorId, resolvedClientId)
            .catch(() => null),
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
      const convId =
        activeConvId ||
        (params.conversationId !== "new" ? params.conversationId : null);
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
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access your gallery is required to send images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
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
          "Permission to access your camera is required to take photos.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
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
    Alert.alert(
      "Send Image / Design File",
      "Choose an option to attach photos or design references:",
      [
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
      ],
    );
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllAttachments = () => {
    setPendingAttachments([]);
  };

  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch {}
    })();
  }, []);

  const handleStartRecording = async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Microphone Permission Required",
          "Permission to access the microphone is required to record voice messages.",
        );
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      try {
        await audioRecorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      } catch (prepErr) {
        // If already prepared, proceed to record
        console.log("prepareToRecordAsync note:", prepErr);
      }

      audioRecorder.record();
      setIsRecording(true);
    } catch (err: any) {
      console.warn("Failed to start voice recording:", err);
      Alert.alert(
        "Recording Error",
        err?.message ||
          "Unable to start voice recording. Please verify microphone permissions.",
      );
      setIsRecording(false);
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch {}
    }
  };

  const handleCancelRecording = async () => {
    try {
      await audioRecorder.stop();
    } catch {}
    setIsRecording(false);
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    } catch {}
  };

  const sendVoiceMessage = async (voiceUri: string) => {
    if (isSending) return;
    setIsSending(true);

    const tempId = "temp_" + Date.now();
    const tempMessage: MessageItem = {
      id: tempId,
      conversationId: activeConvId || "temp",
      senderId: currentUser?.id,
      text: "Voice message",
      attachments: [voiceUri],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let createdMessage: MessageItem | null = null;
      const voiceFileName = `voice_message_${Date.now()}.m4a`;

      const messagePayload = {
        text: "Voice message",
        file: {
          uri: voiceUri,
          name: voiceFileName,
          fileName: voiceFileName,
          type: "audio/m4a",
          mimeType: "audio/m4a",
          fileType: "audio",
        },
        senderId: currentUser?.id,
      };

      if (activeConvId && activeConvId !== "new") {
        const res = await conversationsApi.sendMessage(
          activeConvId,
          messagePayload,
        );
        let rawData: any = res?.data;
        if (rawData && typeof rawData === "object") {
          createdMessage = rawData.message || rawData.data || rawData;
        }
      } else if (resolvedTailorId && resolvedClientId) {
        const res = await conversationsApi.sendMessageBetween(
          resolvedTailorId,
          resolvedClientId,
          messagePayload,
        );
        let rawData: any = res?.data;
        if (rawData && typeof rawData === "object") {
          createdMessage = rawData.message || rawData.data || rawData;
          if ((createdMessage as any)?.conversationId && !activeConvId) {
            setActiveConvId((createdMessage as any).conversationId);
          }
        }
      } else if (params.recipientId) {
        const targetNames = [params.name].filter(Boolean) as string[];
        const startRes = await conversationsApi.getOrCreateConversation(
          params.recipientId,
          undefined,
          currentUser?.id,
          "Voice message",
          targetNames,
        );
        const createdConv =
          (startRes?.data as any)?.conversation || startRes?.data;
        const newId = createdConv?.id || (createdConv as any)?._id;
        if (newId) {
          setActiveConvId(newId);
          if (createdConv) setConversation(createdConv);
          const sendRes = await conversationsApi.sendMessage(
            newId,
            messagePayload,
          );
          let rawData: any = sendRes?.data;
          if (rawData && typeof rawData === "object") {
            createdMessage = rawData.message || rawData.data || rawData;
          }
        }
      }

      if (createdMessage) {
        const backendAttachments = extractMessageAttachments(createdMessage);
        const finalAttachments =
          backendAttachments.length > 0 ? backendAttachments : [voiceUri];

        const finalMsg: MessageItem = {
          ...createdMessage,
          id:
            createdMessage.id || (createdMessage as any)._id || tempMessage.id,
          attachments: finalAttachments,
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? finalMsg : m)),
        );
      }
    } catch (err: any) {
      console.warn("Failed to send voice message:", err);
      // Rollback optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      Alert.alert(
        "Upload Failed",
        err?.message ||
          "Failed to send voice message. Please check your internet connection.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendRecording = async () => {
    if (!isRecording) return;
    try {
      setIsRecording(false);
      const stopResult = await audioRecorder.stop();
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch {}
      const recordedUri =
        audioRecorder.uri ||
        (stopResult as any)?.uri ||
        (stopResult as any)?.url;
      if (recordedUri) {
        await sendVoiceMessage(recordedUri);
      } else {
        Alert.alert("Voice Recording", "No audio recorded. Please try again.");
      }
    } catch (err: any) {
      console.warn("Failed to stop and send recording:", err);
      setIsRecording(false);
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch {}
      Alert.alert(
        "Voice Recording",
        err?.message || "Unable to save audio recording.",
      );
    }
  };

  const handleSend = async () => {
    const textToSend = inputText.trim();
    const attachmentsToSend = [...pendingAttachments];
    if ((!textToSend && attachmentsToSend.length === 0) || isSending) return;

    setInputText("");
    setPendingAttachments([]);
    setIsSending(true);

    const tempId = "temp_" + Date.now();
    // Optimistic message
    const tempMessage: MessageItem = {
      id: tempId,
      conversationId: activeConvId || "temp",
      senderId: currentUser?.id,
      text:
        textToSend ||
        (attachmentsToSend.length > 0 ? "Sent an attachment" : ""),
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
        text:
          textToSend ||
          (attachmentsToSend.length > 0
            ? "Check out this attachment"
            : "Hello"),
        file: firstFileUri ? { uri: firstFileUri } : undefined,
        files: attachmentsToSend.map((u) => ({ uri: u })),
        senderId: currentUser?.id,
      };

      // 1. If conversationId is known, send directly to POST /conversations/:conversationId/messages with multipart/form-data
      if (activeConvId && activeConvId !== "new") {
        const res = await conversationsApi.sendMessage(
          activeConvId,
          messagePayload,
        );
        let rawData: any = res?.data;
        if (rawData && typeof rawData === "object") {
          createdMessage = rawData.message || rawData.data || rawData;
        }
      } else if (resolvedTailorId && resolvedClientId) {
        // 2. Send using tailorId and clientId
        const res = await conversationsApi.sendMessageBetween(
          resolvedTailorId,
          resolvedClientId,
          messagePayload,
        );
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
          targetNames,
        );
        const createdConv =
          (startRes?.data as any)?.conversation || startRes?.data;
        const newId = createdConv?.id || (createdConv as any)?._id;
        if (newId) {
          setActiveConvId(newId);
          if (createdConv) setConversation(createdConv);
          if (attachmentsToSend.length > 0) {
            const sendRes = await conversationsApi.sendMessage(
              newId,
              messagePayload,
            );
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
          id:
            createdMessage.id || (createdMessage as any)._id || tempMessage.id,
          attachments: finalAttachments,
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? finalMsg : m)),
        );
      }
    } catch (err: any) {
      console.warn("Failed to send message:", err);
      // Rollback optimistic message on error and restore input
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      if (textToSend) setInputText(textToSend);
      if (attachmentsToSend.length > 0)
        setPendingAttachments(attachmentsToSend);
      Alert.alert(
        "Upload Failed",
        err?.message ||
          "Failed to upload attachments. Please check your internet connection.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const curUserId = currentUser?.id ? String(currentUser.id).toLowerCase() : "";
  const resolvedOtherParticipant =
    conversation?.participant ||
    (conversation?.participant1 && conversation?.participant2
      ? String(
          conversation.participant1.id ||
            conversation.participant1._id ||
            conversation.participant1_id ||
            "",
        ).toLowerCase() === curUserId
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

  const canSend =
    (inputText.trim().length > 0 || pendingAttachments.length > 0) &&
    !isSending;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Enhanced Header */}
      <View className="flex-row items-center justify-between border-b border-slate-200/80 px-3.5 py-2.5 bg-white shadow-xs">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-9 h-9 items-center justify-center rounded-full bg-slate-50 border border-slate-200/70 mr-2 active:bg-slate-100"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={resolvedTailorId && !isTailor ? 0.75 : 1}
            onPress={() => {
              if (resolvedTailorId && !isTailor) {
                router.push(`/tailors/${resolvedTailorId}` as any);
              }
            }}
            className="flex-row items-center flex-1 mr-2"
          >
            <View className="relative mr-2.5">
              <View
                style={{ width: 40, height: 40, borderRadius: 20 }}
                className="overflow-hidden items-center justify-center border border-slate-200 bg-slate-50 shadow-xs"
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
                    className="w-full h-full bg-[#E0F7F7] items-center justify-center"
                  >
                    <Text className="text-[15px] font-bold text-[#14919B]">
                      {participantName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              {/* Online Indicator Badge */}
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 11,
                  height: 11,
                  borderRadius: 5.5,
                  backgroundColor: "#10B981",
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                }}
              />
            </View>

            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="text-[15px] font-bold text-slate-900 tracking-tight"
              >
                {participantName}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                <Text className="text-[11px] font-medium text-emerald-600">
                  Online • Active now
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Header Right Actions */}
        <View className="flex-row items-center gap-1.5">
          {resolvedTailorId && !isTailor && (
            <TouchableOpacity
              onPress={() => router.push(`/tailors/${resolvedTailorId}` as any)}
              className="w-9 h-9 items-center justify-center rounded-full bg-slate-50 border border-slate-200/70 active:bg-slate-100"
              accessibilityLabel="View tailor profile"
            >
              <Ionicons name="storefront-outline" size={17} color="#14919B" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setIsActionSheetVisible(true)}
            className="w-9 h-9 items-center justify-center rounded-full bg-slate-50 border border-slate-200/70 active:bg-slate-100"
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-vertical" size={17} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-[#F8FAFC]"
      >
        {/* Message List */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 bg-[#F8FAFC] px-4 py-3"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: messages.length === 0 ? "center" : "flex-end",
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
        >
          {isLoading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#14919B" />
              <Text className="mt-3 text-[13px] font-medium text-slate-400">
                Loading messages...
              </Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="py-8 items-center justify-center px-4 max-w-[360px] self-center">
              {/* Avatar with soft glow */}
              <View className="relative mb-3">
                <View
                  style={{ width: 68, height: 68, borderRadius: 34 }}
                  className="overflow-hidden items-center justify-center border-2 border-[#14919B]/30 bg-white shadow-sm"
                >
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={{ width: 68, height: 68, borderRadius: 34 }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View className="w-full h-full bg-[#E0F7F7] items-center justify-center">
                      <Ionicons name="chatbubbles" size={30} color="#14919B" />
                    </View>
                  )}
                </View>
                <View
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 15,
                    height: 15,
                    borderRadius: 7.5,
                    backgroundColor: "#10B981",
                    borderWidth: 2,
                    borderColor: "#FFFFFF",
                  }}
                />
              </View>

              <Text className="text-[17px] font-bold text-slate-900 text-center tracking-tight">
                {participantName}
              </Text>
              <Text className="text-[12px] text-slate-500 text-center mt-1 leading-5">
                Send a message to discuss your outfit designs, fittings, alterations, or custom tailoring inquiries.
              </Text>

              {/* Quick suggestions */}
              <View className="w-full mt-6 gap-2">
                <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 text-center">
                  Quick conversation starters
                </Text>
                {QUICK_SUGGESTIONS.map((prompt, pIdx) => (
                  <TouchableOpacity
                    key={pIdx}
                    activeOpacity={0.75}
                    onPress={() => setInputText(prompt)}
                    className="flex-row items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs active:bg-slate-50"
                  >
                    <Text className="text-[13px] font-medium text-slate-700 flex-1 pr-2">
                      {prompt}
                    </Text>
                    <Ionicons name="arrow-forward" size={15} color="#14919B" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((item, idx) => {
              const curId = currentUser?.id
                ? String(currentUser.id).toLowerCase()
                : "";
              const senderId = (
                item.senderId ||
                (item as any).sender_id ||
                (item as any).sender?.id ||
                (item as any).sender?._id ||
                (item as any).userId ||
                (item as any).user_id ||
                ""
              )
                .toString()
                .toLowerCase();

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

              const itemDate = item.createdAt || (item as any).created_at;
              const currDateDivider = getMessageDateDivider(itemDate);
              const prevItem = idx > 0 ? messages[idx - 1] : null;
              const prevDate = prevItem
                ? prevItem.createdAt || (prevItem as any).created_at
                : null;
              const prevDateDivider = prevDate
                ? getMessageDateDivider(prevDate)
                : null;
              const showDateDivider =
                idx === 0 || currDateDivider !== prevDateDivider;

              // Check if next message is from same sender to group tightly
              const nextItem =
                idx < messages.length - 1 ? messages[idx + 1] : null;
              const nextSenderId = (
                nextItem?.senderId ||
                (nextItem as any)?.sender_id ||
                (nextItem as any)?.sender?.id ||
                ""
              )
                .toString()
                .toLowerCase();
              const nextIsOutgoing =
                nextItem &&
                ((curId && nextSenderId === curId) ||
                  (nextItem.id && String(nextItem.id).startsWith("temp_")) ||
                  (nextItem as any).isSender === true ||
                  (nextItem as any).is_sender === true);
              const isSameSenderAsNext =
                nextItem && isOutgoing === nextIsOutgoing;

              const formattedTime = formatMessageTime(itemDate);

              return (
                <View key={item.id || idx}>
                  {/* Floating Date Divider */}
                  {showDateDivider && (
                    <View className="items-center my-3">
                      <View className="px-3 py-1 rounded-full bg-slate-200/80 border border-slate-300/40 shadow-2xs">
                        <Text className="text-[11px] font-semibold text-slate-600 tracking-wide">
                          {currDateDivider}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View
                    className={
                      isOutgoing
                        ? "flex-row items-end justify-end self-end max-w-[85%]"
                        : "flex-row items-end justify-start self-start max-w-[85%]"
                    }
                    style={{ marginBottom: isSameSenderAsNext ? 3 : 10 }}
                  >
                    {/* Incoming person avatar (only on the last message in a consecutive group) */}
                    {!isOutgoing && (
                      <View
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                        className="overflow-hidden mr-2 mb-0.5 items-center justify-center border border-slate-200 bg-slate-50"
                      >
                        {!isSameSenderAsNext ? (
                          messageAvatar ? (
                            <Image
                              source={{ uri: messageAvatar }}
                              style={{ width: 28, height: 28, borderRadius: 14 }}
                              contentFit="cover"
                              transition={200}
                            />
                          ) : (
                            <View
                              style={{ width: 28, height: 28, borderRadius: 14 }}
                              className="w-full h-full bg-[#E0F7F7] items-center justify-center"
                            >
                              <Text className="text-[11px] font-bold text-[#14919B]">
                                {participantName.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )
                        ) : (
                          <View style={{ width: 28, height: 28 }} />
                        )}
                      </View>
                    )}

                    {/* Message Bubble */}
                    <View
                      className={
                        isOutgoing
                          ? "rounded-2xl px-3.5 py-2.5 bg-[#14919B] shadow-xs rounded-tr-xs"
                          : "rounded-2xl px-3.5 py-2.5 bg-white border border-slate-200/90 shadow-xs rounded-tl-xs"
                      }
                    >
                      {attachments.length > 0 && (
                        <View className="mb-1.5 gap-2">
                          {attachments.map((attUri: string, attIdx: number) => {
                            const isAudio = isAudioAttachment(attUri);
                            if (isAudio) {
                              return (
                                <VoiceMessagePlayer
                                  key={attIdx}
                                  uri={attUri}
                                  isOutgoing={isOutgoing}
                                />
                              );
                            }
                            return (
                              <TouchableOpacity
                                key={attIdx}
                                activeOpacity={0.9}
                                onPress={() => setPreviewImageUri(attUri)}
                                style={{
                                  borderRadius: 12,
                                  overflow: "hidden",
                                  backgroundColor: isOutgoing
                                    ? "rgba(255,255,255,0.15)"
                                    : "#F3F4F6",
                                }}
                              >
                                <Image
                                  source={{ uri: attUri }}
                                  style={{
                                    width: 220,
                                    height: 160,
                                    borderRadius: 12,
                                  }}
                                  contentFit="cover"
                                  transition={200}
                                  cachePolicy="memory-disk"
                                />
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}

                      {text &&
                      (!attachments.some(isAudioAttachment) ||
                        (text !== "Voice message" &&
                          text !== "Sent an attachment")) ? (
                        <Text
                          className={
                            isOutgoing
                              ? "text-[14px] leading-5 text-white font-normal"
                              : "text-[14px] leading-5 text-slate-800 font-normal"
                          }
                        >
                          {text}
                        </Text>
                      ) : null}

                      {/* Timestamp & Status Footer */}
                      <View
                        className={
                          isOutgoing
                            ? "flex-row items-center justify-end mt-1 self-end gap-1"
                            : "flex-row items-center justify-end mt-1 self-end"
                        }
                      >
                        {formattedTime ? (
                          <Text
                            className={
                              isOutgoing
                                ? "text-[10px] font-medium text-teal-100/80"
                                : "text-[10px] font-medium text-slate-400"
                            }
                          >
                            {formattedTime}
                          </Text>
                        ) : null}
                        {isOutgoing && (
                          <Ionicons
                            name={item.isRead ? "checkmark-done" : "checkmark"}
                            size={13}
                            color={item.isRead ? "#6EE7B7" : "#CCFBF1"}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Enhanced Pending Attachments Preview Bar */}
        {pendingAttachments.length > 0 && (
          <View className="border-t border-slate-200 bg-[#F8FAFB] px-4 py-2.5">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="images" size={15} color="#14919B" />
                <Text className="ml-1.5 text-[12px] font-bold text-slate-800">
                  Attached Files ({pendingAttachments.length})
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClearAllAttachments}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center"
              >
                <Text className="text-[11px] font-bold text-red-500">
                  Clear All
                </Text>
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

        {/* Modern Input Bar */}
        <View
          className="flex-row items-center border-t border-slate-200/80 px-3 py-2.5 bg-white shadow-md"
          style={{ paddingBottom: Math.max(insets.bottom, 10) }}
        >
          {isRecording ? (
            <VoiceRecorderBar
              durationMillis={recorderState.durationMillis}
              onCancel={handleCancelRecording}
              onSend={handleSendRecording}
              isSending={isSending}
            />
          ) : (
            <>
              {/* Attachment Picker Button */}
              <TouchableOpacity
                onPress={handlePickAttachment}
                activeOpacity={0.75}
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200/70 mr-1.5 active:bg-slate-200"
                accessibilityLabel="Add attachment"
              >
                <Ionicons name="add" size={22} color="#14919B" />
              </TouchableOpacity>

              {/* Quick Camera Button */}
              <TouchableOpacity
                onPress={handleTakePhoto}
                activeOpacity={0.75}
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200/70 mr-2 active:bg-slate-200"
                accessibilityLabel="Take photo"
              >
                <Ionicons name="camera-outline" size={19} color="#64748B" />
              </TouchableOpacity>

              {/* Text Input Box */}
              <TextInput
                className="flex-1 min-h-[42px] max-h-[110px] rounded-2xl bg-slate-100 px-4 py-2 text-[14px] text-slate-800 border border-slate-200/70 mr-2"
                placeholder="Type a message..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />

              {/* Send or Mic Button */}
              {!inputText.trim() && pendingAttachments.length === 0 ? (
                <TouchableOpacity
                  onPress={handleStartRecording}
                  disabled={isSending}
                  activeOpacity={0.85}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#14919B",
                  }}
                  className="shadow-sm active:bg-[#0D7377]"
                  accessibilityLabel="Record voice message"
                >
                  <Ionicons name="mic" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!canSend}
                  activeOpacity={0.85}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: canSend ? "#14919B" : "#E2E8F0",
                  }}
                  className="shadow-sm"
                  accessibilityLabel="Send message"
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name="send"
                      size={18}
                      color={canSend ? "#FFFFFF" : "#94A3B8"}
                    />
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Options Action Sheet Modal */}
      <Modal
        visible={isActionSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsActionSheetVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsActionSheetVisible(false)}
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
        >
          <View className="rounded-t-[28px] bg-white px-5 pb-8 pt-3 shadow-2xl">
            <View className="h-1.5 w-12 rounded-full bg-slate-200 self-center mb-4 mt-1" />

            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <View>
                <Text className="text-[16px] font-bold text-slate-900">
                  {participantName}
                </Text>
                <Text className="text-[12px] text-slate-500 font-medium">
                  Conversation Options
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsActionSheetVisible(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <Ionicons name="close" size={17} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="gap-2 py-2">
              {resolvedTailorId && !isTailor && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsActionSheetVisible(false);
                    router.push(`/tailors/${resolvedTailorId}` as any);
                  }}
                  className="flex-row items-center p-3.5 rounded-xl bg-slate-50 active:bg-slate-100"
                >
                  <View className="w-10 h-10 rounded-full bg-[#E0F7F7] items-center justify-center mr-3">
                    <Ionicons name="storefront" size={19} color="#14919B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14px] font-bold text-slate-900">
                      View Tailor Profile
                    </Text>
                    <Text className="text-[12px] text-slate-500">
                      Explore services, ratings, and studio info
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#94A3B8" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setIsActionSheetVisible(false);
                  handlePickAttachment();
                }}
                className="flex-row items-center p-3.5 rounded-xl bg-slate-50 active:bg-slate-100"
              >
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name="images" size={19} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-slate-900">
                    Send Photos & Designs
                  </Text>
                  <Text className="text-[12px] text-slate-500">
                    Share reference images or outfit styles
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setIsActionSheetVisible(false);
                  loadData();
                }}
                className="flex-row items-center p-3.5 rounded-xl bg-slate-50 active:bg-slate-100"
              >
                <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
                  <Ionicons name="refresh" size={19} color="#475569" />
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-slate-900">
                    Refresh Messages
                  </Text>
                  <Text className="text-[12px] text-slate-500">
                    Check for latest replies and updates
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

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
