import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

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

// Debug route to safely verify environment variables on the running server
app.get("/api/debug-env", (req, res) => {
  const envKeys = Object.keys(process.env);
  const aligoEnv: Record<string, any> = {};
  for (const key of envKeys) {
    if (key.startsWith("ALIGO_") || key === "PORT" || key === "NODE_ENV") {
      const val = process.env[key];
      aligoEnv[key] = {
        exists: !!val,
        length: val ? val.length : 0,
        masked: val ? (val.length > 4 ? `${val.substring(0, 2)}...${val.substring(val.length - 2)}` : "***") : null
      };
    }
  }
  res.json({
    status: "ok",
    node_env: process.env.NODE_ENV,
    aligoEnv
  });
});

// Kakao approved Alimtalk template (UJ_6650 - Main)
const KAKAO_TEMPLATE_UJ_6650 = `가족간병 등록 접수 완료 안내
안녕하세요.
온가족간병협회입니다.
기재해 주신 정보가 협회 시스템에 안전하게 접수되었습니다.

"협회는 정상 접수된 신청에 대하여 접수일을 기준으로 등록 효력이 발생합니다." (협회 운영규정)

간병인: #{간병인명}님
보호자: #{보호자명}님

ℹ️ 문의사항은 고객센터(010-9520-7839)로 연락주세요.
채널 추가하고 이 채널의 광고와 마케팅 메시지를 카카오톡으로 받기`;

// Alternative without channel footer line if Kakao DB omits footer from message body
const KAKAO_TEMPLATE_UJ_6650_NO_FOOTER = `가족간병 등록 접수 완료 안내
안녕하세요.
온가족간병협회입니다.
기재해 주신 정보가 협회 시스템에 안전하게 접수되었습니다.

"협회는 정상 접수된 신청에 대하여 접수일을 기준으로 등록 효력이 발생합니다." (협회 운영규정)

간병인: #{간병인명}님
보호자: #{보호자명}님

ℹ️ 문의사항은 고객센터(010-9520-7839)로 연락주세요.`;

// Secondary Kakao approved Alimtalk template (UJ_5407)
const KAKAO_TEMPLATE_UJ_5407 = `가족간병 등록 접수 완료 안내
안녕하세요.
온가족간병협회입니다.
기재해 주신 정보가 협회 시스템에 안전하게 접수되었습니다.

간병인: #{간병인명}님
보호자: #{보호자명}님

문의사항은 고객센터(010-9520-7839)로 연락주세요.`;

/**
 * Validates that the final message matches the Kakao approved template structure.
 */
function validateMessageAgainstTemplate(message: string): boolean {
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  let pattern1 = escapeRegExp(KAKAO_TEMPLATE_UJ_6650)
    .replace("#\\{간병인명\\}", "(.+)")
    .replace("#\\{보호자명\\}", "(.+)");
    
  let pattern2 = escapeRegExp(KAKAO_TEMPLATE_UJ_6650_NO_FOOTER)
    .replace("#\\{간병인명\\}", "(.+)")
    .replace("#\\{보호자명\\}", "(.+)");

  let pattern3 = escapeRegExp(KAKAO_TEMPLATE_UJ_5407)
    .replace("#\\{간병인명\\}", "(.+)")
    .replace("#\\{보호자명\\}", "(.+)");
    
  return new RegExp(`^${pattern1}$`).test(message) || new RegExp(`^${pattern2}$`).test(message) || new RegExp(`^${pattern3}$`).test(message);
}

