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

      {!isSubmitted ? (
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
      )}
    </div>
  );
}
