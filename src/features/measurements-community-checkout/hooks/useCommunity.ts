import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { communityApi, GetCommunityPostsParams } from "../../../api/community.api";
import { CommunityComment, CommunityPost } from "../../../types/api";
import { useCommunityStore } from "../../../stores/community.store";

export function useCommunity(initialCategory = "For You") {
  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRequestRef = useRef<number>(0);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Subscribe to store updates for this category
  const categoryKey = useMemo(() => {
    return `${category.toLowerCase()}_${debouncedSearch.trim().toLowerCase()}`;
  }, [category, debouncedSearch]);

  const postsById = useCommunityStore((state) => state.postsById);
  const categoryLists = useCommunityStore((state) => state.categoryLists);
  const setCategoryPosts = useCommunityStore((state) => state.setCategoryPosts);
  const storeToggleLike = useCommunityStore((state) => state.toggleLike);

  const posts = useMemo(() => {
    const ids = categoryLists[categoryKey] || [];
    return ids.map((id) => postsById[id]).filter(Boolean);
  }, [categoryLists, categoryKey, postsById]);

  const fetchPosts = useCallback(
    async (cat?: string, search?: string, isRefresh = false) => {
      const requestId = ++activeRequestRef.current;
      const currentCat = cat !== undefined ? cat : category;
      const currentSearch = search !== undefined ? search : debouncedSearch;
      const currentKey = `${currentCat.toLowerCase()}_${currentSearch.trim().toLowerCase()}`;

      // Check if we already have cached posts to display immediately
      const existingIds = useCommunityStore.getState().categoryLists[currentKey];
      const hasCached = existingIds && existingIds.length > 0;

      if (isRefresh) {
        setIsRefreshing(true);
      } else if (!hasCached) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const params: GetCommunityPostsParams = {
          limit: 30,
        };

        if (currentCat && !["all", "for you"].includes(currentCat.toLowerCase())) {
          params.category = currentCat;
        }
        if (currentSearch.trim()) {
          params.search = currentSearch.trim();
        }

        const res = await communityApi.getPosts(params);

        // Discard if a newer request was dispatched
        if (requestId !== activeRequestRef.current) return;

        const records = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.records || [];

        // Save normalized in store
        setCategoryPosts(currentKey, records);
        setError(null);
      } catch (err: any) {
        if (requestId !== activeRequestRef.current) return;
        const msg =
          err?.message ||
          "Unable to connect to community feed. Please check your internet connection.";
        setError(msg);
      } finally {
        if (requestId === activeRequestRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [category, debouncedSearch, setCategoryPosts]
  );

  useEffect(() => {
    fetchPosts(category, debouncedSearch);
  }, [category, debouncedSearch, fetchPosts]);

  const refresh = useCallback(() => {
    fetchPosts(category, debouncedSearch, true);
  }, [category, debouncedSearch, fetchPosts]);

  const toggleLike = useCallback(
    async (postId: string) => {
      return storeToggleLike(postId);
    },
    [storeToggleLike]
  );

  return {
    posts,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    isLoading: isLoading && posts.length === 0,
    isRefreshing,
    error,
    refresh,
    toggleLike,
  };
}

export function usePostDetails(postId: string) {
  const post = useCommunityStore((state) => state.postsById[postId] || null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertPost = useCommunityStore((state) => state.upsertPost);
  const storeToggleLike = useCommunityStore((state) => state.toggleLike);
  const incrementCommentsCount = useCommunityStore((state) => state.incrementCommentsCount);
  const syncCommentsCount = useCommunityStore((state) => state.syncCommentsCount);

  const fetchDetails = useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [postRes, commentsRes] = await Promise.all([
        communityApi.getPostById(postId),
        communityApi.getComments(postId).catch(() => ({ data: [] })),
      ]);

      if (postRes.data) {
        const loadedComments = Array.isArray(commentsRes.data) ? commentsRes.data : [];
        const serverPost = postRes.data;
        // Make sure comment count reflects the actual comments array length if available
        const actualCount = loadedComments.length > 0 ? loadedComments.length : (serverPost.commentsCount ?? serverPost.comments_count ?? 0);
        serverPost.commentsCount = actualCount;
        serverPost.comments_count = actualCount;

        upsertPost(serverPost);
        setComments(loadedComments);
      } else {
        setError("Post not found");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load post details");
    } finally {
      setIsLoading(false);
    }
  }, [postId, upsertPost]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const addComment = useCallback(
    async (content: string) => {
      if (!postId || !content.trim()) return false;
      setIsSubmittingComment(true);
      try {
        const res = await communityApi.addComment(postId, content.trim());
        if (res.data) {
          const newComment = res.data;
          setComments((prev) => [...prev, newComment]);
          // Synchronize comment count in global store
          incrementCommentsCount(postId, 1);
          return true;
        }
        return false;
      } catch (err: any) {
        throw new Error(err?.message || "Failed to submit comment");
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [postId, incrementCommentsCount]
  );

  const toggleLike = useCallback(async () => {
    if (!postId) return;
    return storeToggleLike(postId);
  }, [postId, storeToggleLike]);

  return {
    post,
    comments,
    isLoading,
    isSubmittingComment,
    error,
    refresh: fetchDetails,
    addComment,
    toggleLike,
  };
}
