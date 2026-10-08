import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data remains fresh for 5 minutes, preventing constant spinner reloads on screen transitions
      staleTime: 5 * 60 * 1000,
      // Cached data garbage collected after 15 minutes of non-usage
      gcTime: 15 * 60 * 1000,
      // Refetch once on error
      retry: 1,
      // Avoid unexpected background refetches on mobile
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
