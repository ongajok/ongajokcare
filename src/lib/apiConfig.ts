/**
 * Smart API Fetch Utility that ensures seamless connectivity on PC, Mobile, 
 * KakaoTalk in-app browsers, and custom domains (e.g. ongajokcare.kr).
 */
export async function smartApiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // 1. Primary Attempt: Same-Origin Relative Fetch (e.g. /api/send-alimtalk)
  // Same-origin fetches never trigger CORS errors or browser webview security blocks.
  try {
    const res = await fetch(cleanEndpoint, options);
    const contentType = res.headers.get("content-type") || "";
    
    if (res.ok && contentType.includes("application/json")) {
      return res;
    }
    console.warn(`⚠️ Relative fetch to ${cleanEndpoint} returned status ${res.status} (${contentType}). Trying fallback...`);
  } catch (err: any) {
    console.warn(`⚠️ Relative fetch to ${cleanEndpoint} failed: ${err?.message || err}. Trying fallback...`);
  }

  // 2. Fallback Attempt: Direct Production Cloud Run URL
  const fallbackBase = "https://ais-pre-yga4hzrbdlkj4ywjfxh73f-951708005562.asia-east1.run.app";
  const fallbackUrl = `${fallbackBase}${cleanEndpoint}`;
  console.log(`📡 Attempting fallback fetch to absolute URL: ${fallbackUrl}`);
  
  return await fetch(fallbackUrl, {
    ...options,
    mode: "cors",
  });
}

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return cleanEndpoint;
};
