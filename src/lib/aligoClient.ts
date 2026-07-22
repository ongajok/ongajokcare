/**
 * Unified Aligo Dispatch Client
 * Always proxies through backend Express endpoints (/api/send-alimtalk & /api/send-contract)
 * to ensure execution from the authorized server IP (34.34.244.39).
 */

export interface RegistrationAlimtalkPayload {
  caregiverName: string;
  caregiverPhone: string;
  patientName?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface ContractSMSPayload {
  caregiverName: string;
  caregiverPhone: string;
  patientName?: string;
  guardianPhone?: string;
  pdfUrl?: string;
}

export interface DispatchResult {
  success: boolean;
  mode: string;
  deliverySummary?: "alimtalk_success" | "sms_fallback_success" | "all_failed";
  message: string;
  templateUsed?: string;
  recipients?: any[];
}

/**
 * Sends Kakao Alimtalk for Registration via Express backend
 */
export async function sendRegistrationAlimtalk(payload: RegistrationAlimtalkPayload): Promise<DispatchResult> {
  console.log("📡 [Aligo Dispatch] Requesting backend Express proxy (/api/send-alimtalk)...");
  
  try {
    const res = await fetch("/api/send-alimtalk", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      console.log("📥 [Aligo Response]:", data);
      return data;
    } else {
      const text = await res.text();
      console.error("Non-JSON API response:", res.status, text);
      return {
        success: false,
        mode: "error_config",
        message: `[서버 연동 오류 ${res.status}] API 서버 응답이 올바르지 않습니다.`
      };
    }
  } catch (err: any) {
    console.error("❌ Network fetch error to /api/send-alimtalk:", err);
    return {
      success: false,
      mode: "error_config",
      message: `서버 통신 오류: ${err?.message || "네트워크 연결 실패"}. 잠시 후 다시 시도해 주세요.`
    };
  }
}

/**
 * Sends Contract SMS via Express backend
 */
export async function sendContractSMS(payload: ContractSMSPayload): Promise<DispatchResult> {
  console.log("📡 [Aligo Dispatch] Requesting backend Express proxy (/api/send-contract)...");
  
  try {
    const res = await fetch("/api/send-contract", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    } else {
      return {
        success: false,
        mode: "error_config",
        message: `[서버 연동 오류 ${res.status}] API 서버 응답 오류가 발생했습니다.`
      };
    }
  } catch (err: any) {
    console.error("❌ Network fetch error to /api/send-contract:", err);
    return {
      success: false,
      mode: "error_config",
      message: `서버 통신 오류: ${err?.message || "네트워크 연결 실패"}. 잠시 후 다시 시도해 주세요.`
    };
  }
}