// Real-time Aligo Alimtalk / SMS API proxy endpoint
app.post("/api/send-alimtalk", async (req, res) => {
  try {
    const {
      caregiverPhone,
      guardianPhone,
      caregiverName,
      patientName,
      guardianName,
      hospitalName,
      admissionDate,
      caregivingFee
    } = req.body;

    if (!caregiverPhone || !guardianPhone || !caregiverName || !patientName) {
      return res.status(400).json({
        success: false,
        message: "필수 정보(간병인 이름, 연락처, 보호자 연락처, 환자 이름)가 누락되었습니다."
      });
    }

    const cName = caregiverName.trim();
    const gName = (guardianName || "미기재").trim();

    // Compile message variations strictly matching approved template UJ_6650
    const msgUJ6650Full = KAKAO_TEMPLATE_UJ_6650.replace("#{간병인명}", cName).replace("#{보호자명}", gName);
    const msgUJ6650NoFooter = KAKAO_TEMPLATE_UJ_6650_NO_FOOTER.replace("#{간병인명}", cName).replace("#{보호자명}", gName);
    const msgUJ5407 = KAKAO_TEMPLATE_UJ_5407.replace("#{간병인명}", cName).replace("#{보호자명}", gName);

    // Primary message
    const msg = msgUJ6650Full;

    // Credentials
    let apiKey = process.env.ALIGO_API_KEY || "a84t4xtpv4pu9k107tlook6lj8mpt3dh";
    let userId = process.env.ALIGO_USER_ID || "ongajok1090";
    let senderKey = process.env.ALIGO_SENDER_KEY || "90393b608b562a491a73e74e7e5331b8b41ba0e0";
    let senderPhone = process.env.ALIGO_SENDER_PHONE || "01095207839";
    let primaryTplCode = process.env.ALIGO_TEMPLATE_CODE || "UJ_6650";

    const recipients = [
      { phone: caregiverPhone, role: "간병인" },
      { phone: guardianPhone, role: "보호자" },
      { phone: "010-9520-7839", role: "협회 고객센터" }
    ];

    console.log("=========================================");
    console.log(`📡 [Aligo API Dispatch Request]`);
    console.log(`- API User ID: ${userId}`);
    console.log(`- Sender Phone: ${senderPhone}`);
    console.log(`- Primary Template: ${primaryTplCode}`);
    console.log("=========================================");

    // Helper for Direct LMS/SMS Fallback
    const sendAligoSmsDirect = async (receiverNum: string, titleText: string, messageBody: string) => {
      const smsParams = new URLSearchParams();
      smsParams.append("key", apiKey);
      smsParams.append("user_id", userId);
      smsParams.append("sender", senderPhone.replace(/[^0-9]/g, ""));
      smsParams.append("receiver", receiverNum.replace(/[^0-9]/g, ""));
      smsParams.append("title", titleText);
      smsParams.append("msg", messageBody);

      console.log(`📱 [LMS Fallback Request] URL: https://apis.aligo.in/send/ | Target: ${receiverNum}`);
      
      try {
        const smsRes = await fetch("https://apis.aligo.in/send/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: smsParams.toString()
        });
        const smsJson: any = await smsRes.json();
        console.log(`📥 [LMS Fallback Response JSON]:`, JSON.stringify(smsJson, null, 2));
        const isSmsOk = smsJson && (smsJson.result_code === "1" || smsJson.result_code === 1);
        return { isSuccess: isSmsOk, data: smsJson, status: smsRes.status };
      } catch (smsErr: any) {
        console.error(`❌ [LMS Fallback Network Error]:`, smsErr.message);
        return { isSuccess: false, data: { error: smsErr.message }, status: 500 };
      }
    };

    const results = [];
    for (const recipient of recipients) {
      const formattedReceiver = recipient.phone.replace(/[^0-9]/g, "");
      const formattedSender = senderPhone.replace(/[^0-9]/g, "");

      const executeAlimtalkSend = async (tplCode: string, messageBody: string) => {
        const params = new URLSearchParams();
        params.append("apikey", apiKey);
        params.append("userid", userId);
        params.append("senderkey", senderKey);
        params.append("tpl_code", tplCode);
        params.append("sender", formattedSender);
        params.append("receiver_1", formattedReceiver);
        params.append("subject_1", "[가족간병 등록 접수 완료]");
        params.append("message_1", messageBody);
        
        // Failover settings
        params.append("failover", "Y");
        params.append("fsender", formattedSender);
        params.append("fsubject_1", "[가족간병 등록 접수 완료]");
        params.append("fmessage_1", messageBody);

        console.log(`\n📤 [Aligo Alimtalk Request] Target: ${recipient.role} (${formattedReceiver}) | Template: ${tplCode}`);

        const response = await fetch("https://kakaoapi.aligo.in/akv10/alimtalk/send/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString()
        });

        const status = response.status;
        const resultJson: any = await response.json();

        console.log(`📥 [Aligo Alimtalk Response Raw for ${recipient.role}]: HTTP ${status}`);
        console.log(JSON.stringify(resultJson, null, 2));

        const isOk = resultJson && (
          resultJson.code === 0 || 
          resultJson.code === "0" || 
          resultJson.result_code === "1" || 
          resultJson.result_code === 1
        );

        return { status, resultJson, tplCode, messageBody, isSuccess: isOk };
      };

      try {
        // Attempt 1: UJ_6650 with full template body
        let alimtalkRes = await executeAlimtalkSend("UJ_6650", msgUJ6650Full);

        // If template error (-3008, -3010, -3011, etc.), retry UJ_6650 without footer or UJ_5407
        const isTemplateError = alimtalkRes.resultJson && (
          alimtalkRes.resultJson.code === -3008 || 
          alimtalkRes.resultJson.code === -3010 || 
          alimtalkRes.resultJson.code === -3011 ||
          (alimtalkRes.resultJson.message && (alimtalkRes.resultJson.message.includes("템플릿") || alimtalkRes.resultJson.message.includes("일치")))
        );

        if (!alimtalkRes.isSuccess && isTemplateError) {
          console.warn(`⚠️ [Template Reject Retry 1] Retrying UJ_6650 without footer line for ${recipient.role}...`);
          alimtalkRes = await executeAlimtalkSend("UJ_6650", msgUJ6650NoFooter);
        }

        if (!alimtalkRes.isSuccess && isTemplateError) {
          console.warn(`⚠️ [Template Reject Retry 2] Retrying secondary approved UJ_5407 for ${recipient.role}...`);
          alimtalkRes = await executeAlimtalkSend("UJ_5407", msgUJ5407);
        }

        let smsResult = null;
        let deliveryStatus: "alimtalk_success" | "sms_fallback_success" | "all_failed" = "all_failed";

        if (alimtalkRes.isSuccess) {
          deliveryStatus = "alimtalk_success";
        } else {
          // REQUIREMENT ② & ⑥: Alimtalk failed or rejected -> Immediate Direct LMS/SMS Fallback
          console.warn(`🚨 [Alimtalk Reject/Failure for ${recipient.role} (${formattedReceiver})] Code: ${alimtalkRes.resultJson?.code}, Message: ${alimtalkRes.resultJson?.message}. Initiating Direct LMS Fallback via https://apis.aligo.in/send/...`);
          
          smsResult = await sendAligoSmsDirect(
            formattedReceiver,
            "[가족간병 등록 접수 완료]",
            msgUJ6650NoFooter
          );

          if (smsResult.isSuccess) {
            console.log(`✅ [LMS Fallback Success for ${recipient.role} (${formattedReceiver})] msg_id: ${smsResult.data?.msg_id}`);
            deliveryStatus = "sms_fallback_success";
          } else {
            console.error(`❌ [LMS Fallback Failed for ${recipient.role} (${formattedReceiver})] code: ${smsResult.data?.result_code}, msg: ${smsResult.data?.message}`);
            deliveryStatus = "all_failed";
          }
        }

        results.push({
          phone: recipient.phone,
          role: recipient.role,
          deliveryStatus,
          alimtalkSuccess: alimtalkRes.isSuccess,
          alimtalkData: alimtalkRes.resultJson,
          smsFallbackSuccess: smsResult ? smsResult.isSuccess : false,
          smsData: smsResult ? smsResult.data : null,
          templateUsed: alimtalkRes.tplCode
        });

      } catch (err: any) {
        console.error(`❌ Dispatch Exception for ${recipient.role}:`, err.message);
        
        // Try emergency LMS direct
        const emergencySms = await sendAligoSmsDirect(formattedReceiver, "[가족간병 등록 접수 완료]", msgUJ6650NoFooter);
        
        results.push({
          phone: recipient.phone,
          role: recipient.role,
          deliveryStatus: emergencySms.isSuccess ? "sms_fallback_success" : "all_failed",
          alimtalkSuccess: false,
          alimtalkData: { error: err.message },
          smsFallbackSuccess: emergencySms.isSuccess,
          smsData: emergencySms.data,
          error: err.message
        });
      }
    }

    const anyAlimtalkSuccess = results.some(r => r.deliveryStatus === "alimtalk_success");
    const anySmsSuccess = results.some(r => r.deliveryStatus === "sms_fallback_success");
    const anySuccess = anyAlimtalkSuccess || anySmsSuccess;

    let overallSummary: "alimtalk_success" | "sms_fallback_success" | "all_failed" = "all_failed";
    let displayMessage = "";

    if (results.every(r => r.deliveryStatus === "alimtalk_success")) {
      overallSummary = "alimtalk_success";
      displayMessage = "가족간병인 등록 알림톡이 카카오톡으로 정상 발송되었습니다.";
    } else if (anySuccess) {
      overallSummary = "sms_fallback_success";
      displayMessage = "알림톡 발송 중 일부 오류가 발생하여 대체 문자(LMS)로 정상 발송되었습니다.";
    } else {
      overallSummary = "all_failed";
      displayMessage = "알림톡 및 문자 발송에 모두 실패했습니다. (알리고 IP 및 발신자 번호 설정 확인 필요)";
    }

    return res.json({
      success: anySuccess,
      mode: "live",
      deliverySummary: overallSummary,
      message: displayMessage,
      templateUsed: primaryTplCode,
      recipients: results,
      msg
    });

  } catch (error: any) {
    console.error("❌ Error in send-alimtalk route:", error);
    return res.status(500).json({
      success: false,
      message: "서버 내부 오류로 인해 발송 요청 처리에 실패했습니다.",
      error: error.message
    });
  }
});

