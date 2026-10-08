import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useAuthStore } from "../../stores/auth.store";

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{
    access_token?: string;
    token?: string;
    code?: string;
    error?: string;
    error_description?: string;
  }>();

  const [statusMessage, setStatusMessage] = useState("Finalizing sign in...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function processAuth() {
      try {
        WebBrowser.maybeCompleteAuthSession();

        // 0. If user is already authenticated (e.g. handled directly in LoginScreen)
        if (useAuthStore.getState().isAuthenticated) {
          const user = useAuthStore.getState().user;
          if (user?.role === "tailor") {
            router.replace("/tailor-dashboard" as any);
          } else {
            router.replace("/home" as any);
          }
          return;
        }

        // 1. Check if error returned in params
        if (params.error || params.error_description) {
          const err = params.error_description || params.error || "Authentication failed";
          if (isMounted) setErrorMessage(err);
          return;
        }

        // 2. Read parameters and initial URL in case tokens were passed in query or fragment
        let token = params.access_token || params.token || "";
        let code = params.code || "";

        const initialUrl = await Linking.getInitialURL();
        if ((!token && !code) && initialUrl) {
          if (initialUrl.includes("#")) {
            const hash = initialUrl.split("#")[1];
            const searchParams = new URLSearchParams(hash);
            token = searchParams.get("access_token") || searchParams.get("token") || "";
            code = searchParams.get("code") || "";
          }
          if (!token && !code) {
            const parsed = Linking.parse(initialUrl);
            token = (parsed.queryParams?.access_token as string) || (parsed.queryParams?.token as string) || "";
            code = (parsed.queryParams?.code as string) || "";
          }
          if (!token) {
            const match = initialUrl.match(/[?#&]access_token=([^&#]+)/);
            if (match) token = decodeURIComponent(match[1]);
          }
        }

        if (!token && !code) {
          // If still no token but user is authenticated, redirect
          if (useAuthStore.getState().isAuthenticated) {
            const user = useAuthStore.getState().user;
            if (user?.role === "tailor") {
              router.replace("/tailor-dashboard" as any);
            } else {
              router.replace("/home" as any);
            }
            return;
          }
          throw new Error("Authentication callback did not receive authorization credentials.");
        }

        // 3. Process with Auth Store
        const result = await useAuthStore.getState().handleAuthCallback({
          accessToken: token || undefined,
          code: code || undefined,
        });

        if (!isMounted) return;

        if (result.success) {
          setStatusMessage("Sign in complete! Redirecting...");
          const user = useAuthStore.getState().user;
          const userExists = result.isExistingUser ?? !result.needsProfileCompletion;

          if (userExists) {
            // User exists: check if customer or tailor
            if (user?.role === "tailor") {
              router.replace("/tailor-dashboard" as any);
            } else {
              router.replace("/home" as any);
            }
          } else {
            // User does not exist: redirect to complete profile page
            router.replace("/auth/complete-profile" as any);
          }
        } else {
          setErrorMessage(result.error || "Unable to complete Google sign in.");
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err?.message || "An error occurred during authentication.");
        }
      }
    }

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [params]);

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.errorTitle}>Sign In Failed</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.replace("/auth/login" as any)}
          >
            <Text style={styles.btnText}>Return to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#1A847B" />
        <Text style={styles.title}>{statusMessage}</Text>
        <Text style={styles.subtitle}>Please wait a moment...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 320,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  btn: {
    backgroundColor: "#1A847B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
