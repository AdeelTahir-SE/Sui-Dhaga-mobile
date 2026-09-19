import { useCallback, useEffect, useRef, useState } from "react";
import { communityApi, GetCommunityPostsParams } from "../../../api/community.api";
import { CommunityComment, CommunityPost } from "../../../types/api";

export function useCommunity(initialCategory = "For You") {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRequestRef = useRef<number>(0);

  const fetchPosts = useCallback(
    async (cat?: string, search?: string, isRefresh = false) => {
      const requestId = ++activeRequestRef.current;
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const currentCat = cat !== undefined ? cat : category;
        const currentSearch = search !== undefined ? search : searchQuery;

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

        setPosts(records);
        setError(null);
      } catch (err: any) {
        if (requestId !== activeRequestRef.current) return;
        const msg =
          err?.message ||
          "Unable to connect to community feed. Please check your internet connection.";
        setError(msg);
        setPosts([]);
      } finally {
        if (requestId === activeRequestRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [category, searchQuery]
  );

  useEffect(() => {
    fetchPosts(category, searchQuery);
  }, [category, searchQuery, fetchPosts]);

  const refresh = useCallback(() => {
    fetchPosts(category, searchQuery, true);
  }, [category, searchQuery, fetchPosts]);

  const toggleLike = useCallback(async (postId: string) => {
    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const currentlyLiked = Boolean(p.isLiked ?? p.is_liked);
          const currentCount = p.likesCount ?? p.likes_count ?? 0;
          const nextLiked = !currentlyLiked;
          const nextCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
          return {
            ...p,
            isLiked: nextLiked,
            is_liked: nextLiked,
            likesCount: nextCount,
            likes_count: nextCount,
          };
        }
        return p;
      })
    );

    try {
      const res = await communityApi.toggleLike(postId);
      if (res.data?.post) {
        const serverPost = res.data.post;
        const serverLiked = res.data.liked;
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  ...serverPost,
                  isLiked: serverLiked,
                  is_liked: serverLiked,
                }
              : p
          )
        );
      }
    } catch {
      // Revert optimistic update on failure
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id === postId) {
            const currentlyLiked = Boolean(p.isLiked ?? p.is_liked);
            const currentCount = p.likesCount ?? p.likes_count ?? 0;
            const revertedLiked = !currentlyLiked;
            const revertedCount = revertedLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
            return {
              ...p,
              isLiked: revertedLiked,
              is_liked: revertedLiked,
              likesCount: revertedCount,
              likes_count: revertedCount,
            };
          }
          return p;
        })
      );
    }
  }, []);

  return {
    posts,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    isLoading,
    isRefreshing,
    error,
    refresh,
    toggleLike,
  };
}

export function usePostDetails(postId: string) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setPost(postRes.data);
      } else {
        setError("Post not found");
      }

      if (Array.isArray(commentsRes.data)) {
        setComments(commentsRes.data);
      } else {
        setComments([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load post details");
      setPost(null);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

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
          // Increment comment count on post
          setPost((prev) => {
            if (!prev) return null;
            const count = (prev.commentsCount ?? prev.comments_count ?? 0) + 1;
            return {
              ...prev,
              commentsCount: count,
              comments_count: count,
            };
          });
          return true;
        }
        return false;
      } catch (err: any) {
        throw new Error(err?.message || "Failed to submit comment");
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [postId]
  );

  const toggleLike = useCallback(async () => {
    if (!post) return;
    const currentlyLiked = Boolean(post.isLiked ?? post.is_liked);
    const currentCount = post.likesCount ?? post.likes_count ?? 0;
    const nextLiked = !currentlyLiked;
    const nextCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    // Optimistic
    setPost({
      ...post,
      isLiked: nextLiked,
      is_liked: nextLiked,
      likesCount: nextCount,
      likes_count: nextCount,
    });

    try {
      const res = await communityApi.toggleLike(post.id);
      if (res.data?.post) {
        setPost({
          ...post,
          ...res.data.post,
          isLiked: res.data.liked,
          is_liked: res.data.liked,
        });
      }
    } catch {
      // Revert
      setPost({
        ...post,
        isLiked: currentlyLiked,
        is_liked: currentlyLiked,
        likesCount: currentCount,
        likes_count: currentCount,
      });
    }
  }, [post]);

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
