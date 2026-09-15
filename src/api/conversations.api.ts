import { Platform } from 'react-native';
import { apiClient } from './client';
import { ConversationItem, MessageItem } from '../types/api';


export interface StartConversationPayload {
  participantId: string;
  initialMessage?: string;
}

export interface SendMessagePayload {
  text?: string;
  attachments?: string[];
  file?: MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string };
  files?: (MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string } | string)[];
  senderId?: string;
}

export interface MessageAttachmentUploadInput {
  uri: string;
  name?: string | null;
  fileName?: string | null;
  type?: string | null;
  mimeType?: string | null;
  fileType?: string;
}

export const AUDIO_EXTENSIONS = ['.m4a', '.mp3', '.wav', '.aac', '.webm', '.ogg', '.caf', '.3gp', '.mp4', '.opus', '.flac', '.amr'];
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic', '.heif', '.svg'];

export function isAudioAttachment(urlOrPath?: string | null): boolean {
  if (!urlOrPath || typeof urlOrPath !== 'string') return false;
  const clean = urlOrPath.split('?')[0].split('#')[0].toLowerCase();
  if (AUDIO_EXTENSIONS.some((ext) => clean.endsWith(ext))) return true;
  if (clean.includes('/audio/') || clean.includes('voice_message') || clean.includes('voicenote') || clean.includes('recording')) return true;
  return false;
}

export function isImageAttachment(urlOrPath?: string | null): boolean {
  if (!urlOrPath || typeof urlOrPath !== 'string') return false;
  const clean = urlOrPath.split('?')[0].split('#')[0].toLowerCase();
  if (IMAGE_EXTENSIONS.some((ext) => clean.endsWith(ext))) return true;
  if (clean.includes('/image/') || clean.includes('/photos/') || clean.includes('photo') || clean.includes('avatar')) return true;
  return !isAudioAttachment(urlOrPath);
}

function resolveAttachmentMimeType(filename: string, explicitType?: string | null): { filename: string; mimeType: string } {
  let finalName = filename;
  const match = /\.(\w+)$/.exec(finalName);
  const ext = match ? match[1].toLowerCase() : '';

  if (explicitType && explicitType.includes('/')) {
    if (!ext) {
      if (explicitType.includes('m4a')) finalName = `${finalName}.m4a`;
      else if (explicitType.includes('mp4') || explicitType.includes('aac')) finalName = `${finalName}.m4a`;
      else if (explicitType.includes('mpeg') || explicitType.includes('mp3')) finalName = `${finalName}.mp3`;
      else if (explicitType.includes('wav')) finalName = `${finalName}.wav`;
      else if (explicitType.includes('webm')) finalName = `${finalName}.webm`;
      else if (explicitType.includes('png')) finalName = `${finalName}.png`;
      else finalName = `${finalName}.jpg`;
    }
    return { filename: finalName, mimeType: explicitType };
  }

  if (ext === 'm4a') return { filename: finalName, mimeType: 'audio/m4a' };
  if (ext === 'mp3') return { filename: finalName, mimeType: 'audio/mpeg' };
  if (ext === 'aac') return { filename: finalName, mimeType: 'audio/aac' };
  if (ext === 'wav') return { filename: finalName, mimeType: 'audio/wav' };
  if (ext === 'webm') return { filename: finalName, mimeType: 'audio/webm' };
  if (ext === 'ogg' || ext === 'opus') return { filename: finalName, mimeType: 'audio/ogg' };
  if (ext === 'caf') return { filename: finalName, mimeType: 'audio/x-caf' };
  if (ext === '3gp' || ext === '3gpp') return { filename: finalName, mimeType: 'audio/3gpp' };
  if (ext === 'png') return { filename: finalName, mimeType: 'image/png' };
  if (ext === 'gif') return { filename: finalName, mimeType: 'image/gif' };
  if (ext === 'webp') return { filename: finalName, mimeType: 'image/webp' };
  if (ext === 'svg') return { filename: finalName, mimeType: 'image/svg+xml' };

  if (!ext) {
    finalName = `${finalName}.jpg`;
  }
  return { filename: finalName, mimeType: 'image/jpeg' };
}

