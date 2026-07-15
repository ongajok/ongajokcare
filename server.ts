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

    // Compose the elegant message matching Alimtalk template layout
    const msg = `[가족간병 등록 접수 완료 안내]
안녕하세요, 온가족간병협회입니다.

보호자님께서 기재해 주신 정보가 협회 시스템에 안전하게 접수되었습니다.

📢 "협회는 정상 접수된 신청에 대하여 접수일을 기준으로 등록 효력이 발생한다." (협회 운영규정)

■ 신청 상세 내역
• 간병인: ${caregiverName} 님
• 환자명: ${patientName} 님
• 보호자: ${guardianName || "미기재"} 님
• 병원: ${hospitalName || "미기재"}
• 입원일: ${admissionDate || "미기재"}
• 간병비: ${caregivingFee || "협의"}
• 상태: 접수일 기준 등록 효력 실시간 발생

본 수신 고지는 증빙 보존용으로 발송되었습니다.
온가족간병협회 고객센터: 010-9520-7839`;

    // Retrieve credentials from environment variables
    const apiKey = process.env.ALIGO_API_KEY;
    const userId = process.env.ALIGO_USER_ID;
    const senderKey = process.env.ALIGO_SENDER_KEY;
    const senderPhone = process.env.ALIGO_SENDER_PHONE || "01095207839";

    const isConfigured = apiKey && apiKey !== "" && userId && userId !== "" && senderKey && senderKey !== "";

    const recipients = [
      { phone: caregiverPhone, role: "간병인" },
      { phone: guardianPhone, role: "보호자" },
      { phone: "010-9520-7839", role: "협회 고객센터" }
    ];

    if (!isConfigured) {
      console.warn("⚠️ [Aligo API Simulation] Environment secrets are not configured. Simulating delivery.");
      return res.json({
        success: true,
        mode: "simulated",
        message: "알리고 API 설정(API KEY 등)이 감지되지 않아 안전하게 시뮬레이션 발송을 수행했습니다.",
        recipients: recipients.map(r => ({ phone: r.phone, role: r.role, success: true })),
        msg
      });
    }

    console.log("🚀 [Aligo API Live] Triggering Kakao Alimtalk sending via template UJ_5407...");
    
    const results = [];
    for (const recipient of recipients) {
      const formattedReceiver = recipient.phone.replace(/[^0-9]/g, "");
      const formattedSender = senderPhone.replace(/[^0-9]/g, "");

      const params = new URLSearchParams();
      params.append("apikey", apiKey);
      params.append("userid", userId);
      params.append("senderkey", senderKey);
      params.append("tpl_code", "UJ_5407"); // Template code given by the user
      params.append("sender", formattedSender);
      params.append("receiver_1", formattedReceiver);
      params.append("subject_1", "[가족간병 등록 접수 완료]");
      params.append("message_1", msg);
      
      // Fallback configuration if Kakao Alimtalk fails
      params.append("failover", "Y");
      params.append("failover_sender", formattedSender);
      params.append("failover_subject_1", "[가족간병 등록 접수 완료]");
      params.append("failover_msg_1", msg);

      try {
        const response = await fetch("https://apis.aligo.in/akv10/alimtalk/send/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        });

        const resultJson: any = await response.json();
        console.log(`📡 [Aligo API Response for ${recipient.role}]:`, JSON.stringify(resultJson));
        
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
        results.push({
          phone: recipient.phone,
          role: recipient.role,
          success: false,
          error: err.message
        });
      }
    }

    const anySuccess = results.some(r => r.success);

    return res.json({
      success: anySuccess,
      mode: "live",
      message: anySuccess 
        ? "가족간병인 등록 알림톡/문자 발송이 완료되었습니다." 
        : "알림톡 발송 중 일부 혹은 전체 오류가 발생했습니다.",
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
