import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";

// Load environment variables
dotenv.config();

export const app = express();

// Enable CORS for mobile browsers, KakaoTalk in-app webviews, and custom domains
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.header("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger for API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    console.log(`🌐 [API Request] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || 'same-origin'} | UA: ${req.headers['user-agent'] || 'none'}`);
  }
  next();
});

// Helper function to safely get environment variable with non-empty fallback
function getEnvVal(key: string, fallback: string): string {
  const val = process.env[key];
  if (!val || val.trim() === "" || val === "undefined" || val === "null") {
    return fallback;
  }
  return val.trim();
}

// Solapi REST API v4 Authentication Header Generator
function generateSolapiAuthHeader(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");

  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

// Core helper to dispatch messages via Solapi REST API v4
async function sendSolapiMessages(messages: Array<{ to: string; from: string; text: string; subject?: string; type?: string }>) {
  const apiKey = getEnvVal("SOLAPI_API_KEY", "");
  const apiSecret = getEnvVal("SOLAPI_API_SECRET", "");

  console.log("🔍 [Solapi Environment Check]:", {
    SOLAPI_API_KEY: apiKey ? `설정됨 (${apiKey.substring(0, 4)}...)` : "❌ 미설정 (process.env.SOLAPI_API_KEY 가 비어있거나 undefined)",
    SOLAPI_API_SECRET: apiSecret ? `설정됨 (${apiSecret.substring(0, 4)}...)` : "❌ 미설정 (process.env.SOLAPI_API_SECRET 이 비어있거나 undefined)",
    SOLAPI_SENDER_PHONE: getEnvVal("SOLAPI_SENDER_PHONE", "01095207839")
  });

  if (!apiKey || !apiSecret) {
    const missingKeys = [];
    if (!apiKey) missingKeys.push("SOLAPI_API_KEY");
    if (!apiSecret) missingKeys.push("SOLAPI_API_SECRET");

    console.error(`❌ [Solapi 오류] 환경변수를 읽을 수 없습니다: ${missingKeys.join(", ")}`);
    console.error("💡 AI Studio 좌측/상단 메뉴의 [Settings(설정) -> Environment Variables / Secrets] 메뉴에서 SOLAPI_API_KEY 와 SOLAPI_API_SECRET 을 등록해 주세요.");

    return {
      success: false,
      status: 401,
      message: `[환경변수 오류] ${missingKeys.join(", ")} 환경변수가 설정되지 않았습니다. AI Studio 설정(Settings) 메뉴에서 환경변수를 입력해 주세요.`,
      data: null
    };
  }

  const authHeader = generateSolapiAuthHeader(apiKey, apiSecret);

  try {
    const response = await fetch("https://api.solapi.com/messages/v4/send-many", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages })
    });

    const status = response.status;
    const resData: any = await response.json();
    console.log(`📥 [Solapi API Response status: ${status}]:`, JSON.stringify(resData, null, 2));

    if (status >= 200 && status < 300) {
      return {
        success: true,
        status,
        message: "솔라피 안내 문자(LMS) 발송 성공",
        data: resData
      };
    } else {
      const errMsg = resData?.errorMessage || resData?.message || `솔라피 API 오류 (HTTP ${status})`;
      return {
        success: false,
        status,
        message: `[솔라피 오류] ${errMsg}`,
        data: resData
      };
    }
  } catch (err: any) {
    console.error("❌ [Solapi API Network Exception]:", err.message);
    return {
      success: false,
      status: 500,
      message: `솔라피 통신 오류: ${err.message}`,
      data: null
    };
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "온가족간병협회 API 서버가 정상 작동 중입니다.",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  });
});

// Debug route to safely verify Solapi environment variables on running server
app.get("/api/debug-env", (req, res) => {
  const envKeys = Object.keys(process.env);
  const solapiEnv: Record<string, any> = {};
  for (const key of envKeys) {
    if (key.startsWith("SOLAPI_") || key === "PORT" || key === "NODE_ENV") {
      const val = process.env[key];
      solapiEnv[key] = {
        exists: !!val,
        length: val ? val.length : 0,
        masked: val ? (val.length > 4 ? `${val.substring(0, 2)}...${val.substring(val.length - 2)}` : "***") : null
      };
    }
  }
  res.json({
    status: "ok",
    node_env: process.env.NODE_ENV,
    solapiEnv
  });
});