export async function buildMessageFormData(
  input: {
    file?: MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string } | string;
    files?: (MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string } | string)[];
    attachments?: (MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string } | string)[];
    attachment?: MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string } | string;
    fieldName?: string;
    text?: string;
    senderId?: string;
  } | FormData
): Promise<FormData> {
  if (
    (typeof FormData !== 'undefined' && input instanceof FormData) ||
    (input && typeof (input as any).append === 'function')
  ) {
    return input as FormData;
  }

  const payload = input as {
    file?: MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string } | string;
    files?: (MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string } | string)[];
    attachments?: (MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string } | string)[];
    attachment?: MessageAttachmentUploadInput | { uri: string; name?: string; fileType?: string; type?: string; mimeType?: string } | string;
    fieldName?: string;
    text?: string;
    senderId?: string;
  };

  const formData = new FormData();

  if (payload.text) {
    formData.append('text', payload.text);
  }

  if (payload.senderId) {
    formData.append('senderId', payload.senderId);
  }

  // Collect unique file items
  const rawItems: any[] = [];
  if (Array.isArray(payload.files) && payload.files.length > 0) {
    rawItems.push(...payload.files);
  } else if (Array.isArray(payload.attachments) && payload.attachments.length > 0) {
    rawItems.push(...payload.attachments);
  } else if (payload.file) {
    rawItems.push(payload.file);
  } else if (payload.attachment) {
    rawItems.push(payload.attachment);
  }

  const seenUris = new Set<string>();
  const fileItems: any[] = [];
  for (const it of rawItems) {
    const uri = typeof it === 'string' ? it : it?.uri;
    if (uri && !seenUris.has(uri)) {
      seenUris.add(uri);
      fileItems.push(it);
    }
  }

  const primaryField = payload.fieldName || (payload.attachment ? 'attachment' : 'file');

  for (let i = 0; i < fileItems.length; i++) {
    const item = fileItems[i];
    const fileUri = typeof item === 'string' ? item : item?.uri;
    if (!fileUri) continue;

    const rawName =
      (typeof item === 'object' && (item.fileName || item.name)) ||
      fileUri.split('/').pop() ||
      `attachment_${i + 1}`;

    const explicitType = typeof item === 'object' ? item.mimeType || item.type || item.fileType : undefined;
    const { filename, mimeType } = resolveAttachmentMimeType(rawName, explicitType);

    const fileObj = {
      uri: fileUri,
      name: filename,
      type: mimeType,
    };

    if (Platform.OS === 'web') {
      try {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append(primaryField, blob, filename);
        continue;
      } catch {
        // Fallback to RN object
      }
    }

    formData.append(primaryField, fileObj as any);
  }

  return formData;
}

export async function buildMessageAttachmentFormData(
  input: MessageAttachmentUploadInput | FormData | { uri: string; fileType?: string; type?: string; mimeType?: string }
): Promise<FormData> {
  if (
    (typeof FormData !== 'undefined' && input instanceof FormData) ||
    (input && typeof (input as any).append === 'function')
  ) {
    return input as FormData;
  }

  const asset = input as MessageAttachmentUploadInput;
  const formData = new FormData();
  const fileUri = asset.uri;

  const rawName = asset.fileName || asset.name || fileUri.split('/').pop() || 'attachment';
  const explicitType = asset.mimeType || asset.type || asset.fileType;
  const { filename, mimeType } = resolveAttachmentMimeType(rawName, explicitType);

  const fileObj = {
    uri: fileUri,
    name: filename,
    type: mimeType,
  };

  if (Platform.OS === 'web') {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('file', blob, filename);
      if (asset.fileType) {
        formData.append('fileType', asset.fileType);
      }
      return formData;
    } catch {
      // Fallback
    }
  }

  // Native React Native FormData object
  formData.append('file', fileObj as any);

  if (asset.fileType) {
    formData.append('fileType', asset.fileType);
  }

  return formData;
}



export interface CheckConversationResult {
  exists: boolean;
  conversation: ConversationItem | null;
}

export function extractConversationsList(resData: any): any[] {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.conversations)) return resData.conversations;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.items)) return resData.items;
  if (Array.isArray(resData.results)) return resData.results;
  if (resData.data && typeof resData.data === 'object') {
    return extractConversationsList(resData.data);
  }
  return [];
}

