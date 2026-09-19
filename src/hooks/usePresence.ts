import { useEffect, useState, useCallback } from "react";
import { presenceService } from "../services/presence";
import { useAuthStore } from "../stores/auth.store";

export function usePresence() {
  const currentUser = useAuthStore((state) => state.user);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentUser?.id) {
      presenceService.initPresence(currentUser.id);
    }
    const unsubscribe = presenceService.subscribe((users) => {
      setOnlineUsers(new Set(users));
    });
    return unsubscribe;
  }, [currentUser?.id]);

  const isOnline = useCallback(
    (userId?: string | null): boolean => {
      if (!userId) return false;
      return presenceService.isOnline(userId);
    },
    [onlineUsers]
  );

  return {
    isOnline,
    onlineUsers,
  };
}