// Real-time Solapi Direct SMS/LMS API proxy endpoint for Family Caregiver Registration
app.post(["/api/send-alimtalk", "/send-alimtalk", "/api/send-sms", "/send-sms"], async (req, res) => {
  try {
    const {
      caregiverPhone,
      guardianPhone,
      caregiverName,
      patientName,
      guardianName,
    } = req.body;

    if (!caregiverPhone || !guardianPhone || !caregiverName) {
      return res.status(400).json({
        success: false,
        message: "필수 정보(간병인 이름, 연락처, 보호자 연락처)가 누락되었습니다."
      });
    }

    const cName = caregiverName.trim();
    const gName = (guardianName || "미기재").trim();
    const pName = (patientName || "미기재").trim();

    const senderPhone = getEnvVal("SOLAPI_SENDER_PHONE", "01095207839").replace(/[^0-9]/g, "");

    // 3 Recipients: ① Caregiver, ② Guardian, ③ Association Customer Center (010-9520-7839)
    const recipients = [
      { phone: caregiverPhone, role: "간병인" },
      { phone: guardianPhone, role: "보호자" },
      { phone: "010-9520-7839", role: "협회 고객센터" }
    ];

    // Detailed Info LMS message content containing patient name, caregiver name & phone, guardian name & phone
    const detailedLmsMsg = `[온가족간병협회] 가족간병 등록 상세 안내

안녕하세요. 온가족간병협회입니다.
가족간병 등록 신청이 정상 접수되었습니다.

[접수 정보 및 상세 연락처]
• 환자명: ${pName}
• 간병인: ${cName} (${caregiverPhone})
• 보호자: ${gName} (${guardianPhone})

※ 원활한 간병 진행을 위해 보호자와 간병인 서로의 성명 및 연락처가 안내됩니다.
문의: 온가족간병협회 고객센터 (010-9520-7839)`;

    console.log("=========================================");
    console.log(`📡 [Solapi LMS Dispatch Request]`);
    console.log(`- Sender Phone: ${senderPhone}`);
    console.log(`- Recipients count: ${recipients.length}`);
    console.log("=========================================");

    const solapiMessages = recipients.map(r => ({
      to: r.phone.replace(/[^0-9]/g, ""),
      from: senderPhone,
      subject: "[온가족간병협회] 가족간병 등록 상세 안내",
      text: detailedLmsMsg,
      type: "LMS"
    }));

    const result = await sendSolapiMessages(solapiMessages);

    let mainMessage = "가족간병 등록 접수가 완료되었습니다.\n안내 문자가 정상 발송되었습니다.";
    if (!result.success) {
      mainMessage = `문자 발송 실패:\n${result.message}`;
    }

    return res.status(200).json({
      success: result.success,
      mode: "live",
      deliverySummary: result.success ? "sms_success" : "all_failed",
      message: mainMessage,
      solapiData: result.data,
      msg: detailedLmsMsg
    });

  } catch (error: any) {
    console.error("❌ Exception in /api/send-alimtalk (Solapi):", error);
    return res.status(500).json({
      success: false,
      message: `서버 내부 오류가 발생했습니다: ${error.message}`
    });
  }
});

// Real-time Solapi SMS/LMS API proxy endpoint for Caregiver Contract
app.post(["/api/send-contract", "/send-contract"], async (req, res) => {
  try {
    const {
      clientName,
      clientPhone,
      caregiverName,
      caregiverPhone,
      patientName,
      location,
      caregivingFeeDay
    } = req.body;

    if (!clientName || !clientPhone || !caregiverName || !caregiverPhone || !patientName) {
      return res.status(400).json({
        success: false,
        message: "필수 정보(구인자 이름, 구인자 연락처, 구직자 이름, 구직자 연락처, 환자 이름)가 누락되었습니다."
      });
    }

    const msg = `[온가족간병협회] 중개 계약서 접수 완료
■ 계약 상세 내역
- 구인자(보호자): ${clientName} 님
- 구직자(간병인): ${caregiverName} 님
- 환자명: ${patientName} 님
- 근무 대상지: ${location || "미지정"}
- 일일 간병비: ${caregivingFeeDay} 원
- 서명 완료 및 시스템 등재 처리되었습니다.

온가족간병협회 고객센터: 010-9520-7839`;

    const senderPhone = getEnvVal("SOLAPI_SENDER_PHONE", "01095207839").replace(/[^0-9]/g, "");

    const recipients = [
      { phone: clientPhone, role: "구인자(보호자)" },
      { phone: caregiverPhone, role: "구직자(간병인)" },
      { phone: "010-9520-7839", role: "협회 고객센터" }
    ];

    const solapiMessages = recipients.map(r => ({
      to: r.phone.replace(/[^0-9]/g, ""),
      from: senderPhone,
      subject: "[온가족간병 중개계약]",
      text: msg,
      type: "LMS"
    }));

    const result = await sendSolapiMessages(solapiMessages);

    let displayMessage = "중개 계약서 작성 알림 문자가 정상 전송되었습니다.";
    if (!result.success) {
      displayMessage = `문자 발송 실패 사유: ${result.message}`;
    }

    return res.json({
      success: result.success,
      mode: "live",
      message: displayMessage,
      solapiData: result.data,
      msg
    });

  } catch (error: any) {
    console.error("❌ Error in send-contract route:", error);
    return res.status(500).json({
      success: false,
      message: "서버 내부 오류로 인해 발송 요청 처리에 실패했습니다.",
      error: error.message
    });
  }
});

// JSON Fallback Handler for unknown /api/* endpoints
app.all("/api/*", (req, res) => {
  console.warn(`⚠️ [API 404 Not Found] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `[서버 연동 오류 404] API 경로(${req.originalUrl})를 찾을 수 없습니다. (엔드포인트 라우팅 확인 필요)`,
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

export default app;