export function isConversationWithTarget(
  conv: any,
  targetIds: string[],
  currentUserId?: string,
  targetNames?: string[]
): boolean {
  if (!conv) return false;
  const curId = currentUserId ? String(currentUserId).toLowerCase().trim() : '';
  const normalizedTargets = targetIds
    .filter(Boolean)
    .map((t) => String(t).toLowerCase().trim())
    .filter((t) => t.length > 0 && t !== curId);

  const normalizedTargetNames = (targetNames || [])
    .filter(Boolean)
    .map((n) => String(n).toLowerCase().trim())
    .filter((n) => n.length > 1);

  if (normalizedTargets.length === 0 && normalizedTargetNames.length === 0) return false;

  const convParticipantIds: string[] = [
    conv.participantId,
    conv.participant_id,
    conv.participant1_id,
    conv.participant1Id,
    conv.participant2_id,
    conv.participant2Id,
    conv.participant?.id,
    conv.participant?._id,
    conv.participant?.userId,
    conv.participant?.user_id,
    conv.participant1?.id,
    conv.participant1?._id,
    conv.participant1?.userId,
    conv.participant1?.user_id,
    conv.participant2?.id,
    conv.participant2?._id,
    conv.participant2?.userId,
    conv.participant2?.user_id,
    conv.user1_id,
    conv.user1Id,
    conv.user_1?.id,
    conv.user_1?._id,
    conv.user1?.id,
    conv.user1?._id,
    conv.user1?.userId,
    conv.user2_id,
    conv.user2Id,
    conv.user_2?.id,
    conv.user_2?._id,
    conv.user2?.id,
    conv.user2?._id,
    conv.user2?.userId,
    conv.senderId,
    conv.sender_id,
    conv.sender?.id,
    conv.sender?._id,
    conv.sender?.userId,
    conv.receiverId,
    conv.receiver_id,
    conv.receiver?.id,
    conv.receiver?._id,
    conv.receiver?.userId,
    conv.recipientId,
    conv.recipient_id,
    conv.recipient?.id,
    conv.recipient?._id,
    conv.tailorId,
    conv.tailor_id,
    conv.tailor?.id,
    conv.tailor?._id,
    conv.tailor?.userId,
    conv.tailor?.user_id,
    conv.tailor?.user?.id,
    conv.customerId,
    conv.customer_id,
    conv.customer?.id,
    conv.customer?._id,
    conv.customer?.userId,
    conv.customer?.user_id,
    conv.user?.id,
    conv.user?._id,
    ...(Array.isArray(conv.participants)
      ? conv.participants.flatMap((p: any) => [
          p.id,
          p._id,
          p.userId,
          p.user_id,
          p.tailorId,
          p.tailor_id,
        ])
      : []),
  ]
    .filter(Boolean)
    .map((id) => String(id).toLowerCase().trim());

  // Match by ID
  const idMatched = convParticipantIds.some((pId) => {
    if (curId && pId === curId) return false;
    return normalizedTargets.includes(pId);
  });

  if (idMatched) return true;

  // Fallback: match by participant name/shop name
  if (normalizedTargetNames.length > 0) {
    const convNames: string[] = [
      conv.participant?.name,
      conv.participant?.fullName,
      conv.participant?.full_name,
      conv.participant?.shopName,
      conv.participant?.shop_name,
      conv.participant1?.name,
      conv.participant1?.fullName,
      conv.participant1?.full_name,
      conv.participant1?.shopName,
      conv.participant1?.shop_name,
      conv.participant2?.name,
      conv.participant2?.fullName,
      conv.participant2?.full_name,
      conv.participant2?.shopName,
      conv.participant2?.shop_name,
      conv.participantName,
      conv.tailor?.name,
      conv.tailor?.shopName,
      conv.tailor?.shop_name,
      conv.tailor?.businessName,
      conv.tailorName,
      conv.user1?.name,
      conv.user1?.fullName,
      conv.user1?.full_name,
      conv.user2?.name,
      conv.user2?.fullName,
      conv.user2?.full_name,
      conv.sender?.name,
      conv.sender?.fullName,
      conv.receiver?.name,
      conv.receiver?.fullName,
      conv.recipient?.name,
      conv.recipient?.fullName,
      ...(Array.isArray(conv.participants)
        ? conv.participants.flatMap((p: any) => [
            p.name,
            p.fullName,
            p.full_name,
            p.shopName,
            p.shop_name,
          ])
        : []),
    ]
      .filter(Boolean)
      .map((n) => String(n).toLowerCase().trim());

    const nameMatched = convNames.some((cName) =>
      normalizedTargetNames.some(
        (tName) => cName === tName || cName.includes(tName) || tName.includes(cName)
      )
    );
    if (nameMatched) return true;
  }

  return false;
}

