import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Kakao approved Alimtalk template (UJ_5407)
const KAKAO_TEMPLATE_UJ_5407 = `[가족간병 등록 접수 완료 안내]
안녕하세요, 온가족간병협회입니다.

보호자님께서 기재해 주신 정보가 협회 시스템에 안전하게 접수되었습니다.

📢 "협회는 정상 접수된 신청에 대하여 접수일을 기준으로 등록 효력이 발생한다." (협회 운영규정)

■ 신청 상세 내역
• 간병인: #{caregiverName} 님
• 환자명: #{patientName} 님
• 보호자: #{guardianName} 님
• 병원: #{hospitalName}
• 입원일: #{admissionDate}
• 간병비: #{caregivingFee}
• 상태: 접수일 기준 등록 효력 실시간 발생

본 수신 고지는 증빙 보존용으로 발송되었습니다.
온가족간병협회 고객센터: 010-9520-7839`;

/**
 * Validates that the final message perfectly matches the Kakao approved template structure.
 */
function validateMessageAgainstTemplate(message: string): boolean {
  // Escape special characters in template for regex
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  let pattern = escapeRegExp(KAKAO_TEMPLATE_UJ_5407);
  // Replace escaped placeholders with capture groups (.+) matching non-empty values
  pattern = pattern
    .replace("#\\{caregiverName\\}", "(.+)")
    .replace("#\\{patientName\\}", "(.+)")
    .replace("#\\{guardianName\\}", "(.+)")
    .replace("#\\{hospitalName\\}", "(.+)")
    .replace("#\\{admissionDate\\}", "(.+)")
    .replace("#\\{caregivingFee\\}", "(.+)");
    
  const regex = new RegExp(`^${pattern}$`);
  return regex.test(message);
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

    // Compile message based on Kakao approved template
    const msg = KAKAO_TEMPLATE_UJ_5407
      .replace("#{caregiverName}", caregiverName)
      .replace("#{patientName}", patientName)
      .replace("#{guardianName}", guardianName || "미기재")
      .replace("#{hospitalName}", hospitalName || "미기재")
      .replace("#{admissionDate}", admissionDate || "미기재")
      .replace("#{caregivingFee}", caregivingFee || "협의");

    // 100% strict automated validation checking before calling the API
    if (!validateMessageAgainstTemplate(msg)) {
      return res.status(400).json({
        success: false,
        message: "알림톡 발송 실패: 생성된 메시지 본문이 카카오 승인 템플릿(UJ_5407) 규격과 100% 일치하지 않습니다. 운영 정책상 전송이 제한되었습니다.",
        generatedMessage: msg,
        templateExpected: KAKAO_TEMPLATE_UJ_5407
      });
    }

    // Robust credential checks (falling back to user's direct values if env is undefined, empty, or placeholder)
    let apiKey = process.env.ALIGO_API_KEY;
    if (!apiKey || apiKey === "" || apiKey === "undefined") {
      apiKey = "a84t4xtpv4pu9k107tlook6lj8mpt3dh";
    }

    let userId = process.env.ALIGO_USER_ID;
    if (!userId || userId === "" || userId === "undefined") {
      userId = "ongajok1090";
    }

    let senderKey = process.env.ALIGO_SENDER_KEY;
    if (!senderKey || senderKey === "" || senderKey === "undefined") {
      senderKey = "90393b608b562a491a73e74e7e5331b8b41ba0e0";
    }

    let senderPhone = process.env.ALIGO_SENDER_PHONE;
    if (!senderPhone || senderPhone === "" || senderPhone === "undefined") {
      senderPhone = "01095207839";
    }

    const recipients = [
      { phone: caregiverPhone, role: "간병인" },
      { phone: guardianPhone, role: "보호자" },
      { phone: "010-9520-7839", role: "협회 고객센터" }
    ];

    console.log("=========================================");
    console.log(`📡 [Aligo API Live Init]`);
    console.log(`- API User ID: ${userId}`);
    console.log(`- API Key (masked): ${apiKey.substring(0, 8)}...`);
    console.log(`- Sender Key: ${senderKey}`);
    console.log(`- Sender Phone: ${senderPhone}`);
    console.log("=========================================");

    const results = [];
    for (const recipient of recipients) {
      const formattedReceiver = recipient.phone.replace(/[^0-9]/g, "");
      const formattedSender = senderPhone.replace(/[^0-9]/g, "");

      const params = new URLSearchParams();
      params.append("apikey", apiKey);
      params.append("userid", userId);
      params.append("senderkey", senderKey);
      params.append("tpl_code", "UJ_5407"); // Official approved Template Code
      params.append("sender", formattedSender);
      params.append("receiver_1", formattedReceiver);
      params.append("subject_1", "[가족간병 등록 접수 완료]");
      params.append("message_1", msg);
      
      // Fallback configuration if Kakao Alimtalk fails
      params.append("failover", "Y");
      params.append("fsender", formattedSender);
      params.append("fsubject_1", "[가족간병 등록 접수 완료]");
      params.append("fmessage_1", msg);

      console.log(`📤 Sending Alimtalk to ${recipient.role} (${formattedReceiver})...`);

      try {
        const response = await fetch("https://kakaoapi.aligo.in/akv10/alimtalk/send/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        });

        const status = response.status;
        const resultJson: any = await response.json();
        console.log(`📡 [Aligo API Response status: ${status} for ${recipient.role}]:`, JSON.stringify(resultJson));
        
        const isSuccess = 
          resultJson.code === 0 || 
          resultJson.code === "0" || 
          resultJson.result_code === "1" || 
          resultJson.result_code === 1 ||
          resultJson.result_code === "0" ||
          resultJson.result_code === 0 ||
          resultJson.status === "success";
        
        results.push({
          phone: recipient.phone,
          role: recipient.role,
          success: isSuccess,
          data: resultJson
        });
      } catch (err: any) {
        console.error(`❌ Fetch Error for ${recipient.role}:`, err.message);
        results.push({
          phone: recipient.phone,
          role: recipient.role,
          success: false,
          error: err.message
        });
      }
    }

    const anySuccess = results.some(r => r.success);

    // Dynamically retrieve the current outbound IP of this container
    let outboundIp = "34.34.244.39";
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData: any = await ipRes.json();
      if (ipData && ipData.ip) {
        outboundIp = ipData.ip;
      }
    } catch (e) {
      console.warn("Failed to fetch outbound IP dynamically:", e);
    }

    console.log(`ℹ️ Current Server Outbound IP: ${outboundIp}`);

    // Specific, robust checks for Aligo error messages (since code is always -99)
    const isIpError = results.some(r => r.data && (r.data.code === -99 || r.data.code === "-99") && r.data.message && (r.data.message.includes("IP") || r.data.message.includes("서버 IP") || r.data.message.includes("인증되지 않는")));
    const isSenderPhoneError = results.some(r => r.data && (r.data.code === -99 || r.data.code === "-99") && r.data.message && (r.data.message.includes("발신자") || r.data.message.includes("발신번호") || r.data.message.includes("sender")));

    let displayMessage = "가족간병인 등록 알림톡/문자 발송이 완료되었습니다.";
    if (!anySuccess) {
      if (isIpError) {
        displayMessage = `[알리고 IP 허용 오류] 알리고에 등록되지 않은 서버 IP(${outboundIp})에서 발송을 시도했습니다. 알리고 사이트의 [발송서버 IP등록] 메뉴에 현재 우리 서버 IP인 '${outboundIp}'를 등록하신 후 다시 신청서를 제출해 주세요.`;
      } else if (isSenderPhoneError) {
        displayMessage = `[알리고 발신번호 미등록 오류] 사용하신 발신자 번호 '${senderPhone}'가 알리고 사이트에 '발신번호'로 인증/등록되어 있지 않습니다. 알리고 사이트의 [발신번호 관리] 메뉴에 이 번호를 추가 및 등록하신 후 다시 신청서를 제출해 주세요.`;
      } else {
        const errorDetails = results.map(r => `[${r.role}] ${r.data ? (r.data.message || JSON.stringify(r.data)) : r.error}`).join(', ');
        displayMessage = `알림톡 실제 전송 실패 사유: ${errorDetails} (현재 서버 Outbound IP: ${outboundIp})`;
      }
    }

    return res.json({
      success: anySuccess,
      mode: "live",
      message: displayMessage,
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