// Real-time Aligo SMS API proxy endpoint for Caregiver Contract
app.post("/api/send-contract", async (req, res) => {
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

    let apiKey = process.env.ALIGO_API_KEY;
    if (!apiKey || apiKey === "" || apiKey === "undefined") {
      apiKey = "a84t4xtpv4pu9k107tlook6lj8mpt3dh";
    }

    let userId = process.env.ALIGO_USER_ID;
    if (!userId || userId === "" || userId === "undefined") {
      userId = "ongajok1090";
    }

    let senderPhone = process.env.ALIGO_SENDER_PHONE;
    if (!senderPhone || senderPhone === "" || senderPhone === "undefined") {
      senderPhone = "01095207839";
    }

    // Recipients: client, caregiver, and Association Customer Center "010-9520-7839"
    const recipients = [
      { phone: clientPhone, role: "구인자(보호자)" },
      { phone: caregiverPhone, role: "구직자(간병인)" },
      { phone: "010-9520-7839", role: "협회 고객센터" }
    ];

    const results = [];
    for (const recipient of recipients) {
      const formattedReceiver = recipient.phone.replace(/[^0-9]/g, "");
      const formattedSender = senderPhone.replace(/[^0-9]/g, "");

      const params = new URLSearchParams();
      params.append("key", apiKey);
      params.append("user_id", userId);
      params.append("sender", formattedSender);
      params.append("receiver", formattedReceiver);
      params.append("msg", msg);
      params.append("msg_type", "LMS");
      params.append("title", "[온가족간병 중개계약]");

      try {
        const response = await fetch("https://apis.aligo.in/send/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        });

        const status = response.status;
        const resultJson: any = await response.json();
        console.log(`📡 [Aligo SMS API Response status: ${status} for ${recipient.role}]:`, JSON.stringify(resultJson));

        const isSuccess = 
          resultJson.result_code === "1" || 
          resultJson.result_code === 1 ||
          resultJson.success === true;

        results.push({
          phone: recipient.phone,
          role: recipient.role,
          success: isSuccess,
          data: resultJson
        });
      } catch (err: any) {
        console.error(`❌ SMS Fetch Error for ${recipient.role}:`, err.message);
        results.push({
          phone: recipient.phone,
          role: recipient.role,
          success: false,
          error: err.message
        });
      }
    }

    const anySuccess = results.some(r => r.success);

    // Retrieve dynamic outbound IP
    let outboundIp = "34.34.244.39";
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData: any = await ipRes.json();
      if (ipData && ipData.ip) {
        outboundIp = ipData.ip;
      }
    } catch (e) {
      // ignore
    }

    let displayMessage = "중개 계약서 작성 알림 문자가 정상 전송되었습니다.";
    if (!anySuccess) {
      const errorDetails = results.map(r => `[${r.role}] ${r.data ? (r.data.message || JSON.stringify(r.data)) : r.error}`).join(', ');
      displayMessage = `문자 실제 전송 실패 사유: ${errorDetails} (현재 서버 Outbound IP: ${outboundIp})`;
    }

    return res.json({
      success: anySuccess,
      mode: "live",
      message: displayMessage,
      recipients: results,
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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

// Configure Vite or Static Assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
