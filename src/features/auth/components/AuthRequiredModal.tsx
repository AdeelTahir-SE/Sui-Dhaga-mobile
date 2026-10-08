import { useEffect } from "react";
import { router, usePathname, useSegments } from "expo-router";
import { useAuthStore } from "../../../stores/auth.store";

/**
 * Checks if the given route belongs to authentication pages or initial redirect
 */
export function isAuthRoute(pathname?: string | null, segments?: string[]): boolean {
  if (!pathname && (!segments || segments.length === 0)) {
    // Router not yet mounted/initialized
    return true;
  }

  // Check segments
  if (segments && segments.length > 0) {
    const firstSegment = segments[0];
    if (firstSegment === "auth" || firstSegment === "(auth)") {
      return true;
    }
  }

  // Check pathname
  if (pathname) {
    const normalized = pathname.toLowerCase();
    if (
      normalized === "/" ||
      normalized === "/index" ||
      normalized === "/auth" ||
      normalized.startsWith("/auth/")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Auth guard that redirects unauthenticated users directly to the login page
 * instead of showing an authentication required modal.
 */
export function AuthRequiredModal() {
  const pathname = usePathname();
  const segments = useSegments();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const isAuthPage = isAuthRoute(pathname, segments);
  const isUnauthenticated =
    !isAuthenticated ||
    !user ||
    !user.id ||
    user.id === "guest" ||
    user.id.startsWith("guest");

  useEffect(() => {
    // When authentication check is complete and user is unauthenticated on a protected page,
    // redirect directly to the login page
    if (!isLoading && isUnauthenticated && !isAuthPage) {
      router.replace("/auth/login" as any);
    }
  }, [isLoading, isUnauthenticated, isAuthPage, pathname, segments]);

  return null;
}

export const AuthGuard = AuthRequiredModal;