export const conversationsApi = {
  // GET /conversations - List user conversations
  async getConversations() {
    const res = await apiClient<any>('/conversations', {
      method: 'GET',
    });
    const list = extractConversationsList(res.data);
    return {
      ...res,
      data: list as ConversationItem[],
    };
  },

  // GET /conversations/:tailorId/:clientId - Get or check conversation between tailor and client
  async getConversationBetween(tailorId: string, clientId: string) {
    try {
      const res = await apiClient<any>(
        `/conversations/${encodeURIComponent(tailorId)}/${encodeURIComponent(clientId)}`,
        {
          method: 'GET',
        }
      );

      let resData = res.data;
      let exists = false;
      let conversation: ConversationItem | null = null;

      if (resData) {
        if (typeof resData.exists === 'boolean') {
          exists = resData.exists;
          conversation = resData.conversation || null;
        } else if (resData.data && typeof resData.data.exists === 'boolean') {
          exists = resData.data.exists;
          conversation = resData.data.conversation || null;
        } else if (resData.id) {
          exists = true;
          conversation = resData;
        }
      }

      return {
        ...res,
        data: {
          exists,
          conversation,
        },
      };
    } catch {
      return {
        success: false,
        data: {
          exists: false,
          conversation: null,
        },
      };
    }
  },

  // Alias for getConversationBetween
  async checkConversation(tailorId: string, clientId: string) {
    return this.getConversationBetween(tailorId, clientId);
  },

  // GET /conversations/:tailorId/:clientId/messages - Get messages in conversation between tailor and client
  async getMessagesBetween(tailorId: string, clientId: string) {
    const res = await apiClient<any>(
      `/conversations/${encodeURIComponent(tailorId)}/${encodeURIComponent(clientId)}/messages`,
      {
        method: 'GET',
      }
    );
    let list: MessageItem[] = [];
    if (Array.isArray(res.data)) {
      list = res.data;
    } else if (Array.isArray((res.data as any)?.messages)) {
      list = (res.data as any).messages;
    } else if (Array.isArray((res.data as any)?.data)) {
      list = (res.data as any).data;
    } else if (Array.isArray((res.data as any)?.items)) {
      list = (res.data as any).items;
    } else if (Array.isArray((res.data as any)?.results)) {
      list = (res.data as any).results;
    }
    return {
      ...res,
      data: list,
    };
  },

  // POST /conversations/:tailorId/:clientId/messages - Send a message in conversation between tailor and client
  async sendMessageBetween(tailorId: string, clientId: string, payload: SendMessagePayload | FormData) {
    if (
      (typeof FormData !== 'undefined' && payload instanceof FormData) ||
      Boolean((payload as any)?.file || (payload as any)?.files)
    ) {
      const body = await buildMessageFormData(payload as any);
      return apiClient<MessageItem>(
        `/conversations/${encodeURIComponent(tailorId)}/${encodeURIComponent(clientId)}/messages`,
        {
          method: 'POST',
          body,
        }
      );
    }

    return apiClient<MessageItem>(
      `/conversations/${encodeURIComponent(tailorId)}/${encodeURIComponent(clientId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },


  // POST /conversations - Start a new conversation
  async startConversation(payload: StartConversationPayload | any) {
    const res = await apiClient<any>('/conversations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    let conv = res.data;
    if (conv && typeof conv === 'object') {
      if (conv.conversation && typeof conv.conversation === 'object') {
        conv = conv.conversation;
      } else if (conv.data && typeof conv.data === 'object' && !Array.isArray(conv.data)) {
        conv = conv.data;
      }
    }
    return {
      ...res,
      data: conv as ConversationItem,
    };
  },

  // GET /conversations/{conversationId} - Get conversation details by ID
  async getConversationById(conversationId: string) {
    const res = await apiClient<any>(`/conversations/${conversationId}`, {
      method: 'GET',
    });
    let conv = res.data;
    if (conv && typeof conv === 'object') {
      if (conv.conversation && typeof conv.conversation === 'object') {
        conv = conv.conversation;
      } else if (conv.data && typeof conv.data === 'object' && !Array.isArray(conv.data)) {
        conv = conv.data;
      }
    }
    return {
      ...res,
      data: conv as ConversationItem,
    };
  },

  // GET /conversations/{conversationId}/messages - Get messages in a conversation
  async getMessages(conversationId: string) {
    const res = await apiClient<any>(`/conversations/${conversationId}/messages`, {
      method: 'GET',
    });
    let list: MessageItem[] = [];
    if (Array.isArray(res.data)) {
      list = res.data;
    } else if (Array.isArray((res.data as any)?.messages)) {
      list = (res.data as any).messages;
    } else if (Array.isArray((res.data as any)?.data)) {
      list = (res.data as any).data;
    } else if (Array.isArray((res.data as any)?.items)) {
      list = (res.data as any).items;
    } else if (Array.isArray((res.data as any)?.results)) {
      list = (res.data as any).results;
    }
    return {
      ...res,
      data: list,
    };
  },

  // POST /conversations/{conversationId}/messages - Send a message in a conversation
  async sendMessage(conversationId: string, payload: SendMessagePayload | FormData) {
    if (
      (typeof FormData !== 'undefined' && payload instanceof FormData) ||
      Boolean((payload as any)?.file || (payload as any)?.files)
    ) {
      const body = await buildMessageFormData(payload as any);
      return apiClient<MessageItem>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body,
      });
    }

    return apiClient<MessageItem>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },


  // PATCH /messages/{messageId}/read - Mark a message as read
  async markAsRead(messageId: string) {
    return apiClient(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  },

  // POST /messages/{messageId}/attachments - Add an attachment to a message
  async addAttachment(
    messageId: string,
    fileOrPayload: MessageAttachmentUploadInput | FormData | { uri: string; fileType?: string } | { fileUrl: string; fileType?: string }
  ) {
    if (
      fileOrPayload &&
      ('fileUrl' in fileOrPayload || 'url' in (fileOrPayload as any)) &&
      !('uri' in fileOrPayload) &&
      !(typeof FormData !== 'undefined' && fileOrPayload instanceof FormData)
    ) {
      return apiClient(`/messages/${messageId}/attachments`, {
        method: 'POST',
        body: JSON.stringify(fileOrPayload),
      });
    }

    const body = await buildMessageAttachmentFormData(fileOrPayload as any);
    return apiClient(`/messages/${messageId}/attachments`, {
      method: 'POST',
      body,
    });
  },


  // Helper: Find existing conversation matching target user/tailor IDs or names
  // Uses GET /conversations/:tailorId/:clientId endpoint first, with fallback to conversation list search
  async findExistingConversation(
    targetIds: string[],
    currentUserId?: string,
    targetNames?: string[]
  ): Promise<ConversationItem | null> {
    // 1. Direct check using GET /conversations/:tailorId/:clientId if IDs are available
    if (currentUserId && targetIds.length > 0) {
      for (const targetId of targetIds) {
        if (!targetId || targetId === currentUserId) continue;
        try {
          // Check targetId as tailor, currentUserId as client
          const check1 = await this.checkConversation(targetId, currentUserId);
          if (check1?.data?.exists && check1.data.conversation) {
            return check1.data.conversation;
          }
          // Check currentUserId as tailor, targetId as client
          const check2 = await this.checkConversation(currentUserId, targetId);
          if (check2?.data?.exists && check2.data.conversation) {
            return check2.data.conversation;
          }
        } catch {
          // Ignore and continue
        }
      }
    }

    // 2. Fallback: search in user's conversations list
    try {
      const res = await this.getConversations();
      const list = extractConversationsList(res.data);
      return (
        list.find((c: any) =>
          isConversationWithTarget(c, targetIds, currentUserId, targetNames)
        ) || null
      );
    } catch {
      return null;
    }
  },

  // Helper: Get or create conversation safely (ensures no duplicates are created)
  async getOrCreateConversation(
    targetUserId: string,
    targetTailorId?: string,
    currentUserId?: string,
    initialMessage?: string,
    targetNames?: string[]
  ) {
    const targets = [targetUserId, targetTailorId].filter(Boolean) as string[];

    // 1. Check if a conversation already exists between the two users
    const existing = await this.findExistingConversation(
      targets,
      currentUserId,
      targetNames
    );
    if (existing && (existing.id || (existing as any)._id)) {
      const convId = existing.id || (existing as any)._id;
      if (initialMessage && initialMessage.trim()) {
        try {
          await this.sendMessage(convId, { text: initialMessage.trim() });
        } catch (err) {
          console.warn('Failed to send message to existing conversation:', err);
        }
      }
      return {
        data: existing,
        success: true,
      };
    }

    // 2. Only start a new conversation if none exists
    const payload: any = {
      participantId: targetUserId,
      participant_id: targetUserId,
      tailorId: targetTailorId || targetUserId,
      tailor_id: targetTailorId || targetUserId,
      recipientId: targetUserId,
      recipient_id: targetUserId,
    };
    if (initialMessage && initialMessage.trim()) {
      payload.initialMessage = initialMessage.trim();
      payload.message = initialMessage.trim();
      payload.text = initialMessage.trim();
    }

    const res = await this.startConversation(payload);
    let convData = res.data;
    if (convData && (convData as any).conversation) {
      convData = (convData as any).conversation;
    }
    return {
      ...res,
      data: convData,
    };
  },
};
