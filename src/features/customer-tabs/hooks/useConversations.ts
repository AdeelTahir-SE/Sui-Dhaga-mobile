import { useState, useEffect, useCallback } from 'react';
import { conversationsApi } from '../../../api/conversations.api';
import { ConversationItem } from '../../../types/api';

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await conversationsApi.getConversations();
      if (res.data && Array.isArray(res.data)) {
        setConversations(res.data);
      } else {
        setConversations([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
      setConversations([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
