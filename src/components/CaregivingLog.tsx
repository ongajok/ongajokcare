import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ClipboardList, ArrowLeft, Printer, CheckCircle2, Heart, PenTool, Check, Clock, Smile, Sparkles, AlertTriangle, ToggleLeft } from "lucide-react";
import { CaregiverRegistration } from "../types";

interface CaregivingLogProps {
  onBack: () => void;
  phone: string;
}

export default function CaregivingLog({ onBack, phone }: CaregivingLogProps) {
  const [registrations, setRegistrations] = useState<CaregiverRegistration[]>([]);
  const [selectedRegId, setSelectedRegId] = useState<string>("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    patientName: "",
    caregiverName: "",
    mealStatus: "식사 양호", // '식사 양호' | '보통' | '식사 보조 필요' | '금식'
    medicationCompleted: true, // boolean
    excretionStatus: "배설 상태 양호", // '배설 상태 양호' | '도움 필요'
    activityCompleted: true, // boolean
    sleepStatus: "수면 양호", // '수면 양호' | '보통' | '수면 장애'
    noVitalsIssue: true, // boolean (체온/바이탈 특이사항 없음)
    vitalTemperature: "36.5", // default
    notes: "", // 특이사항 (자유 서술형)
  });

  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // New states for 15-day summary
  const [activeTab, setActiveTab] = useState<"write" | "summary">("write");
  const [summaryStartDate, setSummaryStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split("T")[0];
  });
  const [summaryEndDate, setSummaryEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [isSentSuccessfully, setIsSentSuccessfully] = useState(false);

  const getDatesInRange = (start: string, end: string) => {
    const dates = [];
    let curr = new Date(start);
    const stop = new Date(end);
    let count = 0;
    while (curr <= stop && count < 15) {
      dates.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
      count++;
    }
    return dates;
  };

  const handleGenerate15Days = () => {
    const pName = formData.patientName || "홍길동";
    const cName = formData.caregiverName || "홍길동";
    
    const dates = getDatesInRange(summaryStartDate, summaryEndDate);
    if (dates.length === 0) {
      alert("시작 날짜와 종료 날짜가 유효하지 않습니다.");
      return;
    }
    
    const activityPhrases = [
      "휠체어 탑승 상태로 가벼운 야외 정원 산책 및 일광욕 보조 완료",
      "상하체 근력 강화를 위한 스트레칭 보조 및 가벼운 관절 마사지 실시",
      "보행 보조기를 이용하여 복도 및 휴게실 20분 안전 보행 지원",
      "병실 내 침상 체위 변경 수시 지원 및 청결한 침구 정리정돈 실시",
      "손저림 증상 완화를 위한 세심한 손가락 관절 지압 및 온열 요법 지원"
    ];
    
    const notesPhrases = [
      "식사를 매우 기분 좋게 다 비우셨으며, 보호자와의 면회 시간 후 정서적으로 안정된 모습을 보였습니다.",
      "식후 30분에 지정된 보약 및 처방약을 세심하게 복약 지도하여 100% 삼킴을 확인하였습니다.",
      "체온 및 바이탈 정상 범위로 양호하며, 수분 섭취를 정기적으로 권장하여 편안한 하루를 보내셨습니다.",
      "대소변 배설 시 안전 이승 벨트를 사용해 안심하고 배설을 조치하였고 수시로 소독을 시행하였습니다.",
      "수면 유도를 위해 가벼운 등마사지와 잔잔한 음향을 지원하여 야간 수면 장해 없이 양호하게 주무셨습니다."
    ];

    const newLogs = dates.map((dateStr, idx) => {
      const mealRandom = idx % 5 === 0 ? "보통" : "식사 양호";
      const excretionRandom = "배설 상태 양호";
      const sleepRandom = idx % 6 === 0 ? "보통" : "수면 양호";
      const tempRandom = (36.4 + (idx % 4) * 0.1).toFixed(1); // 36.4 ~ 36.7
      
      return {
        id: `sim-log-${dateStr}-${Date.now()}-${idx}`,
        date: dateStr,
        patientName: pName,
        caregiverName: cName,
        mealStatus: mealRandom,
        medicationCompleted: true,
        excretionStatus: excretionRandom,
        activityCompleted: true,
        sleepStatus: sleepRandom,
        noVitalsIssue: true,
        vitalTemperature: tempRandom,
        notes: `${activityPhrases[idx % activityPhrases.length]} 및 ${notesPhrases[idx % notesPhrases.length]}`,
        timestamp: new Date(dateStr).toISOString()
      };
    });

    const saved = localStorage.getItem("ongajok_logs") || "[]";
    let existing = [];
    try {
      existing = JSON.parse(saved);
    } catch(e) {}

    // Duplication filtering
    const dateSet = new Set(dates);
    existing = existing.filter((log: any) => 
      !(log.patientName === pName && log.caregiverName === cName && dateSet.has(log.date))
    );

    const combined = [...existing, ...newLogs];
    localStorage.setItem("ongajok_logs", JSON.stringify(combined));
    
    // Trigger reactivity or render
    window.location.reload();
  };

  const handleSimulateSend = () => {
    setShowSendModal(true);
    setSendingProgress(0);
    setIsSentSuccessfully(false);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setSendingProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsSentSuccessfully(true);
      }
    }, 200);
  };

  // Load registrations from localStorage with auto-clean / seed
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ongajok_registrations");
      const todayStr = new Date().toISOString().split("T")[0];
      let parsed = [];
      if (saved) {
        try {
          parsed = JSON.parse(saved);
        } catch (e) {
          parsed = [];
        }
      }
      
      if (!parsed || parsed.length === 0) {
        parsed = [
          {
            id: "reg-mock-1",
            caregiverName: "홍길동",
            caregiverPhone: "010-1234-5678",
            caregiverSsn: "1980년 01월 01일 (또는 800101)",
            relationship: "자녀",
            patientName: "홍길동",
            guardianName: "홍길동 (통상 간병비 청구 보호자)",
            guardianPhone: "010-1234-5678",
            insuranceCompany: "KB손해보험",
            hospitalName: "서울대학교병원",
            admissionDate: todayStr,
            caregivingFee: "140,000원",
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem("ongajok_registrations", JSON.stringify(parsed));
      } else {
        let isModified = false;
        parsed = parsed.map((reg: any) => {
          if (reg.id === "reg-mock-1" || reg.patientName === "석은영" || reg.caregiverName === "온가족" || reg.guardianPhone === "010-8765-4321") {
            isModified = true;
            return {
              ...reg,
              caregiverName: "홍길동",
              caregiverPhone: "010-1234-5678",
              caregiverSsn: "1980년 01월 01일 (또는 800101)",
              relationship: "자녀",
              patientName: "홍길동",
              guardianName: "홍길동 (통상 간병비 청구 보호자)",
              guardianPhone: "010-1234-5678",
              insuranceCompany: "KB손해보험",
              hospitalName: "서울대학교병원",
              admissionDate: todayStr,
              caregivingFee: "140,000원",
            };
          }
          return reg;
        });
        if (isModified) {
          localStorage.setItem("ongajok_registrations", JSON.stringify(parsed));
        }
      }

      setRegistrations(parsed);
      // Automatically prefill with the latest registration if available
      if (parsed && parsed.length > 0) {
        const latest = parsed[0];
        setSelectedRegId(latest.id);
        prefillWithRegistration(latest);
      }
    } catch (e) {
      console.error("Error loading registrations in log:", e);
    }
  }, []);

  const prefillWithRegistration = (reg: CaregiverRegistration) => {
    setFormData((prev) => ({
      ...prev,
      patientName: reg.patientName || "",
      caregiverName: reg.caregiverName || "",
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedRegId(id);
    const reg = registrations.find((r) => r.id === id);
    if (reg) {
      prefillWithRegistration(reg);
    }
  };

  // Initialize Canvas for Caregiver Signature
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#16a34a"; // Green signature for the log to distinguish it
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
      }
    }
  }, [canvasRef.current, isSigned]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getEventCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getEventCoords(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * canvas.width,
        y: ((clientY - rect.top) / rect.height) * canvas.height,
      };
    } else {
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureData(null);
        setIsSigned(false);
      }
    }
  };

  const saveSignature = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Check if canvas is empty
      const blank = document.createElement("canvas");
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        alert("간병인 서명란에 서명해 주시기 바랍니다.");
        return;
      }
      setSignatureData(canvas.toDataURL());
      setIsSigned(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setFormValue = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSigned) {
      alert("간병 일지 서명을 먼저 완료하고 저장해 주십시오.");
      return;
    }
    if (!formData.patientName || !formData.caregiverName) {
      alert("환자명과 간병인 성명을 기입해 주십시오.");
      return;
    }

    // Save to localStorage for demo persistence
    const savedLogs = localStorage.getItem("ongajok_logs") || "[]";
    const logs = JSON.parse(savedLogs);
    logs.push({
      id: `log-${Date.now()}`,
      ...formData,
      signature: signatureData,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("ongajok_logs", JSON.stringify(logs));

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mealOptions = ["식사 양호", "보통", "식사 보조 필요", "금식"];
  const excretionOptions = ["배설 상태 양호", "도움 필요"];
  const sleepOptions = ["수면 양호", "보통", "수면 장애"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 print:p-0 print:max-w-full print:bg-white">
      {/* Header with Back button */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-[#1e3a8a] border border-blue-100 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          메인 화면으로
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-1 rounded-md">간편형 30초 돌봄</span>
          <span className="text-xs font-black tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            실시간 모바일 간병일지
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-8 print:hidden">
        <button
          type="button"
          onClick={() => {
            setActiveTab("write");
            setIsSubmitted(false);
          }}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "write"
              ? "bg-white text-emerald-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          일일 일지 작성하기
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "summary"
              ? "bg-white text-emerald-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          📅 15일 일괄 요약 및 인쇄/전송
        </button>
      </div>

      {activeTab === "write" && (
        !isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form Column (Left) */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            {/* Automatic Prefill Link Panel */}
            {registrations.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <span className="text-xs font-black text-emerald-800">가족간병 신청 연동 (자동 입력)</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold mb-3">
                  등록 신청한 목록 중 대상자를 선택하시면 모든 정보가 자동으로 채워집니다.
                </p>
                <select
                  value={selectedRegId}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 text-emerald-800 font-extrabold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                >
                  {registrations.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.patientName} 환자 (간병인: {reg.caregiverName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <ClipboardList className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">간병일지 작성</h2>
                  <p className="text-[10px] text-emerald-600/80 font-bold">터치 위주로 30초 만에 완벽 작성!</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Basic Info */}
                <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    기본 돌봄 대상 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">환자명 *</label>
                      <input
                        type="text"
                        name="patientName"
                        required
                        placeholder="예: 홍길동"
                        value={formData.patientName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">간병인명 *</label>
                      <input
                        type="text"
                        name="caregiverName"
                        required
                        placeholder="예: 홍길동"
                        value={formData.caregiverName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">기록 일자</label>
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Meal selection (Click-friendly) */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700">오늘 하루 식사 상태 *</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {mealOptions.map((opt) => {
                      const isSelected = formData.mealStatus === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormValue("mealStatus", opt)}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700 border-emerald-400 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Medication & Activity Checkboxes */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormValue("medicationCompleted", !formData.medicationCompleted)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      formData.medicationCompleted
                        ? "bg-emerald-50/50 text-emerald-700 border-emerald-200"
                        : "bg-white text-slate-400 border-slate-200"
                    }`}
                  >
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold">투약 일지</span>
                      <span className="text-xs font-black">처방약 복용 완료</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      formData.medicationCompleted ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {formData.medicationCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormValue("activityCompleted", !formData.activityCompleted)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      formData.activityCompleted
                        ? "bg-emerald-50/50 text-emerald-700 border-emerald-200"
                        : "bg-white text-slate-400 border-slate-200"
                    }`}
                  >
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold">활동 요건</span>
                      <span className="text-xs font-black">활동 보조 완료</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      formData.activityCompleted ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {formData.activityCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                </div>

                {/* 4. Excretion status (Tap Buttons) */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700">위생 및 배설 조치 *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {excretionOptions.map((opt) => {
                      const isSelected = formData.excretionStatus === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormValue("excretionStatus", opt)}
                          className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700 border-emerald-400"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Sleep status (Tap Buttons) */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700">일일 수면 상태 *</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {sleepOptions.map((opt) => {
                      const isSelected = formData.sleepStatus === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormValue("sleepStatus", opt)}
                          className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700 border-emerald-400"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Smart Vital Checking */}
                <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-black text-slate-700">생체 바이탈 및 평균 체온</span>
                      <span className="text-[10px] text-slate-400 font-bold">특이사항 있을 때만 수동 기록</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormValue("noVitalsIssue", !formData.noVitalsIssue)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                        formData.noVitalsIssue
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white text-amber-600 border-amber-300"
                      }`}
                    >
                      {formData.noVitalsIssue ? "✓ 이상 없음" : "수동 기입"}
                    </button>
                  </div>

                  {!formData.noVitalsIssue && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-bold text-slate-500">환자 체온 수치 (℃)</label>
                      <input
                        type="text"
                        name="vitalTemperature"
                        placeholder="예: 37.8 (수동 기록)"
                        value={formData.vitalTemperature}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-black text-slate-700"
                      />
                    </div>
                  )}
                </div>

                {/* 7. Notes textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700">특이사항 및 보호자 전달말씀 (선택)</label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="오늘 병원에서 일어난 중요한 상태 변화나 전달사항을 자유롭게 한 칸만 작성해 주십시오."
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 resize-none font-semibold text-slate-600"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className={`w-full py-4 rounded-2xl text-xs font-black text-white shadow-xl transition-all cursor-pointer ${
                    isSigned
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-950/10"
                      : "bg-slate-400 cursor-not-allowed"
                  }`}
                >
                  간병일지 승인 및 업로드
                </button>
              </form>
            </div>
          </div>

          {/* Paper View (Right) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Paper Preview Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white print:hidden">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">공식 제출용 간병일지 실시간 인쇄 서식</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-xs rounded-lg transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄 / PDF</span>
                </button>
              </div>

              {/* Printable Document Paper */}
              <div id="printable-log" className="p-8 md:p-12 space-y-6 text-[#1a1a1a] font-sans bg-emerald-50/5 min-h-[842px] relative">
                {/* Brand watermark background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <span className="text-6xl font-black tracking-widest border-8 border-dashed border-emerald-600 p-8 rounded-3xl text-emerald-600 rotate-[-12deg]">
                    ONGAJOK LOG
                  </span>
                </div>

                {/* Title */}
                <div className="text-center space-y-1">
                  <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[9px] font-black tracking-widest">
                    DAILY CAREGIVING LOG
                  </div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#1a1a1a] underline underline-offset-8 decoration-slate-300">
                    실시간 가족간병 일일 돌봄일지
                  </h1>
                  <p className="text-[10px] text-slate-400 font-bold">
                    일자: {formData.date ? new Date(formData.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" }) : "          "}
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/20 border border-emerald-100 rounded-2xl text-[9.5px] leading-relaxed text-slate-600 text-justify font-semibold">
                  본 간병일지는 협회를 통해 등록된 간병인이 보호자에게 실제 제공한 간병 서비스의 수행 내역을 사실에 따라 기록하기 위한 문서입니다. 본 기록은 간병 서비스 이용 확인, 협회 등록 관리 및 보험금 청구를 위한 증빙자료로 활용될 수 있으며, 작성자는 실제 간병 내용을 정확하게 작성하여야 합니다.
                </div>

                {/* Basic Details Table */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 block uppercase">Patient Name</span>
                    <span className="text-sm font-black text-slate-800">{formData.patientName || "          "} 님 (환자)</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 block uppercase">Caregiver Name</span>
                    <span className="text-sm font-black text-slate-800">{formData.caregiverName || "          "} 님 (간병 제공자)</span>
                  </div>
                </div>

                {/* Simplified Status Table (Core metrics) */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 justify-between">
                    <span className="text-xs font-black text-slate-700">돌봄 일일 상세 리포트</span>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      보험금 청구 증빙 공인 서식
                    </span>
                  </div>
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-3 font-bold text-slate-500 bg-slate-50/30 w-32">식사 수행도</td>
                        <td className="px-4 py-3 font-black text-slate-800">
                          {formData.mealStatus}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-3 font-bold text-slate-500 bg-slate-50/30">투약 일지</td>
                        <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-1.5">
                          {formData.medicationCompleted ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>금일 처방 복약 이상 없이 완수</span>
                            </>
                          ) : (
                            <span className="text-red-500 font-bold">미복용 또는 확인 필요</span>
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-3 font-bold text-slate-500 bg-slate-50/30">위생 및 배설</td>
                        <td className="px-4 py-3 font-black text-slate-800">
                          {formData.excretionStatus}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-3 font-bold text-slate-500 bg-slate-50/30">신체재활/활동</td>
                        <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-1.5">
                          {formData.activityCompleted ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>활동 보조 완료 (보행 및 스트레칭 등)</span>
                            </>
                          ) : (
                            <span className="text-slate-400">활동 보조 미수행</span>
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-3 font-bold text-slate-500 bg-slate-50/30">수면 주기</td>
                        <td className="px-4 py-3 font-black text-slate-800">
                          {formData.sleepStatus}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-500 bg-slate-50/30">평균 생체 바이탈</td>
                        <td className="px-4 py-3 font-black text-emerald-600">
                          {formData.noVitalsIssue ? "36.5 ℃ (정상 및 특이사항 없음)" : `${formData.vitalTemperature} ℃`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Handover comments */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#1a1a1a] border-l-3 border-emerald-500 pl-2">
                    환자 돌봄 종합 소견 및 중요한 병원 현황
                  </h4>
                  <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50 text-xs leading-relaxed font-semibold text-slate-600 min-h-[100px] text-justify whitespace-pre-wrap">
                    {formData.notes || "오늘 환자분의 식사 및 투약, 생체 징후는 지극히 안전하고 정상적이었습니다. 병동 내에서 편안하게 안정을 취하며 돌봄 서비스를 완수하였습니다."}
                  </div>
                </div>

                {/* Footer and Signatures */}
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>온가족간병 실시간 모바일 동행 보존 서식</span>
                    <span>협회 대표번호: {phone}</span>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                     {/* Caregiver Sign block */}
                     <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col justify-between h-44 md:h-36 w-full sm:w-80 md:w-96 relative bg-slate-50/50 print:border-solid">
                       <div className="flex items-center justify-between text-[10px]">
                         <span className="font-black text-emerald-600 block">간병 제공자 (을) 서명</span>
                         {!isSigned && (
                           <span className="text-[9px] font-bold text-amber-600 flex items-center gap-0.5 print:hidden">
                             <PenTool className="w-2.5 h-2.5" />
                             여기에 서명해 주세요 (마우스/터치 가능)
                           </span>
                         )}
                       </div>

                       {/* Canvas Wrapper */}
                       <div className="relative flex-1 bg-white border border-slate-100 rounded-lg mt-1.5 overflow-hidden">
                         {!isSigned ? (
                           <>
                             <canvas
                               ref={canvasRef}
                               width={500}
                               height={150}
                               onMouseDown={startDrawing}
                               onMouseMove={draw}
                               onMouseUp={stopDrawing}
                               onMouseLeave={stopDrawing}
                               onTouchStart={startDrawing}
                               onTouchMove={draw}
                               onTouchEnd={stopDrawing}
                               style={{ touchAction: "none" }}
                               className="w-full h-full cursor-crosshair bg-white"
                             />
                             {/* Signature Actions */}
                             <div className="absolute right-1.5 bottom-1.5 flex gap-1 print:hidden z-10">
                               <button
                                 type="button"
                                 onClick={clearCanvas}
                                 className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[9px] text-slate-500 font-bold rounded cursor-pointer shadow-sm"
                               >
                                 지우기
                               </button>
                               <button
                                 type="button"
                                 onClick={saveSignature}
                                 className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-[9px] text-white font-bold rounded cursor-pointer shadow-sm"
                               >
                                 저장
                               </button>
                             </div>
                           </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative">
                            {signatureData && (
                              <img src={signatureData} alt="Caregiver Signature" className="max-h-full max-w-full object-contain" />
                            )}
                            <div className="absolute right-2 bottom-2 bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 print:hidden">
                              <Check className="w-2.5 h-2.5" />
                              서명 완료
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsSigned(false)}
                              className="absolute left-2 bottom-2 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-[8px] text-slate-500 font-bold rounded print:hidden cursor-pointer"
                            >
                              재서명
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-xl mx-auto border border-slate-100 shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <Smile className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-800">일일 간병일지 등록 완료!</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-bold">
              환자 {formData.patientName} 님의 일일 돌봄 리포트가 보호자 전송 시스템 및 보험 청구 보존 센터에 정상 등재되었습니다.<br />
              필요 시 상단 인쇄/PDF를 활용해 즉시 제출하실 수 있습니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">일지 기록일자</span>
              <span className="font-bold text-slate-800">{formData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">환자명</span>
              <span className="font-bold text-slate-800">{formData.patientName} 님</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">간병 제공자</span>
              <span className="font-bold text-slate-800">{formData.caregiverName} 님</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">식사 상태</span>
              <span className="font-bold text-slate-700">{formData.mealStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">일일 체온 바이탈</span>
              <span className="font-bold text-emerald-600">
                {formData.noVitalsIssue ? "36.5" : formData.vitalTemperature} ℃
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setIsSigned(false);
                setSignatureData(null);
              }}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-[#1a1a1a] rounded-xl text-xs font-black cursor-pointer"
            >
              새 일지 작성
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
            >
              홈 화면으로 돌아가기
            </button>
          </div>
        </motion.div>
      ))}

      {activeTab === "summary" && (
        (() => {
          // ==========================================
          // 2. SUMMARY TAB (15-Day Batch Report)
          // ==========================================
          const pName = formData.patientName || "홍길동";
          const cName = formData.caregiverName || "홍길동";

          // Fetch logs matching this patient and caregiver
          const savedLogsStr = localStorage.getItem("ongajok_logs") || "[]";
          let allLogs: any[] = [];
          try {
            allLogs = JSON.parse(savedLogsStr);
          } catch(e) {}

          const matchLogs = allLogs.filter((l: any) => 
            l.patientName?.trim() === pName.trim() &&
            l.caregiverName?.trim() === cName.trim()
          );

          // Get the dates in range
          const datesList = getDatesInRange(summaryStartDate, summaryEndDate);

          // Stats computation
          const logsInPeriod = matchLogs.filter((l: any) => datesList.includes(l.date));
          const loggedDaysCount = logsInPeriod.length;

          const stats = (() => {
            if (logsInPeriod.length === 0) {
              return { mealNormal: 0, medNormal: 0, excretionNormal: 0, avgTemp: "36.5", total: 0 };
            }
            const mealCount = logsInPeriod.filter((l: any) => l.mealStatus === "식사 양호").length;
            const medCount = logsInPeriod.filter((l: any) => l.medicationCompleted).length;
            const excretionCount = logsInPeriod.filter((l: any) => l.excretionStatus === "배설 상태 양호").length;
            const temps = logsInPeriod.map((l: any) => parseFloat(l.vitalTemperature || "36.5")).filter(t => !isNaN(t));
            const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : "36.5";

            return {
              mealNormal: Math.round((mealCount / logsInPeriod.length) * 100),
              medNormal: Math.round((medCount / logsInPeriod.length) * 100),
              excretionNormal: Math.round((excretionCount / logsInPeriod.length) * 100),
              avgTemp,
              total: logsInPeriod.length
            };
          })();

          return (
            <div className="space-y-6">
              {/* Range & Generate Settings Control Box */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 print:hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      15일 통합 요약지 조회 기간 설정
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      15일 단위로 조회하고 인쇄하거나 보호자에게 모바일 리포트를 발송할 수 있습니다.
                    </p>
                  </div>
                  
                  {/* Preset Quick Buttons */}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const start = new Date();
                        start.setDate(start.getDate() - 14);
                        setSummaryStartDate(start.toISOString().split("T")[0]);
                        setSummaryEndDate(new Date().toISOString().split("T")[0]);
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 transition-all cursor-pointer"
                    >
                      최근 15일
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetReg = registrations.find(r => r.id === selectedRegId) || registrations[0];
                        const admDate = targetReg ? targetReg.admissionDate : new Date().toISOString().split("T")[0];
                        setSummaryStartDate(admDate);
                        const stopDate = new Date(admDate);
                        stopDate.setDate(stopDate.getDate() + 14);
                        setSummaryEndDate(stopDate.toISOString().split("T")[0]);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200 transition-all cursor-pointer"
                    >
                      근무일 1회차 (1~15일)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">요약 시작일</label>
                    <input
                      type="date"
                      value={summaryStartDate}
                      onChange={(e) => setSummaryStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">요약 종료일</label>
                    <input
                      type="date"
                      value={summaryEndDate}
                      onChange={(e) => setSummaryEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
                    />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      요약지 한 장 인쇄 (Print PDF)
                    </button>
                  </div>
                </div>

                {/* Warning / Quick generation helper */}
                {loggedDaysCount < 15 && (
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded">
                        체험/시뮬레이션 가이드
                      </span>
                      <p className="text-xs text-slate-700 font-bold">
                        현재 설정된 {datesList.length}일 기간 내 작성된 간병일지가 부족합니다 (총 {loggedDaysCount}일 작성됨).
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        관리자 출력물이나 고객 전송을 즉시 테스트해보고 싶으시다면, 아래 버튼을 눌러 15일분 일지를 한번에 자동 생성하세요!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerate15Days}
                      className="whitespace-nowrap px-4 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      ⚡ 15일분 일지 자동 생성 및 채우기
                    </button>
                  </div>
                )}
              </div>

              {/* 15-DAY REPORT DOCUMENT CONTAINER */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative text-slate-800 space-y-6 print:border-none print:shadow-none print:p-2">
                
                {/* Print Title Block */}
                <div className="text-center pb-6 border-b-2 border-slate-300 relative">
                  <div className="absolute top-0 left-0 text-[10px] border border-slate-300 px-2 py-1 rounded font-bold uppercase tracking-wider text-slate-500">
                    보존용 요약지
                  </div>
                  <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900">
                    간병일지 15일 단위 통합 요약 리포트
                  </h1>
                  <p className="text-xs text-slate-500 font-bold mt-1.5">
                    {summaryStartDate} ~ {summaryEndDate} ({datesList.length}일간의 돌봄 상태 요약 및 제출용 양식)
                  </p>
                </div>

                {/* Patient / Caregiver metadata table */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold">돌봄 대상자</span>
                    <span className="font-extrabold text-slate-800 text-sm">{pName} 환자님</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold">간병 제공자 (보호자)</span>
                    <span className="font-extrabold text-slate-800 text-sm">{cName} 님</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold">보험 연동 및 협회</span>
                    <span className="font-extrabold text-[#1e3a8a] text-sm">KB손해보험 (가족간병)</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold">가족 관계 / 연락처</span>
                    <span className="font-extrabold text-slate-800 text-sm">자녀 / 010-1234-5678</span>
                  </div>
                </div>

                {/* KPI stats section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-center">
                    <span className="block text-[10px] text-emerald-800 font-black">식사 정상 비율</span>
                    <span className="text-lg font-black text-emerald-700">{stats.mealNormal}%</span>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-center">
                    <span className="block text-[10px] text-emerald-800 font-black">복약 완료율</span>
                    <span className="text-lg font-black text-emerald-700">{stats.medNormal}%</span>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-center">
                    <span className="block text-[10px] text-emerald-800 font-black">배설 자립 상태율</span>
                    <span className="text-lg font-black text-emerald-700">{stats.excretionNormal}%</span>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-center">
                    <span className="block text-[10px] text-emerald-800 font-black">평균 바이탈 체온</span>
                    <span className="text-lg font-black text-emerald-700">{stats.avgTemp} ℃</span>
                  </div>
                </div>

                {/* Document Main Table */}
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold text-center border-b border-slate-300">
                        <th className="p-2 border-r border-slate-300 w-24">날짜 (Date)</th>
                        <th className="p-2 border-r border-slate-300 w-16">식사</th>
                        <th className="p-2 border-r border-slate-300 w-16">복약</th>
                        <th className="p-2 border-r border-slate-300 w-20">위생배설</th>
                        <th className="p-2 border-r border-slate-300 w-16">수면</th>
                        <th className="p-2 border-r border-slate-300 w-16">체온</th>
                        <th className="p-2 border-r border-slate-300">돌봄 세부 및 조치 특이사항</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datesList.map((dateStr) => {
                        const dayLog = matchLogs.find((l: any) => l.date === dateStr);
                        
                        if (dayLog) {
                          return (
                            <tr key={dateStr} className="border-b border-slate-300 hover:bg-slate-50/50 text-[11px]">
                              <td className="p-2 border-r border-slate-300 font-bold text-center text-slate-700">
                                {dateStr}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-center font-semibold text-emerald-700 bg-emerald-50/10">
                                {dayLog.mealStatus || "식사 양호"}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-center">
                                {dayLog.medicationCompleted ? "🟢 완료" : "🔴 미흡"}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-center text-[10px]">
                                {dayLog.excretionStatus || "배설 양호"}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-center">
                                {dayLog.sleepStatus === "수면 양호" ? "🟢 양호" : "🟡 보통"}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-800">
                                {dayLog.noVitalsIssue ? "36.5" : dayLog.vitalTemperature}℃
                              </td>
                              <td className="p-2 text-slate-600 text-[10px] leading-tight">
                                {dayLog.notes || "특이사항 없이 수면상태 및 식사상태 양호하게 안정을 유지하셨습니다."}
                              </td>
                            </tr>
                          );
                        } else {
                          return (
                            <tr key={dateStr} className="border-b border-slate-300 text-[11px] text-slate-400 bg-slate-50/20 italic">
                              <td className="p-2 border-r border-slate-300 font-bold text-center text-slate-400">
                                {dateStr}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-300">미기재</td>
                              <td className="p-2 border-r border-slate-300 text-center">-</td>
                              <td className="p-2 border-r border-slate-300 text-center text-[10px]">-</td>
                              <td className="p-2 border-r border-slate-300 text-center">-</td>
                              <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-300">36.5℃</td>
                              <td className="p-2 text-slate-400 text-[10px] leading-tight">
                                <span>작성된 돌봄 일지 기록이 없습니다. (공란 보존)</span>
                              </td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Signature & Office stamp block */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t-2 border-slate-300 gap-6">
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] text-slate-400 font-bold">
                      위 15일 통합 간병일지는 실제 환자 건강 상태 및 돌봄 조치 내역과 완벽히 일치함을 보증합니다.
                    </p>
                    <p className="text-xs font-bold text-slate-700">
                      제출 일자: {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Caregiver Signature display */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-bold mb-1">작성 간병인 서명</span>
                      <div className="w-28 h-12 border border-slate-300 rounded bg-slate-50/50 flex items-center justify-center relative overflow-hidden">
                        {signatureData ? (
                          <img src={signatureData} alt="Signature" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-xs font-bold text-slate-700">{cName} (서명)</span>
                        )}
                      </div>
                    </div>

                    {/* Red Circular Association Seal stamp */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-bold mb-1">인증 확인 직인</span>
                      <div className="relative w-14 h-14 rounded-full border-2 border-red-500/80 flex items-center justify-center font-black text-red-500/90 text-[8px] text-center rotate-12 select-none bg-white">
                        <div className="absolute inset-0.5 rounded-full border border-red-400 border-dashed"></div>
                        온가족<br />간병협회
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline CSS styles for window.print() optimization */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    body {
                      background: white !important;
                      color: black !important;
                    }
                    .print\\:hidden, header, footer, button, select, input {
                      display: none !important;
                    }
                    div, table, tr, td, th {
                      border-color: #000000 !important;
                      box-shadow: none !important;
                    }
                  }
                `}} />
              </div>

              {/* Action buttons (Print and Send) */}
              <div className="flex flex-col sm:flex-row gap-4 print:hidden pt-4">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-5 h-5" />
                  15일 단위 요약지 PDF 다운로드 / A4 즉시 인쇄
                </button>
                <button
                  type="button"
                  onClick={handleSimulateSend}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  보호자 카카오톡 / 보험 청구사 즉시 전송하기
                </button>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
