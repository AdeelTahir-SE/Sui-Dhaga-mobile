import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

const skinTexture = require("@/assets/texture/white-texture.png");

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
import { AnimatedDustbin } from "../components/AnimatedDustbin";
import { AudioWaveformBar } from "../components/AudioWaveformBar";
import {
  subscribeToConversation,
  unsubscribeChannel,
} from "../../../services/supabase";

function formatMillis(ms: number): string {
  const totalSeconds = Math.floor((ms || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

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
      (now.getTime() - date.getTime()) / (1000 * 3600 * 24),
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
  "🛍️ I would like to place a custom tailoring order",
  "👗 What is your price estimate for an Anarkali suit?",
  "⏱️ How many days will stitching a bridal lehenga take?",
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
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isNearTrash, setIsNearTrash] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const previousContentHeightRef = useRef<number>(0);
  const isPrependScrollAdjustRef = useRef<boolean>(false);
  const hasInitiallyScrolledRef = useRef<boolean>(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 200);

  // WhatsApp-style Voice Recording Refs & Animated Values
  const isHoldingVoiceRef = useRef(false);
  const isLockedRef = useRef(false);
  const isNearTrashRef = useRef(false);
  const isCancelingRef = useRef(false);
  const recordingStartTimeRef = useRef(0);
  const isStartingRecordingRef = useRef(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const micScaleAnim = useRef(new Animated.Value(1)).current;
  const micTranslateX = useRef(new Animated.Value(0)).current;
  const micTranslateY = useRef(new Animated.Value(0)).current;
  const micRippleAnim = useRef(new Animated.Value(0)).current;
  const lockSlideAnim = useRef(new Animated.Value(0)).current;
  const lockPillScale = useRef(new Animated.Value(1)).current;
  const trashLidAnim = useRef(new Animated.Value(0)).current;
  const trashScaleAnim = useRef(new Animated.Value(1)).current;
  const trashShakeAnim = useRef(new Animated.Value(0)).current;
  const recordingPulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for recording dot
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulseAnim, {
            toValue: 0.25,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();
    } else {
      recordingPulseAnim.setValue(1);
    }
    return () => {
      pulseLoop?.stop();
    };
  }, [isRecording, recordingPulseAnim]);

  // Pulsing expanding ripple aura while holding mic to record
  useEffect(() => {
    let rippleLoop: Animated.CompositeAnimation | null = null;
    if (isRecording && !isLocked) {
      rippleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(micRippleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(micRippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      rippleLoop.start();
    } else {
      micRippleAnim.setValue(0);
    }
    return () => {
      rippleLoop?.stop();
    };
  }, [isRecording, isLocked, micRippleAnim]);

  // Floating bounce animation for lock pill above the mic
  useEffect(() => {
    let lockLoop: Animated.CompositeAnimation | null = null;
    if (isRecording && !isLocked) {
      lockLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(lockSlideAnim, {
            toValue: -6,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(lockSlideAnim, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      );
      lockLoop.start();
    } else {
      lockSlideAnim.setValue(0);
    }
    return () => {
      lockLoop?.stop();
    };
  }, [isRecording, isLocked, lockSlideAnim]);

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
    hasInitiallyScrolledRef.current = false;
    try {
      // 1. Primary path: Use tailorId and clientId
      if (resolvedTailorId && resolvedClientId) {
        const [convRes, msgsRes] = await Promise.all([
          conversationsApi
            .getConversationBetween(resolvedTailorId, resolvedClientId)
            .catch(() => null),
          conversationsApi
            .getMessagesBetween(resolvedTailorId, resolvedClientId, { limit: 20 })
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
          setHasMore(Boolean(msgsRes.hasMore));
          markUnreadMessagesAsRead(msgsRes.data);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 100);
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
          conversationsApi.getMessages(convId, { limit: 20 }).catch(() => null),
        ]);

        if (convRes?.data) setConversation(convRes.data);
        if (msgsRes?.data && Array.isArray(msgsRes.data)) {
          setMessages(msgsRes.data);
          setHasMore(Boolean(msgsRes.hasMore));
          markUnreadMessagesAsRead(msgsRes.data);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 100);
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

  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMore || messages.length === 0) return;
    setIsLoadingOlder(true);

    const oldestMsg = messages[0];
    const beforeCursor = oldestMsg.createdAt || (oldestMsg as any).created_at;

    try {
      let res: any = null;
      if (resolvedTailorId && resolvedClientId) {
        res = await conversationsApi.getMessagesBetween(
          resolvedTailorId,
          resolvedClientId,
          { limit: 20, before: beforeCursor }
        );
      } else {
        const convId =
          activeConvId ||
          (params.conversationId !== "new" ? params.conversationId : null);
        if (convId) {
          res = await conversationsApi.getMessages(convId, {
            limit: 20,
            before: beforeCursor,
          });
        }
      }

      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const olderBatch: MessageItem[] = res.data;
        setHasMore(Boolean(res.hasMore));

        // Deduplicate against existing messages
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => String(m.id || "")));
          const uniqueOlder = olderBatch.filter(
            (m) => !existingIds.has(String(m.id || ""))
          );
          if (uniqueOlder.length === 0) return prev;
          isPrependScrollAdjustRef.current = true;
          return [...uniqueOlder, ...prev];
        });
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn("Failed to load older messages:", err);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [
    isLoadingOlder,
    hasMore,
    messages,
    resolvedTailorId,
    resolvedClientId,
    activeConvId,
    params.conversationId,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Supabase Realtime Subscription for live incoming messages
  useEffect(() => {
    if (!activeConvId || activeConvId === "new") return;

    let channel: any = null;
    let isMounted = true;

    subscribeToConversation(activeConvId, {
      onInsert: (newRecord) => {
        if (!isMounted || !newRecord) return;
        setMessages((prev) => {
          const curId = currentUser?.id
            ? String(currentUser.id).toLowerCase()
            : "";
          const senderId = (
            newRecord.sender_id ||
            newRecord.senderId ||
            ""
          )
            .toString()
            .toLowerCase();
          const isFromSelf = curId && senderId === curId;

          // Check if message ID already exists
          const exists = prev.some(
            (m) => String(m.id) === String(newRecord.id)
          );
          if (exists) return prev;

          // If from current user, reconcile with optimistic temp message
          if (isFromSelf) {
            const tempIdx = prev.findIndex(
              (m) =>
                String(m.id).startsWith("temp_") &&
                m.text === newRecord.text
            );
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = {
                ...updated[tempIdx],
                ...newRecord,
                id: newRecord.id,
                conversationId:
                  newRecord.conversation_id || newRecord.conversationId,
                senderId: newRecord.sender_id || newRecord.senderId,
                attachments: newRecord.attachments,
                createdAt:
                  newRecord.created_at || newRecord.createdAt,
              };
              return updated;
            }
          }

          const formattedMsg: MessageItem = {
            id: newRecord.id,
            conversationId:
              newRecord.conversation_id || newRecord.conversationId,
            senderId: newRecord.sender_id || newRecord.senderId,
            text: newRecord.text || "",
            attachments: newRecord.attachments || [],
            isRead: newRecord.is_read ?? newRecord.isRead ?? false,
            createdAt:
              newRecord.created_at ||
              newRecord.createdAt ||
              new Date().toISOString(),
          };

          if (!isFromSelf) {
            conversationsApi.markAsRead(newRecord.id).catch(() => {});
          }

          return [...prev, formattedMsg];
        });

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 80);
      },

      onUpdate: (updatedRecord) => {
        if (!isMounted || !updatedRecord) return;
        setMessages((prev) =>
          prev.map((m) => {
            if (String(m.id) === String(updatedRecord.id)) {
              return {
                ...m,
                ...updatedRecord,
                isRead:
                  updatedRecord.is_read ??
                  updatedRecord.isRead ??
                  m.isRead,
                attachments:
                  updatedRecord.attachments ?? m.attachments,
                text: updatedRecord.text ?? m.text,
              };
            }
            return m;
          })
        );
      },

      onDelete: (oldRecord) => {
        if (!isMounted || !oldRecord) return;
        setMessages((prev) =>
          prev.filter((m) => String(m.id) !== String(oldRecord.id))
        );
      },
    }).then((sub) => {
      if (isMounted) {
        channel = sub;
      } else if (sub) {
        unsubscribeChannel(sub);
      }
    });

    return () => {
      isMounted = false;
      if (channel) {
        unsubscribeChannel(channel);
      }
    };
  }, [activeConvId, currentUser?.id]);

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

  const handleStartRecording = async () => {
    if (isStartingRecordingRef.current) return;
    isStartingRecordingRef.current = true;
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Microphone Permission Required",
          "Permission to access the microphone is required to record voice messages.",
        );
        isHoldingVoiceRef.current = false;
        Animated.spring(micScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      try {
        await audioRecorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      } catch (prepErr) {
        console.log("prepareToRecordAsync note:", prepErr);
      }

      if (!isHoldingVoiceRef.current) {
        try {
          await setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: false,
          });
        } catch {}
        return;
      }

      audioRecorder.record();
      setIsRecording(true);
      try {
        Vibration.vibrate(40);
      } catch {}
    } catch (err: any) {
      console.warn("Failed to start voice recording:", err);
      setIsRecording(false);
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch {}
    } finally {
      isStartingRecordingRef.current = false;
    }
  };

  const handleCancelRecording = async () => {
    isHoldingVoiceRef.current = false;
    isLockedRef.current = false;
    isNearTrashRef.current = false;
    isCancelingRef.current = false;
    setIsLocked(false);
    setIsNearTrash(false);
    setIsRecording(false);

    micScaleAnim.setValue(1);
    micTranslateX.setValue(0);
    micTranslateY.setValue(0);
    trashLidAnim.setValue(0);
    trashScaleAnim.setValue(1);
    trashShakeAnim.setValue(0);
    slideAnim.setValue(0);

    try {
      await audioRecorder.stop();
    } catch {}
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    } catch {}
  };

  const handleSendRecording = async () => {
    isHoldingVoiceRef.current = false;
    isLockedRef.current = false;
    isNearTrashRef.current = false;
    isCancelingRef.current = false;
    setIsLocked(false);
    setIsNearTrash(false);
    setIsRecording(false);

    micScaleAnim.setValue(1);
    micTranslateX.setValue(0);
    micTranslateY.setValue(0);
    trashLidAnim.setValue(0);
    trashScaleAnim.setValue(1);
    trashShakeAnim.setValue(0);
    slideAnim.setValue(0);

    try {
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
      }
    } catch (err: any) {
      console.warn("Failed to stop and send recording:", err);
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: false,
        });
      } catch {}
    }
  };

  const triggerDeleteAnimation = (onComplete: () => void) => {
    isCancelingRef.current = true;
    try {
      Vibration.vibrate([0, 35, 45, 60]);
    } catch {}

    // 1. Mic drops/flies into dustbin while shrinking
    Animated.parallel([
      Animated.timing(micTranslateX, {
        toValue: -130,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(micTranslateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(micScaleAnim, {
        toValue: 0.15,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Dustbin lid snaps shut tightly
      Animated.spring(trashLidAnim, {
        toValue: 0,
        friction: 8,
        tension: 130,
        useNativeDriver: true,
      }).start();

      // 3. Dustbin shakes left-right to confirm trash eaten
      Animated.sequence([
        Animated.timing(trashShakeAnim, { toValue: -6, duration: 40, useNativeDriver: true }),
        Animated.timing(trashShakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
        Animated.timing(trashShakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
        Animated.timing(trashShakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(trashShakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start(() => {
        onComplete();
      });
    });
  };

  const micPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isLockedRef.current && !isSending,
      onMoveShouldSetPanResponder: () => !isLockedRef.current && !isSending,
      onPanResponderGrant: () => {
        if (isSending || isLockedRef.current || isCancelingRef.current) return;
        isHoldingVoiceRef.current = true;
        isNearTrashRef.current = false;
        setIsNearTrash(false);
        recordingStartTimeRef.current = Date.now();

        micTranslateX.setValue(0);
        micTranslateY.setValue(0);
        trashLidAnim.setValue(0);
        trashScaleAnim.setValue(1);
        trashShakeAnim.setValue(0);

        // Substantial spring scale up (1.75x) with bounciness
        Animated.spring(micScaleAnim, {
          toValue: 1.75,
          friction: 4,
          tension: 70,
          useNativeDriver: true,
        }).start();

        handleStartRecording();
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isHoldingVoiceRef.current || isLockedRef.current || isCancelingRef.current) return;

        // 1. Check Scroll UP to LOCK (dy <= -70)
        if (gestureState.dy <= -70) {
          isLockedRef.current = true;
          isHoldingVoiceRef.current = false;
          setIsLocked(true);

          try {
            Vibration.vibrate(60);
          } catch {}

          // Smoothly snap mic back to normal position and scale
          Animated.parallel([
            Animated.spring(micScaleAnim, {
              toValue: 1,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.spring(micTranslateX, {
              toValue: 0,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.spring(micTranslateY, {
              toValue: 0,
              friction: 6,
              useNativeDriver: true,
            }),
          ]).start();
          return;
        }

        // Track vertical move slightly upwards if dy < 0
        const clampedDy = Math.max(-65, Math.min(0, gestureState.dy));
        micTranslateY.setValue(clampedDy);

        // 2. Check Slide LEFT towards DUSTBIN (dx < 0)
        const clampedDx = Math.max(-140, Math.min(0, gestureState.dx));
        micTranslateX.setValue(clampedDx);
        slideAnim.setValue(clampedDx);

        // Dustbin proximity threshold: lid opens!
        if (gestureState.dx <= -60) {
          if (!isNearTrashRef.current) {
            isNearTrashRef.current = true;
            setIsNearTrash(true);
            try {
              Vibration.vibrate(35);
            } catch {}
            // Dustbin lid opens up!
            Animated.spring(trashLidAnim, {
              toValue: 1,
              friction: 5,
              tension: 75,
              useNativeDriver: true,
            }).start();
            Animated.spring(trashScaleAnim, {
              toValue: 1.35,
              friction: 4,
              useNativeDriver: true,
            }).start();
          }
        } else if (gestureState.dx > -45) {
          if (isNearTrashRef.current) {
            isNearTrashRef.current = false;
            setIsNearTrash(false);
            // Dustbin lid closes
            Animated.spring(trashLidAnim, {
              toValue: 0,
              friction: 6,
              useNativeDriver: true,
            }).start();
            Animated.spring(trashScaleAnim, {
              toValue: 1,
              friction: 5,
              useNativeDriver: true,
            }).start();
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isCancelingRef.current) return;

        // If user already locked, release is hands-free, do nothing
        if (isLockedRef.current) return;

        if (!isHoldingVoiceRef.current) return;
        isHoldingVoiceRef.current = false;

        // Check if released near dustbin -> delete animation!
        if (isNearTrashRef.current || gestureState.dx <= -70) {
          triggerDeleteAnimation(() => {
            handleCancelRecording();
          });
          return;
        }

        // Tap vs hold duration check
        const duration = Date.now() - recordingStartTimeRef.current;
        if (duration < 500) {
          Animated.spring(micScaleAnim, { toValue: 1, useNativeDriver: true }).start();
          Animated.spring(micTranslateX, { toValue: 0, useNativeDriver: true }).start();
          Animated.spring(micTranslateY, { toValue: 0, useNativeDriver: true }).start();
          handleCancelRecording();
          Alert.alert(
            "Voice Message",
            "Hold to record. Slide up to lock, or slide left to the dustbin to cancel.",
            [{ text: "Got it" }],
          );
          return;
        }

        // Normal release -> send recording!
        Animated.spring(micScaleAnim, { toValue: 1, useNativeDriver: true }).start();
        Animated.spring(micTranslateX, { toValue: 0, useNativeDriver: true }).start();
        Animated.spring(micTranslateY, { toValue: 0, useNativeDriver: true }).start();
        handleSendRecording();
      },
      onPanResponderTerminate: () => {
        if (isHoldingVoiceRef.current && !isLockedRef.current && !isCancelingRef.current) {
          handleCancelRecording();
        }
      },
    }),
  ).current;

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

  const handleGoToCreateOrder = () => {
    router.push({
      pathname: "/orders/create",
      params: {
        tailorId: resolvedTailorId || "1",
        tailorName: participantName || "Tailor",
        avatar: avatarUrl || "",
        conversationId: activeConvId || params.conversationId || "",
      },
    } as any);
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#FAF8F5", paddingTop: insets.top }}
    >
      {/* Enhanced Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#EAE5DD",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#EAE5DD",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={20} color="#1A1D1F" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={resolvedTailorId && !isTailor ? 0.75 : 1}
            onPress={() => {
              if (resolvedTailorId && !isTailor) {
                router.push(`/tailors/${resolvedTailorId}` as any);
              }
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              marginRight: 6,
            }}
          >
            <View style={{ position: "relative", marginRight: 10 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#EAE5DD",
                  backgroundColor: "#FFFFFF",
                }}
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
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#E0F7F7",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "800",
                        color: "#14919B",
                      }}
                    >
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

            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: "#1A1D1F",
                  letterSpacing: -0.2,
                }}
              >
                {participantName}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Header Right Actions */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {resolvedTailorId && !isTailor && (
            <TouchableOpacity
              onPress={() => router.push(`/tailors/${resolvedTailorId}` as any)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#EAE5DD",
                alignItems: "center",
                justifyContent: "center",
              }}
              accessibilityLabel="View tailor profile"
            >
              <Ionicons name="storefront-outline" size={16} color="#14919B" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setIsActionSheetVisible(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#EAE5DD",
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-vertical" size={16} color="#6F767E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pinned Order Action Banner below Header */}
      {!isTailor && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#EAE5DD",
            paddingHorizontal: 14,
            paddingVertical: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              marginRight: 10,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#E0F7F7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 9,
              }}
            >
              <Ionicons name="bag-handle" size={16} color="#14919B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 13, fontWeight: "700", color: "#1A1D1F" }}
              >
                Custom Tailoring Order
              </Text>
              <Text
                numberOfLines={1}
                style={{ fontSize: 11, color: "#6F767E", marginTop: 1 }}
              >
                Send measurements & get outfit stitched
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleGoToCreateOrder}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#14919B",
              paddingHorizontal: 13,
              paddingVertical: 7.5,
              borderRadius: 18,
              shadowColor: "#14919B",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 2,
            }}
            accessibilityLabel="Place Order"
          >
            <Ionicons name="bag-check" size={14} color="#FFFFFF" />
            <Text
              style={{
                marginLeft: 5,
                fontSize: 12,
                fontWeight: "800",
                color: "#FFFFFF",
                letterSpacing: 0.2,
              }}
            >
              Place Order
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "#FAF8F5" }}
      >
        {/* Message List Section with Repeated Texture Background */}
        <View style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <RNImage
              source={skinTexture}
              resizeMode="repeat"
              style={[
                StyleSheet.absoluteFill,
                {
                  width: "100%",
                  height: "100%",
                },
              ]}
            />
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              paddingHorizontal: 16,
            }}
            contentContainerStyle={{
              paddingVertical: 12,
              flexGrow: 1,
              justifyContent: messages.length === 0 ? "center" : "flex-end",
            }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              if (
                offsetY <= 30 &&
                !isLoadingOlder &&
                hasMore &&
                !isLoading &&
                messages.length > 0
              ) {
                loadOlderMessages();
              }
            }}
            maintainVisibleContentPosition={{
              minIndexForVisible: 1,
            }}
            onContentSizeChange={(_contentWidth, contentHeight) => {
              if (isPrependScrollAdjustRef.current) {
                isPrependScrollAdjustRef.current = false;
                const heightDiff =
                  contentHeight - previousContentHeightRef.current;
                if (heightDiff > 0) {
                  scrollViewRef.current?.scrollTo({
                    y: heightDiff,
                    animated: false,
                  });
                }
              } else if (
                !hasInitiallyScrolledRef.current &&
                messages.length > 0
              ) {
                hasInitiallyScrolledRef.current = true;
                scrollViewRef.current?.scrollToEnd({ animated: false });
              }
              previousContentHeightRef.current = contentHeight;
            }}
          >
            {isLoading ? (
              <View
                style={{
                  paddingVertical: 80,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="large" color="#14919B" />
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#8E887E",
                  }}
                >
                  Loading conversation...
                </Text>
              </View>
            ) : messages.length === 0 ? (
              <View
                style={{
                  paddingVertical: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  maxWidth: 360,
                  alignSelf: "center",
                  width: "100%",
                }}
              >
                {/* Avatar with soft glow */}
                <View style={{ position: "relative", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 34,
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#14919B",
                      backgroundColor: "#FFFFFF",
                      shadowColor: "#14919B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        style={{ width: 68, height: 68, borderRadius: 34 }}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#E0F7F7",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name="chatbubbles"
                          size={30}
                          color="#14919B"
                        />
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

                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#1A1D1F",
                    textAlign: "center",
                  }}
                >
                  {participantName}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6F767E",
                    textAlign: "center",
                    marginTop: 4,
                    lineHeight: 18,
                    paddingHorizontal: 10,
                  }}
                >
                  Send a message to discuss your outfit designs, fittings,
                  alterations, or custom tailoring inquiries.
                </Text>

                {/* Prominent Place Order Banner in Empty State */}
                {!isTailor && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleGoToCreateOrder}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F0FAFA",
                      borderWidth: 1.5,
                      borderColor: "#14919B",
                      borderRadius: 16,
                      padding: 14,
                      marginTop: 18,
                      marginBottom: 6,
                      width: "100%",
                      shadowColor: "#14919B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: "#14919B",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="bag-handle" size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: "#0D7377",
                        }}
                      >
                        Place an Order with {participantName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#6F767E",
                          marginTop: 2,
                          lineHeight: 16,
                        }}
                      >
                        Ready to stitch? Tap to specify your outfit,
                        measurements & order details.
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#14919B"
                    />
                  </TouchableOpacity>
                )}

                {/* Quick suggestions */}
                <View style={{ width: "100%", marginTop: 14, gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: "#8E887E",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      marginBottom: 2,
                      textAlign: "center",
                    }}
                  >
                    Quick conversation starters
                  </Text>
                  {QUICK_SUGGESTIONS.map((prompt, pIdx) => (
                    <TouchableOpacity
                      key={pIdx}
                      activeOpacity={0.75}
                      onPress={() => setInputText(prompt)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: "#FFFFFF",
                        borderWidth: 1,
                        borderColor: "#EAE5DD",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: "#1A1D1F",
                          flex: 1,
                          paddingRight: 8,
                        }}
                      >
                        {prompt}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color="#14919B"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <>
                {/* Top loader when fetching earlier messages */}
                {isLoadingOlder && (
                  <View
                    style={{
                      paddingVertical: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator size="small" color="#14919B" />
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#8E887E",
                        marginTop: 4,
                        fontWeight: "500",
                      }}
                    >
                      Loading earlier messages...
                    </Text>
                  </View>
                )}

                {/* Beginning of conversation indicator when all messages are loaded */}
                {!hasMore && messages.length >= 20 && (
                  <View
                    style={{
                      alignItems: "center",
                      paddingVertical: 14,
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "#EFECE6",
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                        borderRadius: 14,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={14}
                        color="#8E887E"
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#8E887E",
                          fontWeight: "600",
                        }}
                      >
                        Beginning of conversation
                      </Text>
                    </View>
                  </View>
                )}

                {messages.map((item, idx) => {
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
                      <View
                        style={{ alignItems: "center", marginVertical: 12 }}
                      >
                        <View
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 12,
                            backgroundColor: "#EFEBE4",
                            borderWidth: 1,
                            borderColor: "#E5DFD5",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "600",
                              color: "#78716C",
                              letterSpacing: 0.3,
                            }}
                          >
                            {currDateDivider}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-end",
                        justifyContent: isOutgoing ? "flex-end" : "flex-start",
                        alignSelf: isOutgoing ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        marginBottom: isSameSenderAsNext ? 4 : 12,
                      }}
                    >
                      {/* Incoming person avatar */}
                      {!isOutgoing && (
                        <View
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            overflow: "hidden",
                            marginRight: 8,
                            marginBottom: 2,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: "#EAE5DD",
                            backgroundColor: "#FFFFFF",
                          }}
                        >
                          {!isSameSenderAsNext ? (
                            messageAvatar ? (
                              <Image
                                source={{ uri: messageAvatar }}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                }}
                                contentFit="cover"
                                transition={200}
                              />
                            ) : (
                              <View
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  backgroundColor: "#E0F7F7",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: "800",
                                    color: "#14919B",
                                  }}
                                >
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
                        style={
                          isOutgoing
                            ? {
                                backgroundColor: "#14919B",
                                borderRadius: 16,
                                borderTopRightRadius: 3,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 1,
                              }
                            : {
                                backgroundColor: "#FFFFFF",
                                borderRadius: 16,
                                borderTopLeftRadius: 3,
                                borderWidth: 1,
                                borderColor: "#EAE4DA",
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.04,
                                shadowRadius: 2,
                                elevation: 1,
                              }
                        }
                      >
                        {attachments.length > 0 && (
                          <View style={{ marginBottom: 6, gap: 6 }}>
                            {attachments.map(
                              (attUri: string, attIdx: number) => {
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
                                      borderWidth: isOutgoing ? 0 : 1,
                                      borderColor: "#EAE5DD",
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
                              },
                            )}
                          </View>
                        )}

                        {text &&
                        (!attachments.some(isAudioAttachment) ||
                          (text !== "Voice message" &&
                            text !== "Sent an attachment")) ? (
                          <Text
                            style={{
                              fontSize: 14,
                              lineHeight: 20,
                              color: isOutgoing ? "#FFFFFF" : "#1A1D1F",
                              fontWeight: "400",
                            }}
                          >
                            {text}
                          </Text>
                        ) : null}

                        {/* Timestamp & Status Footer */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            marginTop: 4,
                            alignSelf: "flex-end",
                            gap: 4,
                          }}
                        >
                          {formattedTime ? (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "500",
                                color: isOutgoing ? "#D1FAF4" : "#9CA3AF",
                              }}
                            >
                              {formattedTime}
                            </Text>
                          ) : null}
                          {isOutgoing && (
                            <Ionicons
                              name={
                                item.isRead ? "checkmark-done" : "checkmark"
                              }
                              size={13}
                              color={item.isRead ? "#6EE7B7" : "#CCFBF1"}
                            />
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
              </>
            )}
          </ScrollView>
        </View>

        {/* Enhanced Pending Attachments Preview Bar */}
        {pendingAttachments.length > 0 && (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#EAE5DD",
              backgroundColor: "#FAF8F5",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="images" size={15} color="#14919B" />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#1A1D1F",
                  }}
                >
                  Attached Files ({pendingAttachments.length})
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClearAllAttachments}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "700", color: "#EF4444" }}
                >
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
                <View key={idx} style={{ position: "relative" }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setPreviewImageUri(uri)}
                    style={{
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: "#14919B",
                      overflow: "hidden",
                      backgroundColor: "#FFFFFF",
                    }}
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
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "#EF4444",
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                      elevation: 2,
                    }}
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
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: "#EAE5DD",
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: "#FFFFFF",
            paddingBottom: Math.max(insets.bottom, 10),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.04,
            shadowRadius: 3,
            elevation: 3,
            position: "relative",
            overflow: "visible",
          }}
        >
          {isRecording ? (
            isLocked ? (
              /* WhatsApp-style Locked Hands-free Recording Bar */
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 46,
                  paddingHorizontal: 2,
                }}
              >
                {/* Left: Tap-to-cancel Dustbin */}
                <AnimatedDustbin
                  isOpen={false}
                  onPress={handleCancelRecording}
                  size={40}
                />

                {/* Center: Live Recording Indicator, Timer & Dancing Waveform */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Animated.View
                    style={{
                      opacity: recordingPulseAnim,
                      width: 9,
                      height: 9,
                      borderRadius: 4.5,
                      backgroundColor: "#EF4444",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1A1D1F",
                      letterSpacing: 0.3,
                    }}
                  >
                    {formatMillis(recorderState.durationMillis)}
                  </Text>
                  <AudioWaveformBar color="#EF4444" count={7} />
                </View>

                {/* Right: Send Button in Locked Mode */}
                <TouchableOpacity
                  onPress={handleSendRecording}
                  disabled={isSending}
                  activeOpacity={0.85}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: "#14919B",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#14919B",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  accessibilityLabel="Send recorded message"
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={17} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* WhatsApp-style Active Voice Recording Track (Holding) */
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 46,
                }}
              >
                {/* Left: Dustbin with opening lid animation */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AnimatedDustbin
                    isOpen={isNearTrash}
                    lidAnim={trashLidAnim}
                    scaleAnim={trashScaleAnim}
                    shakeAnim={trashShakeAnim}
                    size={40}
                  />

                  {/* Blinking Red Recording Dot & Duration */}
                  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
                    <Animated.View
                      style={{
                        opacity: recordingPulseAnim,
                        width: 9,
                        height: 9,
                        borderRadius: 4.5,
                        backgroundColor: "#EF4444",
                        marginRight: 6,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#1A1D1F",
                        letterSpacing: 0.3,
                      }}
                    >
                      {formatMillis(recorderState.durationMillis)}
                    </Text>
                  </View>
                </View>

                {/* Center: Slide to cancel indicator */}
                <Animated.View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    transform: [{ translateX: slideAnim }],
                    paddingRight: 8,
                  }}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={isNearTrash ? "#EF4444" : "#9CA3AF"}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isNearTrash ? "800" : "600",
                      color: isNearTrash ? "#EF4444" : "#6F767E",
                      marginLeft: 2,
                    }}
                  >
                    {isNearTrash ? "Release to delete" : "Slide to cancel"}
                  </Text>
                </Animated.View>

                {/* Right: Floating Lock Pill & Holding Mic Button */}
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                  {/* Floating Slide-up-to-lock indicator pill above mic */}
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      bottom: 58,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 22,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#EAE5DD",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.12,
                      shadowRadius: 6,
                      elevation: 6,
                      transform: [{ translateY: lockSlideAnim }],
                    }}
                  >
                    <Ionicons name="lock-closed" size={16} color="#14919B" />
                    <Ionicons name="chevron-up" size={13} color="#14919B" style={{ marginTop: 2 }} />
                    <Text style={{ fontSize: 9, fontWeight: "700", color: "#6F767E", marginTop: 2 }}>
                      Lock
                    </Text>
                  </Animated.View>

                  {/* Pulsing Ripple Aura behind mic */}
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "rgba(239, 68, 68, 0.28)",
                      transform: [
                        {
                          scale: micRippleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 2.3],
                          }),
                        },
                        { translateX: micTranslateX },
                        { translateY: micTranslateY },
                      ],
                      opacity: micRippleAnim.interpolate({
                        inputRange: [0, 0.7, 1],
                        outputRange: [0.65, 0.3, 0],
                      }),
                    }}
                  />

                  {/* Active Holding Mic Button */}
                  <View
                    {...micPanResponder.panHandlers}
                    style={{
                      width: 44,
                      height: 44,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Animated.View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#EF4444",
                        shadowColor: "#EF4444",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.45,
                        shadowRadius: 8,
                        elevation: 6,
                        transform: [
                          { scale: micScaleAnim },
                          { translateX: micTranslateX },
                          { translateY: micTranslateY },
                        ],
                      }}
                    >
                      <Ionicons name="mic" size={21} color="#FFFFFF" />
                    </Animated.View>
                  </View>
                </View>
              </View>
            )
          ) : (
            <>
              {/* Attachment Picker Button */}
              <TouchableOpacity
                onPress={handlePickAttachment}
                activeOpacity={0.75}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#EAE5DD",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 6,
                }}
                accessibilityLabel="Add attachment"
              >
                <Ionicons name="add" size={22} color="#14919B" />
              </TouchableOpacity>

              {/* Quick Camera Button */}
              <TouchableOpacity
                onPress={handleTakePhoto}
                activeOpacity={0.75}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#EAE5DD",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
                accessibilityLabel="Take photo"
              >
                <Ionicons name="camera-outline" size={19} color="#6F767E" />
              </TouchableOpacity>

              {/* Text Input Box */}
              <TextInput
                style={{
                  flex: 1,
                  minHeight: 42,
                  maxHeight: 110,
                  borderRadius: 18,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#EAE5DD",
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  fontSize: 14,
                  color: "#1A1D1F",
                  marginRight: 8,
                }}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />

              {/* Send or Mic Button */}
              {!inputText.trim() && pendingAttachments.length === 0 ? (
                /* WhatsApp Hold-to-Record Mic Button */
                <View
                  {...micPanResponder.panHandlers}
                  style={{
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Animated.View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#14919B",
                      shadowColor: "#14919B",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3,
                      elevation: 3,
                      transform: [{ scale: micScaleAnim }],
                    }}
                  >
                    <Ionicons name="mic" size={20} color="#FFFFFF" />
                  </Animated.View>
                </View>
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
                    backgroundColor: canSend ? "#14919B" : "#E2DDD5",
                    shadowColor: canSend ? "#14919B" : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
                    elevation: canSend ? 2 : 0,
                  }}
                  accessibilityLabel="Send message"
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name="send"
                      size={18}
                      color={canSend ? "#FFFFFF" : "#8E887E"}
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
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom + 10, 28),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <View
              style={{
                height: 5,
                width: 44,
                borderRadius: 2.5,
                backgroundColor: "#EAE5DD",
                alignSelf: "center",
                marginBottom: 16,
                marginTop: 4,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: "#EAE5DD",
                marginBottom: 12,
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 16, fontWeight: "800", color: "#1A1D1F" }}
                >
                  {participantName}
                </Text>
                <Text
                  style={{ fontSize: 12, color: "#6F767E", fontWeight: "500" }}
                >
                  Conversation Options
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsActionSheetVisible(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#EAE5DD",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={17} color="#6F767E" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, paddingVertical: 4 }}>
              {/* Place Custom Order Action Sheet Item */}
              {!isTailor && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsActionSheetVisible(false);
                    handleGoToCreateOrder();
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: "#F0FAFA",
                    borderWidth: 1.5,
                    borderColor: "#14919B",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#14919B",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="bag-check" size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: "#0D7377",
                      }}
                    >
                      Place Custom Order
                    </Text>
                    <Text style={{ fontSize: 12, color: "#6F767E" }}>
                      Create bespoke outfit order with measurements
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#14919B" />
                </TouchableOpacity>
              )}

              {resolvedTailorId && !isTailor && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsActionSheetVisible(false);
                    router.push(`/tailors/${resolvedTailorId}` as any);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#EAE5DD",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#E0F7F7",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="storefront" size={19} color="#14919B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#1A1D1F",
                      }}
                    >
                      View Tailor Profile
                    </Text>
                    <Text style={{ fontSize: 12, color: "#6F767E" }}>
                      Explore services, ratings, and studio location
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setIsActionSheetVisible(false);
                  handlePickAttachment();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#EAE5DD",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#EFF6FF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="images" size={19} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1A1D1F",
                    }}
                  >
                    Send Photos & Designs
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6F767E" }}>
                    Share reference images or outfit styles
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setIsActionSheetVisible(false);
                  loadData();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#EAE5DD",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="refresh" size={19} color="#475569" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1A1D1F",
                    }}
                  >
                    Refresh Messages
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6F767E" }}>
                    Check for latest replies and updates
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#9CA3AF" />
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <TouchableOpacity
            onPress={() => setPreviewImageUri(null)}
            style={{
              position: "absolute",
              top: 48,
              right: 20,
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
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
