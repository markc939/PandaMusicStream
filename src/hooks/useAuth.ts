import { useState, useEffect, useCallback } from "react";
import { useAuthRequest, makeRedirectUri } from "expo-auth-session";

import {
  getStoredToken,
  refreshAccessToken,
  signOut as authSignOut,
  isSignedIn as checkSignedIn,
  exchangeCodeForToken,
  fetchUserInfo,
  getStoredUserInfo,
  UserInfo,
} from "../services/auth";
import { CLIENT_ID, SCOPES, OAUTH_DISCOVERY } from "../lib/constants";

const DISCOVERY = OAUTH_DISCOVERY;

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri: makeRedirectUri({ scheme: "pandamusicstreamer", path: "auth" }),
      extraParams: { prompt: "select_account" },
    },
    DISCOVERY
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      handleAuthCode(code);
    }
  }, [response]);

  async function checkAuth() {
    try {
      const signedIn = await checkSignedIn();
      if (signedIn) {
        setIsAuthenticated(true);
        const userInfo = await getStoredUserInfo();
        if (userInfo) setUser(userInfo);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAuthCode(code: string) {
    setIsLoading(true);
    try {
      const success = await exchangeCodeForToken(code);
      if (success) {
        const token = await getStoredToken();
        if (token) {
          const userInfo = await fetchUserInfo(token);
          if (userInfo) setUser(userInfo);
        }
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Auth failed:", e);
    } finally {
      setIsLoading(false);
    }
  }

  const signIn = useCallback(async () => {
    try {
      await promptAsync();
    } catch (e) {
      console.error("Sign in failed:", e);
    }
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    await authSignOut();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signOut,
    promptAsync,
  };
}
