import { RealtimeChannel } from "@supabase/realtime-js";
import { getRealtimeClient } from "./supabase";

type PresenceListener = (onlineIds: Set<string>) => void;

class PresenceService {
  private channel: RealtimeChannel | null = null;
  private onlineUsers: Set<string> = new Set();
  private listeners: Set<PresenceListener> = new Set();
  private currentUserId: string | null = null;
  private isConnecting = false;

  public async initPresence(userId?: string): Promise<void> {
    if (!userId) return;
    const cleanId = String(userId).toLowerCase().trim();
    if (this.currentUserId === cleanId && this.channel) {
      return;
    }

    this.currentUserId = cleanId;
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      const client = await getRealtimeClient();
      if (!client) {
        this.isConnecting = false;
        return;
      }

      if (this.channel) {
        try {
          await client.removeChannel(this.channel);
        } catch {}
        this.channel = null;
      }

      const channel = client.channel("sui_dhaga_presence", {
        config: {
          presence: {
            key: cleanId,
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const newSet = new Set<string>();
          Object.keys(state).forEach((key) => {
            newSet.add(key.toLowerCase().trim());
            const presences = state[key] as any[];
            if (Array.isArray(presences)) {
              presences.forEach((p) => {
                if (p?.userId) newSet.add(String(p.userId).toLowerCase().trim());
              });
            }
          });
          if (this.currentUserId) {
            newSet.add(this.currentUserId);
          }
          this.onlineUsers = newSet;
          this.notifyListeners();
        })
        .on("presence", { event: "join" }, ({ key, newPresences }: any) => {
          if (key) this.onlineUsers.add(String(key).toLowerCase().trim());
          if (Array.isArray(newPresences)) {
            newPresences.forEach((p) => {
              if (p?.userId) this.onlineUsers.add(String(p.userId).toLowerCase().trim());
            });
          }
          this.notifyListeners();
        })
        .on("presence", { event: "leave" }, ({ key }: any) => {
          if (key && key.toLowerCase().trim() !== this.currentUserId) {
            this.onlineUsers.delete(String(key).toLowerCase().trim());
          }
          this.notifyListeners();
        })
        .subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            try {
              await channel.track({
                userId: cleanId,
                onlineAt: new Date().toISOString(),
              });
            } catch (trackErr) {
              console.warn("[Presence] track error:", trackErr);
            }
          }
        });

      this.channel = channel;
    } catch (err) {
      console.warn("[Presence] Failed to initialize presence:", err);
    } finally {
      this.isConnecting = false;
    }
  }

  public isOnline(userId?: string | null): boolean {
    if (!userId) return false;
    const clean = String(userId).toLowerCase().trim();
    if (this.currentUserId && clean === this.currentUserId) {
      return true;
    }
    return this.onlineUsers.has(clean);
  }

  public subscribe(listener: PresenceListener): () => void {
    this.listeners.add(listener);
    listener(new Set(this.onlineUsers));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const copy = new Set(this.onlineUsers);
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (err) {
        console.warn("[Presence] Listener error:", err);
      }
    });
  }
}

export const presenceService = new PresenceService();
