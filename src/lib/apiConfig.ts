/**
 * Dynamically resolves the backend API Base URL.
 * Supports local preview, Cloud Run dev/pre environments, and external custom domains (e.g., ongajokcare.kr, KakaoTalk in-app webview).
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    // If running on AI Studio Cloud Run or localhost, use current origin
    if (
      origin.includes("ais-dev-") ||
      origin.includes("ais-pre-") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.includes("run.app")
    ) {
      return origin;
    }
  }
  // Production Cloud Run backend endpoint for external domains / Kakao in-app browser
  return "https://ais-pre-yga4hzrbdlkj4ywjfxh73f-951708005562.asia-east1.run.app";
};

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};
