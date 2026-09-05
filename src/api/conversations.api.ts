import { apiClient } from './client';
import { ConversationItem, MessageItem } from '../types/api';

export interface StartConversationPayload {
  participantId: string;
  initialMessage?: string;
}

export interface SendMessagePayload {
  text: string;
  attachments?: string[];
}

export const conversationsApi = {
  async getConversations() {
    return apiClient<ConversationItem[]>('/conversations', {
      method: 'GET',
    });
  },

  async startConversation(payload: StartConversationPayload) {
    return apiClient<ConversationItem>('/conversations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getConversationById(conversationId: string) {
    return apiClient<ConversationItem>(`/conversations/${conversationId}`, {
      method: 'GET',
    });
  },

  async getMessages(conversationId: string) {
    return apiClient<MessageItem[]>(`/conversations/${conversationId}/messages`, {
      method: 'GET',
    });
  },

  async sendMessage(conversationId: string, payload: SendMessagePayload) {
    return apiClient<MessageItem>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async markAsRead(messageId: string) {
    return apiClient(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  },
};
