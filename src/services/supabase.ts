import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { CONFIG } from '../constants/config';
import { storage } from '../api/client';
import { conversationsApi } from '../api/conversations.api';

let supabaseClient: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Get or initialize the Supabase client singleton.
 * Uses CONFIG values first, and falls back to backend /conversations/realtime-config if needed.
 */
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (supabaseClient) {
    const token = await storage.getToken();
    if (token) {
      try {
        supabaseClient.realtime.setAuth(token);
      } catch {}
    }
    return supabaseClient;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    let url = CONFIG.SUPABASE_URL;
    let anonKey = CONFIG.SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      const remoteConfig = await conversationsApi.getRealtimeConfig();
      if (remoteConfig?.supabaseUrl && remoteConfig?.supabaseAnonKey) {
        url = remoteConfig.supabaseUrl;
        anonKey = remoteConfig.supabaseAnonKey;
      }
    }

    if (!url || !anonKey) {
      console.warn('[Supabase Realtime] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
      initPromise = null;
      return null;
    }

    try {
      const client = createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });

      const token = await storage.getToken();
      if (token) {
        try {
          client.realtime.setAuth(token);
        } catch {}
      }

      supabaseClient = client;
      return client;
    } catch (err) {
      console.warn('[Supabase Realtime] Error initializing Supabase client:', err);
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

  const client = await getSupabaseClient();
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
        (payload) => {
          if (payload.eventType === 'INSERT' && callbacks.onInsert) {
            callbacks.onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && callbacks.onUpdate) {
            callbacks.onUpdate(payload.new);
          } else if (payload.eventType === 'DELETE' && callbacks.onDelete) {
            callbacks.onDelete(payload.old);
          }
        }
      )
      .subscribe((status, err) => {
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
  if (!channel || !supabaseClient) return;
  try {
    await supabaseClient.removeChannel(channel);
  } catch (err) {
    console.warn('[Supabase Realtime] Failed to unsubscribe channel:', err);
  }
}
