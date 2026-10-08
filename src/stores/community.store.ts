import { create } from "zustand";
import { communityApi, GetCommunityPostsParams } from "../api/community.api";
import { CommunityPost, CommunityComment } from "../types/api";

interface CommunityState {
  // Normalized posts map: id -> CommunityPost
  postsById: Record<string, CommunityPost>;
  // Categorized post ID lists: categoryKey -> [postId1, postId2, ...]
  categoryLists: Record<string, string[]>;
  // Set of post IDs with like toggle currently in flight
  inFlightLikes: Record<string, boolean>;
  // Debounce timestamp tracker: postId -> last tap timestamp
  lastLikeTapTimes: Record<string, number>;

  // Actions
  getPost: (postId: string) => CommunityPost | undefined;
  getPostsForCategory: (categoryKey: string) => CommunityPost[];
  setCategoryPosts: (categoryKey: string, posts: CommunityPost[]) => void;
  upsertPost: (post: CommunityPost) => void;
  upsertPosts: (posts: CommunityPost[]) => void;
  removePost: (postId: string) => void;

  // Liking actions with double-tap protection & concurrency locks
  toggleLike: (postId: string) => Promise<boolean>;
  likePost: (postId: string) => Promise<boolean>; // Guarantees like without unliking (for double-tap gestures)

  // Comment count synchronization
  incrementCommentsCount: (postId: string, amount?: number) => void;
  syncCommentsCount: (postId: string, actualCount: number) => void;

  // Optimistic post update
  updatePostLocally: (postId: string, updates: Partial<CommunityPost>) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  postsById: {},
  categoryLists: {},
  inFlightLikes: {},
  lastLikeTapTimes: {},

  getPost: (postId: string) => {
    return get().postsById[postId];
  },

  getPostsForCategory: (categoryKey: string) => {
    const ids = get().categoryLists[categoryKey] || [];
    const postsMap = get().postsById;
    return ids.map((id) => postsMap[id]).filter(Boolean);
  },

  setCategoryPosts: (categoryKey: string, posts: CommunityPost[]) => {
    set((state) => {
      const nextPostsById = { ...state.postsById };
      const nextIds: string[] = [];

      posts.forEach((p) => {
        if (!p || !p.id) return;
        // Merge with existing to preserve local up-to-date like/comment states if any
        const existing = nextPostsById[p.id];
        nextPostsById[p.id] = {
          ...p,
          isLiked: existing?.isLiked ?? p.isLiked ?? p.is_liked ?? false,
          is_liked: existing?.is_liked ?? p.is_liked ?? p.isLiked ?? false,
          likesCount: existing?.likesCount ?? p.likesCount ?? p.likes_count ?? 0,
          likes_count: existing?.likes_count ?? p.likes_count ?? p.likesCount ?? 0,
          commentsCount: existing?.commentsCount ?? p.commentsCount ?? p.comments_count ?? 0,
          comments_count: existing?.comments_count ?? p.comments_count ?? p.commentsCount ?? 0,
        };
        nextIds.push(p.id);
      });

      return {
        postsById: nextPostsById,
        categoryLists: {
          ...state.categoryLists,
          [categoryKey]: nextIds,
        },
      };
    });
  },

  upsertPost: (post: CommunityPost) => {
    if (!post || !post.id) return;
    set((state) => {
      const existing = state.postsById[post.id];
      const merged: CommunityPost = {
        ...existing,
        ...post,
        isLiked: post.isLiked ?? post.is_liked ?? existing?.isLiked ?? false,
        is_liked: post.is_liked ?? post.isLiked ?? existing?.is_liked ?? false,
        likesCount: post.likesCount ?? post.likes_count ?? existing?.likesCount ?? 0,
        likes_count: post.likes_count ?? post.likesCount ?? existing?.likes_count ?? 0,
        commentsCount: post.commentsCount ?? post.comments_count ?? existing?.commentsCount ?? 0,
        comments_count: post.comments_count ?? post.commentsCount ?? existing?.comments_count ?? 0,
      };

      return {
        postsById: {
          ...state.postsById,
          [post.id]: merged,
        },
      };
    });
  },

  upsertPosts: (posts: CommunityPost[]) => {
    if (!posts || posts.length === 0) return;
    set((state) => {
      const nextPostsById = { ...state.postsById };
      posts.forEach((post) => {
        if (!post || !post.id) return;
        const existing = nextPostsById[post.id];
        nextPostsById[post.id] = {
          ...existing,
          ...post,
          isLiked: post.isLiked ?? post.is_liked ?? existing?.isLiked ?? false,
          is_liked: post.is_liked ?? post.isLiked ?? existing?.is_liked ?? false,
          likesCount: post.likesCount ?? post.likes_count ?? existing?.likesCount ?? 0,
          likes_count: post.likes_count ?? post.likesCount ?? existing?.likes_count ?? 0,
          commentsCount: post.commentsCount ?? post.comments_count ?? existing?.commentsCount ?? 0,
          comments_count: post.comments_count ?? post.commentsCount ?? existing?.comments_count ?? 0,
        };
      });
      return { postsById: nextPostsById };
    });
  },

