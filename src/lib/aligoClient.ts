/**
 * Robust Aligo Alimtalk / SMS Service for PC, Mobile, KakaoTalk Webview, and Custom Domains.
 * 
 * Strategy:
 * 1. Primary Attempt: Calls backend Express `/api/send-alimtalk` or `/api/send-contract`.
 * 2. Automatic Client Fallback: If backend is unreachable (e.g. static host, custom domain, or unauthenticated Cloud Run dev URL),
 *    sends request directly to Aligo's CORS-enabled API endpoints (https://kakaoapi.aligo.in & https://apis.aligo.in).
 */

const ALIGO_CONFIG = {
  apiKey: "a84t4xtpv4pu9k107tlook6lj8mpt3dh",
  userId: "ongajok1090",
  senderKey: "90393b608b562a491a73e74e7e5331b8b41ba0e0",
  senderPhone: "01095207839",
};

// Approved Kakao Templates
const TEMPLATE_UJ_6650_FULL = `가족간병 등록 접수 완료 안내
안녕하세요.
온가족간병협회입니다.
기재해 주신 정보가 협회 시스템에 안전하게 접수되었습니다.

"협회는 정상 접수된 신청에 대하여 접수일을 기준으로 등록 효력이 발생합니다." (협회 운영규정)

간병인: #{간병인명}님
보호자: #{보호자명}님

ℹ️ 문의사항은 고객센터(010-9520-7839)로 연락주세요.
채널 추가하고 이 채널의 광고와 마케팅 메시지를 카카오톡으로 받기`;

const TEMPLATE_UJ_6650_NO_FOOTER = `가족간병 등록 접수 완료 안내
안녕하세요.
온가족간병협회입니다.
기재해 주신 정보가 협회 시스템에 안전하게 접수되었습니다.

"협회는 정상 접수된 신청에 대하여 접수일을 기준으로 등록 효력이 발생합니다." (협회 운영규정)

간병인: #{간병인명}님
보호자: #{보호자명}님

ℹ️ 문의사항은 고객센터(010-9520-7839)로 연락주세요.`;

const TEMPLATE_UJ_5407 = `가족간병 등록 접수 완료 안내
안녕하세요.
온가족간병협회입니다.
기재해 주신 정보가 협회 시스템에 안전하게 접수되었습니다.

간병인: #{간병인명}님
보호자: #{보호자명}님

문의사항은 고객센터(010-9520-7839)로 연락주세요.`;

