import { RealtimeClient, RealtimeChannel } from '@supabase/realtime-js';
import { CONFIG } from '../constants/config';
import { storage } from '../api/client';
import { conversationsApi } from '../api/conversations.api';

let realtimeClient: RealtimeClient | null = null;
let initPromise: Promise<RealtimeClient | null> | null = null;

function cleanConfigValue(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

/**
 * Get or initialize the Supabase Realtime client singleton.
 * Uses CONFIG values first, and falls back to backend /conversations/realtime-config if needed.
 */
export async function getRealtimeClient(): Promise<RealtimeClient | null> {
  if (realtimeClient) {
    const token = await storage.getToken();
    if (token) {
      try {
        realtimeClient.setAuth(token);
      } catch {}
    }
    return realtimeClient;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    let url = cleanConfigValue(CONFIG.SUPABASE_URL);
    let anonKey = cleanConfigValue(CONFIG.SUPABASE_ANON_KEY);

    if (!url || !anonKey) {
      const remoteConfig = await conversationsApi.getRealtimeConfig();
      if (remoteConfig?.supabaseUrl && remoteConfig?.supabaseAnonKey) {
        url = cleanConfigValue(remoteConfig.supabaseUrl);
        anonKey = cleanConfigValue(remoteConfig.supabaseAnonKey);
      }
    }

    if (!url || !anonKey) {
      console.warn('[Supabase Realtime] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
      initPromise = null;
      return null;
    }

    try {
      const normalizedBaseUrl = url.replace(/\/+$/, '');
      const endpoint = `${normalizedBaseUrl}/realtime/v1`;

      const client = new RealtimeClient(endpoint, {
        params: {
          apikey: anonKey,
          eventsPerSecond: 10,
        },
      });

      const token = await storage.getToken();
      if (token) {
        try {
          client.setAuth(token);
        } catch {}
      }

      client.connect();
      realtimeClient = client;
      return client;
    } catch (err) {
      console.warn('[Supabase Realtime] Error initializing Realtime client:', err);
      initPromise = null;
      return null;
    }
  })();

  return initPromise;
}

export interface ConversationRealtimeCallbacks {
  onInsert?: (newRecord: any) => void;
  onUpdate?: (updatedRecord: any) => void;
  onDelete?: (oldRecord: any) => void;
}

/**
 * Subscribe to Supabase Postgres Realtime changes on the messages table for a specific conversation.
 */
export async function subscribeToConversation(
  conversationId: string,
  callbacks: ConversationRealtimeCallbacks
): Promise<RealtimeChannel | null> {
  if (!conversationId || conversationId === 'new') return null;

  const client = await getRealtimeClient();
  if (!client) return null;

  try {
    const channelName = `messages_${conversationId}_${Date.now()}`;
    const channel = client.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT' && callbacks.onInsert) {
            callbacks.onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && callbacks.onUpdate) {
            callbacks.onUpdate(payload.new);
          } else if (payload.eventType === 'DELETE' && callbacks.onDelete) {
            callbacks.onDelete(payload.old);
          }
        }
      )
      .subscribe((status: string, err: any) => {
        if (err) {
          console.warn(`[Supabase Realtime] Subscription error on ${conversationId}:`, err);
        }
      });

    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Failed to subscribe to conversation:', err);
    return null;
  }
}

/**
 * Unsubscribe and remove a Supabase Realtime channel.
 */
export async function unsubscribeChannel(channel: RealtimeChannel | null): Promise<void> {
  if (!channel || !realtimeClient) return;
  try {
    await realtimeClient.removeChannel(channel);
  } catch (err) {
    console.warn('[Supabase Realtime] Failed to unsubscribe channel:', err);
  }
}
