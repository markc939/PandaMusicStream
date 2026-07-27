declare module "expo-auth-session" {
  export function exchangeCodeAsync(
    config: any,
    discovery: any
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }>;

  export function refreshAsync(
    config: any,
    discovery: any
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }>;
}