export interface RegistrationAlimtalkPayload {
  caregiverName: string;
  caregiverPhone: string;
  patientName?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface AlimtalkResult {
  success: boolean;
  mode: "live" | "client_direct" | "simulated" | "error_config" | "live_failed";
  message: string;
  recipients?: any[];
}

/**
 * Sends Kakao Alimtalk for Caregiver Registration.
 */
export async function sendRegistrationAlimtalk(payload: RegistrationAlimtalkPayload): Promise<AlimtalkResult> {
  const cName = payload.caregiverName.trim();
  const gName = (payload.guardianName || "미기재").trim();

  // Tier 1: Try backend Express server proxy endpoint
  try {
    console.log("📡 [Aligo Dispatch] Attempting backend Express proxy (/api/send-alimtalk)...");
    const res = await fetch("/api/send-alimtalk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      console.log("✅ [Aligo Dispatch] Backend proxy succeeded:", data);
      return data;
    }
    console.warn(`⚠️ [Aligo Dispatch] Backend proxy returned status ${res.status}. Falling back to direct Aligo API...`);
  } catch (err: any) {
    console.warn(`⚠️ [Aligo Dispatch] Backend proxy fetch failed (${err?.message || err}). Falling back to direct Aligo API...`);
  }

  // Tier 2: Direct Client-Side Aligo Alimtalk API Call
  console.log("🚀 [Aligo Dispatch] Executing Direct Client-Side Aligo Alimtalk API...");

  const recipients = [
    { phone: payload.caregiverPhone, role: "간병인" },
    ...(payload.guardianPhone ? [{ phone: payload.guardianPhone, role: "보호자" }] : []),
    { phone: "010-9520-7839", role: "협회 고객센터" }
  ];

  const msg6650Full = TEMPLATE_UJ_6650_FULL.replace("#{간병인명}", cName).replace("#{보호자명}", gName);
  const msg6650NoFooter = TEMPLATE_UJ_6650_NO_FOOTER.replace("#{간병인명}", cName).replace("#{보호자명}", gName);
  const msg5407 = TEMPLATE_UJ_5407.replace("#{간병인명}", cName).replace("#{보호자명}", gName);

  const results: any[] = [];

  for (const recipient of recipients) {
    const rawPhone = recipient.phone.replace(/[^0-9]/g, "");
    if (!rawPhone) continue;

    const callDirectAligo = async (tplCode: string, msgText: string) => {
      const params = new URLSearchParams();
      params.append("apikey", ALIGO_CONFIG.apiKey);
      params.append("userid", ALIGO_CONFIG.userId);
      params.append("senderkey", ALIGO_CONFIG.senderKey);
      params.append("tpl_code", tplCode);
      params.append("sender", ALIGO_CONFIG.senderPhone);
      params.append("receiver_1", rawPhone);
      params.append("subject_1", "[가족간병 등록 접수 완료]");
      params.append("message_1", msgText);
      params.append("failover", "Y");
      params.append("fsender", ALIGO_CONFIG.senderPhone);
      params.append("fsubject_1", "[가족간병 등록 접수 완료]");
      params.append("fmessage_1", msgText);

      const response = await fetch("https://kakaoapi.aligo.in/akv10/alimtalk/send/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      return await response.json();
    };

    try {
      let resJson = await callDirectAligo("UJ_6650", msg6650Full);

      // Template mismatch fallback 1
      if (resJson && (resJson.code === -3008 || resJson.code === -3010 || resJson.code === -3011)) {
        resJson = await callDirectAligo("UJ_6650", msg6650NoFooter);
      }

      // Template mismatch fallback 2
      if (resJson && resJson.code !== 0 && resJson.code !== "0" && resJson.result_code !== 1) {
        resJson = await callDirectAligo("UJ_5407", msg5407);
      }

      const isSuccess = resJson && (resJson.code === 0 || resJson.code === "0" || resJson.result_code === 1 || resJson.result_code === "1");
      results.push({
        phone: recipient.phone,
        role: recipient.role,
        success: isSuccess,
        data: resJson,
      });
    } catch (err: any) {
      console.error(`❌ [Aligo Direct Error] for ${recipient.role}:`, err);
      results.push({
        phone: recipient.phone,
        role: recipient.role,
        success: false,
        error: err?.message || "네트워크 오류",
      });
    }
  }

  const anySuccess = results.some((r) => r.success);

  return {
    success: anySuccess,
    mode: anySuccess ? "live" : "live_failed",
    message: anySuccess
      ? "가족간병인 등록 알림톡/문자 발송이 완료되었습니다."
      : "알림톡 발송 중 오류가 발생했습니다. (연락처 및 알리고 설정 확인 필요)",
    recipients: results,
  };
}

export interface ContractSMSPayload {
  caregiverName: string;
  caregiverPhone: string;
  patientName?: string;
  guardianPhone?: string;
  pdfUrl?: string;
}

/**
 * Sends Contract Link SMS via Aligo SMS API.
 */
export async function sendContractSMS(payload: ContractSMSPayload): Promise<AlimtalkResult> {
  // Tier 1: Try backend Express proxy
  try {
    const res = await fetch("/api/send-contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (err) {
    console.warn("⚠️ Backend contract SMS endpoint unreachable. Trying direct SMS API...");
  }

  // Tier 2: Direct Client-Side Aligo SMS API
  const recipients = [
    { phone: payload.caregiverPhone, role: "간병인" },
    ...(payload.guardianPhone ? [{ phone: payload.guardianPhone, role: "보호자" }] : []),
    { phone: "010-9520-7839", role: "협회 고객센터" },
  ];

  const results: any[] = [];
  const msgText = `[온가족간병협회] ${payload.caregiverName}님, 가족간병 계약서 서명이 작성되었습니다. ${payload.pdfUrl ? `\n\n계약서 보기: ${payload.pdfUrl}` : ""}`;

  for (const recipient of recipients) {
    const rawPhone = recipient.phone.replace(/[^0-9]/g, "");
    if (!rawPhone) continue;

    const params = new URLSearchParams();
    params.append("key", ALIGO_CONFIG.apiKey);
    params.append("user_id", ALIGO_CONFIG.userId);
    params.append("sender", ALIGO_CONFIG.senderPhone);
    params.append("receiver", rawPhone);
    params.append("msg", msgText);
    params.append("title", "[온가족간병협회 계약서]");

    try {
      const response = await fetch("https://apis.aligo.in/send/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const data = await response.json();
      const isSuccess = data && (data.result_code === "1" || data.result_code === 1);
      results.push({ phone: recipient.phone, role: recipient.role, success: isSuccess, data });
    } catch (err: any) {
      results.push({ phone: recipient.phone, role: recipient.role, success: false, error: err?.message });
    }
  }

  const anySuccess = results.some((r) => r.success);
  return {
    success: anySuccess,
    mode: anySuccess ? "live" : "live_failed",
    message: anySuccess ? "계약서 안내 문자가 성공적으로 전송되었습니다." : "문자 발송 실패",
    recipients: results,
  };
}