  removePost: (postId: string) => {
    set((state) => {
      const nextPostsById = { ...state.postsById };
      delete nextPostsById[postId];

      const nextCategoryLists: Record<string, string[]> = {};
      Object.entries(state.categoryLists).forEach(([cat, ids]) => {
        nextCategoryLists[cat] = ids.filter((id) => id !== postId);
      });

      return {
        postsById: nextPostsById,
        categoryLists: nextCategoryLists,
      };
    });
  },

  toggleLike: async (postId: string) => {
    const now = Date.now();
    const lastTap = get().lastLikeTapTimes[postId] || 0;

    // 1. Throttle rapid-fire taps within 350ms to eliminate accidental double-likes
    if (now - lastTap < 350) {
      return Boolean(get().postsById[postId]?.isLiked);
    }

    // 2. Concurrency lock: ignore if another like toggle is actively in-flight for this post
    if (get().inFlightLikes[postId]) {
      return Boolean(get().postsById[postId]?.isLiked);
    }

    const currentPost = get().postsById[postId];
    if (!currentPost) return false;

    // Mark tap time and lock
    set((state) => ({
      lastLikeTapTimes: { ...state.lastLikeTapTimes, [postId]: now },
      inFlightLikes: { ...state.inFlightLikes, [postId]: true },
    }));

    const currentlyLiked = Boolean(currentPost.isLiked ?? currentPost.is_liked);
    const currentCount = currentPost.likesCount ?? currentPost.likes_count ?? 0;
    const nextLiked = !currentlyLiked;
    const nextCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    // 3. Instant Optimistic Update
    set((state) => ({
      postsById: {
        ...state.postsById,
        [postId]: {
          ...state.postsById[postId],
          isLiked: nextLiked,
          is_liked: nextLiked,
          likesCount: nextCount,
          likes_count: nextCount,
        },
      },
    }));

    try {
      const res = await communityApi.toggleLike(postId);
      const serverLiked = res.data?.liked ?? nextLiked;
      const serverCount =
        res.data?.post?.likesCount ??
        res.data?.post?.likes_count ??
        (res.data?.post ? (serverLiked ? nextCount : Math.max(0, nextCount)) : nextCount);

      // Confirm with server response
      set((state) => {
        const post = state.postsById[postId];
        if (!post) return state;
        return {
          postsById: {
            ...state.postsById,
            [postId]: {
              ...post,
              ...(res.data?.post || {}),
              isLiked: serverLiked,
              is_liked: serverLiked,
              likesCount: serverCount,
              likes_count: serverCount,
            },
          },
        };
      });

      return serverLiked;
    } catch (err) {
      // 4. Revert optimistic update accurately on failure
      set((state) => {
        const post = state.postsById[postId];
        if (!post) return state;
        return {
          postsById: {
            ...state.postsById,
            [postId]: {
              ...post,
              isLiked: currentlyLiked,
              is_liked: currentlyLiked,
              likesCount: currentCount,
              likes_count: currentCount,
            },
          },
        };
      });
      return currentlyLiked;
    } finally {
      // Release in-flight lock
      set((state) => ({
        inFlightLikes: { ...state.inFlightLikes, [postId]: false },
      }));
    }
  },

  likePost: async (postId: string) => {
    const post = get().postsById[postId];
    if (!post) return false;
    // If already liked, simply keep it liked (great for double-tap gestures!)
    if (post.isLiked || post.is_liked) {
      return true;
    }
    return get().toggleLike(postId);
  },

  incrementCommentsCount: (postId: string, amount = 1) => {
    set((state) => {
      const post = state.postsById[postId];
      if (!post) return state;
      const cur = post.commentsCount ?? post.comments_count ?? 0;
      const nextCount = Math.max(0, cur + amount);
      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...post,
            commentsCount: nextCount,
            comments_count: nextCount,
          },
        },
      };
    });
  },

  syncCommentsCount: (postId: string, actualCount: number) => {
    set((state) => {
      const post = state.postsById[postId];
      if (!post) return state;
      const count = Math.max(0, actualCount);
      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...post,
            commentsCount: count,
            comments_count: count,
          },
        },
      };
    });
  },

  updatePostLocally: (postId: string, updates: Partial<CommunityPost>) => {
    set((state) => {
      const post = state.postsById[postId];
      if (!post) return state;
      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            ...post,
            ...updates,
          },
        },
      };
    });
  },
}));
