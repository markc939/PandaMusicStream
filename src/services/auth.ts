import {
  makeRedirectUri,
  exchangeCodeAsync,
  refreshAsync,
  ResponseType,
  AuthRequest,
} from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { CLIENT_ID, SCOPES, OAUTH_DISCOVERY } from "../lib/constants";

const TOKEN_KEY = "panda_auth_token";
const REFRESH_KEY = "panda_refresh_token";
const EXPIRY_KEY = "panda_token_expiry";
const USER_KEY = "panda_user_info";

const DISCOVERY = OAUTH_DISCOVERY;

export interface UserInfo {
  displayName: string;
  email: string;
  userId: string;
}

function getRedirectUri(): string {
  if (Platform.OS === "web") {
    return makeRedirectUri();
  }
  return makeRedirectUri({ scheme: "pandamusicstreamer", path: "auth" });
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const result = await refreshAsync(
      {
        clientId: CLIENT_ID,
        scopes: SCOPES,
        refreshToken,
      },
      DISCOVERY
    );

    await SecureStore.setItemAsync(TOKEN_KEY, result.accessToken);
    if (result.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_KEY, result.refreshToken);
    }
    if (result.expiresIn) {
      const expiry = Date.now() + result.expiresIn * 1000;
      await SecureStore.setItemAsync(EXPIRY_KEY, expiry.toString());
    }

    return result.accessToken;
  } catch {
    await signOut();
    return null;
  }
}

export async function getValidToken(): Promise<string | null> {
  const expiry = await SecureStore.getItemAsync(EXPIRY_KEY);
  if (expiry && Date.now() < parseInt(expiry) - 60000) {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }
  return refreshAccessToken();
}

export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  await SecureStore.deleteItemAsync(EXPIRY_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function isSignedIn(): Promise<boolean> {
  const token = await getValidToken();
  return token !== null;
}

export function createAuthRequest(): AuthRequest | null {
  const redirectUri = getRedirectUri();
  const request = new AuthRequest({
    clientId: CLIENT_ID,
    scopes: SCOPES,
    redirectUri,
    responseType: ResponseType.Code,
    extraParams: {
      prompt: "select_account",
    },
  });
  return request;
}

export async function exchangeCodeForToken(code: string): Promise<boolean> {
  try {
    const redirectUri = getRedirectUri();
    const result = await exchangeCodeAsync(
      {
        clientId: CLIENT_ID,
        scopes: SCOPES,
        code,
        redirectUri,
        extraParams: { code_verifier: "" },
      },
      DISCOVERY
    );

    await SecureStore.setItemAsync(TOKEN_KEY, result.accessToken);
    if (result.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_KEY, result.refreshToken);
    }
    if (result.expiresIn) {
      const expiry = Date.now() + result.expiresIn * 1000;
      await SecureStore.setItemAsync(EXPIRY_KEY, expiry.toString());
    }

    return true;
  } catch (e) {
    console.error("Token exchange failed:", e);
    return false;
  }
}

export async function fetchUserInfo(accessToken: string): Promise<UserInfo | null> {
  try {
    const res = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const userInfo: UserInfo = {
      displayName: data.displayName || "",
      email: data.mail || data.userPrincipalName || "",
      userId: data.id || "",
    };
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userInfo));
    return userInfo;
  } catch {
    return null;
  }
}

export async function getStoredUserInfo(): Promise<UserInfo | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
