import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, ArrowLeft, Printer, CheckCircle2, User, Phone, MapPin, DollarSign, PenTool, Check, AlertTriangle, Sparkles, MessageCircle, X } from "lucide-react";
import { CaregiverRegistration } from "../types";

interface CaregiverContractProps {
  onBack: () => void;
  phone: string;
}

export default function CaregiverContract({ onBack, phone }: CaregiverContractProps) {
  const [registrations, setRegistrations] = useState<CaregiverRegistration[]>([]);
  const [selectedRegId, setSelectedRegId] = useState<string>("");

  const [contractNotification, setContractNotification] = useState<{
    isOpen: boolean;
    clientName: string;
    clientPhone: string;
    caregiverName: string;
    caregiverPhone: string;
    patientName: string;
    receivedAt: string;
    isSending: boolean;
    mode: "simulated" | "live" | "error_config" | "live_failed";
    statusMessage?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    patientName: "",
    patientBirth: "",
    caregiverName: "",
    caregiverPhone: "",
    caregiverBirth: "",
    servicePeriodStart: "",
    location: "",
    caregivingFeeDay: "140,000",
    caregivingFeeHour: "15,000",
    referralFee: "4,000",
    specialTerms: "본 계약은 환자의 조속한 쾌유와 신뢰성 있는 간병 서비스를 제공하기 위해 체결되며, 양 당사자는 성실히 계약 사항을 준수할 것을 서약합니다.",
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
            caregiverName: "온가족",
            caregiverPhone: "010-0000-0000",
            caregiverSsn: "751015-2******",
            relationship: "자녀",
            patientName: "석은영",
            guardianName: "온가족",
            guardianPhone: "010-0000-0000",
            insuranceCompany: "KB손해보험",
            hospitalName: "서울대병원",
            admissionDate: "2026-07-15",
            caregivingFee: "140,000원",
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem("ongajok_registrations", JSON.stringify(parsed));
      } else {
        let isModified = false;
        parsed = parsed.map((reg: any) => {
          let updated = { ...reg };
          if (updated.caregiverName === "석은영") {
            updated.caregiverName = "온가족";
            isModified = true;
          }
          if (updated.caregiverPhone === "010-8967-7839" || updated.caregiverPhone === "") {
            updated.caregiverPhone = "010-0000-0000";
            isModified = true;
          }
          if (updated.patientName === "홍길동") {
            updated.patientName = "석은영";
            isModified = true;
          }
          if (updated.guardianName === "홍길동") {
            updated.guardianName = "온가족";
            isModified = true;
          }
          if (updated.guardianPhone === "010-8967-7839" || updated.guardianPhone === "" || updated.guardianPhone === "010-0000-0000") {
            updated.guardianPhone = "010-0000-0000";
            isModified = true;
          }
          return updated;
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
      console.error("Error loading registrations in contract:", e);
    }
  }, []);

  const prefillWithRegistration = (reg: CaregiverRegistration) => {
    setFormData((prev) => ({
      ...prev,
      clientName: reg.guardianName || "",
      clientPhone: reg.guardianPhone || "",
      patientName: reg.patientName || "",
      patientBirth: "", // Can be filled by user or fallback
      caregiverName: reg.caregiverName || "",
      caregiverPhone: reg.caregiverPhone || "",
      caregiverBirth: reg.caregiverSsn || "",
      servicePeriodStart: reg.admissionDate || "",
      location: reg.hospitalName || "",
      caregivingFeeDay: Number(reg.caregivingFee.replace(/[^0-9]/g, "")).toLocaleString("ko-KR") || "140,000",
      specialTerms: `본 계약은 환자의 조속한 쾌유와 신뢰성 있는 간병 서비스를 제공하기 위해 체결되며, 양 당사자는 성실히 계약 사항을 준수할 것을 서약합니다.`,
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

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1e3a8a"; // Navy color for signature
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
      }
    }
  }, [canvasRef.current]);

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
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
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
      // Check if canvas is empty before saving
      const blank = document.createElement("canvas");
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        alert("서명란에 서명해 주시기 바랍니다.");
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

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSigned) {
      alert("계약서 서명을 먼저 완료하고 저장해 주십시오.");
      return;
    }
    if (!formData.clientName || !formData.clientPhone || !formData.caregiverName || !formData.caregiverPhone) {
      alert("구인자(보호자) 및 간병인의 필수 인적사항을 입력해 주십시오.");
      return;
    }

    const dataToSubmit = { ...formData };

    // Save to localStorage for demo persistence
    const savedContracts = localStorage.getItem("ongajok_contracts") || "[]";
    const contracts = JSON.parse(savedContracts);
    contracts.push({
      id: `contract-${Date.now()}`,
      ...formData,
      signature: signatureData,
      date: new Date().toLocaleDateString(),
    });
    localStorage.setItem("ongajok_contracts", JSON.stringify(contracts));

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const now = new Date();
    const formattedReceivedAt = now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    setContractNotification({
      isOpen: true,
      clientName: dataToSubmit.clientName,
      clientPhone: dataToSubmit.clientPhone,
      caregiverName: dataToSubmit.caregiverName,
      caregiverPhone: dataToSubmit.caregiverPhone,
      patientName: dataToSubmit.patientName,
      isSending: true,
      receivedAt: formattedReceivedAt,
      mode: "simulated"
    });

    // Trigger server-side Aligo SMS API proxy
    fetch("/api/send-contract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSubmit),
    })
      .then((res) => res.json())
      .then((data) => {
        setContractNotification((prev) =>
          prev
            ? {
                ...prev,
                isSending: false,
                mode: data.success 
                  ? (data.mode || "live") 
                  : (data.mode === "live" ? "live_failed" : (data.mode || "error_config")),
                statusMessage: data.message,
              }
            : null
        );
      })
      .catch((err) => {
        console.error("Aligo SMS send error:", err);
        setContractNotification((prev) =>
          prev
            ? {
                ...prev,
                isSending: false,
                mode: "error_config",
                statusMessage: "서버와의 연동 통신 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
              }
            : null
        );
      });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Back button */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-[#1e3a8a] border border-blue-100 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          메인 화면으로
        </button>

        <span className="text-xs font-black tracking-widest text-[#1e3a8a] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
          온가족간병협회 중개 계약 관리
        </span>
      </div>

      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form Column */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            {/* Automatic Prefill Link Panel */}
            {registrations.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-bounce" />
                  <span className="text-xs font-black text-[#1e3a8a]">가족간병 신청 연동 (자동 입력)</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold mb-3">
                  등록 신청한 목록 중 대상자를 선택하시면 모든 정보가 자동으로 채워집니다.
                </p>
                <select
                  value={selectedRegId}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 text-xs bg-white border border-blue-200 text-[#1e3a8a] font-extrabold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
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
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-50 text-[#1e3a8a] rounded-2xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">계약서 정보 입력</h2>
                  <p className="text-[10px] text-slate-400 font-semibold">아래의 필수 정보를 정밀하게 기입해 주십시오.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Section: Client */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-[#1e3a8a] border-l-3 border-[#1e3a8a] pl-2">
                    구인자 (보호자) 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">성명 *</label>
                      <input
                        type="text"
                        name="clientName"
                        required
                        placeholder="(예: 온가족)"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">연락처 *</label>
                      <input
                        type="text"
                        name="clientPhone"
                        required
                        placeholder="(예: 010-0000-0000)"
                        value={formData.clientPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">환자명 *</label>
                      <input
                        type="text"
                        name="patientName"
                        required
                        placeholder="(예: 석은영)"
                        value={formData.patientName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">환자 생년월일 *</label>
                      <input
                        type="text"
                        name="patientBirth"
                        required
                        placeholder="(예: 1950.05.15)"
                        value={formData.patientBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Caregiver */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-[#1e3a8a] border-l-3 border-[#1e3a8a] pl-2">
                    간병인 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">성명 *</label>
                      <input
                        type="text"
                        name="caregiverName"
                        required
                        placeholder="(예: 온가족)"
                        value={formData.caregiverName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">생년월일 *</label>
                      <input
                        type="text"
                        name="caregiverBirth"
                        required
                        placeholder="(예: 1970.08.20)"
                        value={formData.caregiverBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">연락처 *</label>
                    <input
                      type="text"
                      name="caregiverPhone"
                      required
                      placeholder="(예: 010-0000-0000)"
                      value={formData.caregiverPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                {/* Section: Terms & Fee */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-[#1e3a8a] border-l-3 border-[#1e3a8a] pl-2">
                    계약 조건 및 수수료
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">8시간이상(일급, 원) *</label>
                      <input
                        type="text"
                        name="caregivingFeeDay"
                        required
                        value={formData.caregivingFeeDay}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">8시간미만(시급, 원) *</label>
                      <input
                        type="text"
                        name="caregivingFeeHour"
                        required
                        value={formData.caregivingFeeHour}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">알선 중개수수료 (1일 기준, 원) *</label>
                      <input
                        type="text"
                        name="referralFee"
                        required
                        value={formData.referralFee}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-bold text-[#b45309]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">근무 시작일 *</label>
                      <input
                        type="date"
                        name="servicePeriodStart"
                        required
                        value={formData.servicePeriodStart}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">근무장소(병원명) *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="(예: 서울대학교병원 본관 603호)"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100/60 text-[10px] text-slate-600 leading-relaxed space-y-2 font-semibold shadow-inner">
                    <div>
                      ℹ️ <strong>지불방법 안내:</strong> 최종 간병 업무가 성실히 종료된 후 "을"(간병인)의 개인 지정 계좌로 안전하게 직접 계좌이체합니다.
                      <span className="text-red-600 font-extrabold block mt-0.5">※ 주의: 원활한 입금 확인을 위해 이체 시 반드시 환자 성명과 '간병비' 단어(예: 환자명간병비)를 결합하여 기재해 주세요!</span>
                    </div>
                    <div className="pt-2 border-t border-blue-200/50">
                      💳 <strong>협회 중개 수수료 수납 계좌:</strong><br />
                      <span className="text-[#1e3a8a] font-extrabold text-xs font-mono">국민은행 838901-04-167095</span><br />
                      (예금주: 석은영 온가족간병협회)
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">특약 사항</label>
                    <textarea
                      name="specialTerms"
                      rows={3}
                      value={formData.specialTerms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-2xl text-xs font-black text-white shadow-lg transition-all cursor-pointer ${
                    isSigned
                      ? "bg-[#1e3a8a] hover:bg-[#1e40af] shadow-blue-900/10"
                      : "bg-slate-400 cursor-not-allowed"
                  }`}
                >
                  중개 계약 체결 및 등록 완료
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Document Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Paper Preview Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white print:hidden">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-slate-300">실시간 계약서 인쇄 및 서명 미리보기</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-xs rounded-lg transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄 / PDF</span>
                </button>
              </div>

              {/* The Contract Paper Content */}
              <div id="printable-contract" className="p-8 md:p-12 space-y-6 text-[#1a1a1a] font-sans bg-amber-50/10 min-h-[842px] relative">
                {/* Watermark in background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <span className="text-6xl font-black tracking-widest border-8 border-dashed border-[#1e3a8a] p-8 rounded-3xl text-[#1e3a8a] rotate-12">
                    온가족간병
                  </span>
                </div>

                {/* Title */}
                <div className="text-center space-y-1">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#1e3a8a] underline underline-offset-8 decoration-double decoration-slate-400">
                    간병인 알선 및 중개 계약서
                  </h1>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Caregiver Referral and Mediation Standard Agreement
                  </p>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-700 text-justify">
                  본 계약은 구인자 <span className="font-bold underline text-slate-900">{formData.clientName || "          "}</span>(이하 "구인자")와 간병 공급인 <span className="font-bold underline text-slate-900">{formData.caregiverName || "          "}</span>(이하 "구직자") 간에 아래와 같이 신뢰에 기반하여 간병 알선 및 중개 공급 계약을 체결하고, 신의성실 원칙에 의거하여 각 조항을 준수할 것을 합의한다.
                </p>

                {/* Section 1: Parties Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#1e3a8a]">당사자의 인적사항 및 근무 대상</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <table className="w-full text-[10px] border border-slate-200 border-collapse">
                      <tbody>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-2 py-1.5 text-left font-bold text-slate-600 border-r border-slate-200 w-24">구인자 (보호자)</th>
                          <td className="px-2 py-1.5">{formData.clientName || "          "}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <th className="px-2 py-1.5 text-left font-bold text-slate-600 border-r border-slate-200">연락처</th>
                          <td className="px-2 py-1.5">{formData.clientPhone || "          "}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <th className="px-2 py-1.5 text-left font-bold text-slate-600 border-r border-slate-200">피간병인 (환자)</th>
                          <td className="px-2 py-1.5 font-bold text-[#1e3a8a]">{formData.patientName || "          "} 님</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <th className="px-2 py-1.5 text-left font-bold text-slate-600 border-r border-slate-200">환자 생년월일</th>
                          <td className="px-2 py-1.5 text-xs text-slate-500">{formData.patientBirth || "          "}</td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="w-full text-[10px] border border-slate-200 border-collapse">
                      <tbody>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-2 py-1.5 text-left font-bold text-slate-600 border-r border-slate-200 w-24">구직자 (간병인)</th>
                          <td className="px-2 py-1.5">{formData.caregiverName || "          "}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <th className="px-2 py-1.5 text-left font-bold text-slate-600 border-r border-slate-200">간병인 생년월일</th>
                          <td className="px-2 py-1.5 text-xs text-slate-500">{formData.caregiverBirth || "          "}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <th className="px-2 py-1.5 text-left font-bold text-slate-600 border-r border-slate-200">연락처</th>
                          <td className="px-2 py-1.5">{formData.caregiverPhone || "          "}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <th className="px-2 py-1.5 text-left font-bold text-slate-600 border-r border-slate-200">근무장소(병원명)</th>
                          <td className="px-2 py-1.5 text-xs text-slate-500">{formData.location || "          "}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <th className="px-2 py-1.5 text-left font-bold text-slate-600 border-r border-slate-200">간병 시작일</th>
                          <td className="px-2 py-1.5 font-bold text-slate-800">
                            {formData.servicePeriodStart || "          "}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 2: Financial Conditions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#1e3a8a]">수수료 및 정산 가이드</h4>
                  
                  {/* Desktop & Print View: Perfect, balanced column proportions */}
                  <div className="hidden sm:block print:block overflow-x-auto">
                    <table className="w-full text-[10px] border border-slate-200 border-collapse table-fixed">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <th className="px-3 py-1.5 text-left font-bold border-r border-slate-200 w-[120px]">구분</th>
                          <th className="px-3 py-1.5 text-right font-bold w-[110px]">책정 금액 (원)</th>
                          <th className="px-4 py-1.5 text-left font-bold border-l border-slate-200">지급 및 정산 정책</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <th className="px-3 py-2 text-left font-bold text-slate-800 border-r border-slate-200 bg-slate-50/20">8시간 이상(일급)</th>
                          <td className="px-3 py-2 text-right font-black text-slate-900">{formData.caregivingFeeDay} 원</td>
                          <td className="px-4 py-2 text-[9px] text-slate-500 border-l border-slate-200 leading-relaxed" rowSpan={2}>
                            - "구인자"는 최종 간병 업무가 성실히 종료된 후 "구직자"의 지정 계좌로 직접 계좌이체하여 정산 완료한다.
                            <span className="text-[#e11d48] font-bold block mt-1">(※ 주의: 이체 시 반드시 환자 성명과 '간병비' 단어(예: 환자명간병비)를 기재해 주십시오.)</span>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <th className="px-3 py-2 text-left font-bold text-slate-800 border-r border-slate-200 bg-slate-50/20">8시간 미만(시급)</th>
                          <td className="px-3 py-2 text-right font-black text-slate-900">{formData.caregivingFeeHour} 원</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <th className="px-3 py-2 text-left font-bold text-[#b45309] border-r border-slate-200 bg-amber-50/10">협회 중개 수수료</th>
                          <td className="px-3 py-2 text-right font-black text-[#b45309] bg-amber-50/10">{formData.referralFee} 원</td>
                          <td className="px-4 py-2 text-[9px] text-[#b45309]/80 border-l border-slate-200 leading-relaxed">
                            - 협회 중개 수수료는 1일 기준 4,000원으로 부과된다. [수수료 입금계좌: 국민은행 838901-04-167095 (예금주: 석은영 온가족간병협회)]
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View: Beautiful, readable stacked block cards */}
                  <div className="block sm:hidden print:hidden space-y-2">
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px] bg-white divide-y divide-slate-150">
                      {/* 8시간 이상 (일급) */}
                      <div className="p-3 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">8시간 이상 (일급)</span>
                          <span className="font-black text-slate-900 text-xs">{formData.caregivingFeeDay} 원</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2 text-[10px] text-slate-600 leading-relaxed">
                          <p className="font-bold text-slate-700 mb-0.5">• 지급 및 정산 정책:</p>
                          <p>"구인자"는 최종 간병 업무가 성실히 종료된 후 "구직자"의 지정 계좌로 이체합니다.</p>
                          <p className="text-[#e11d48] font-bold mt-0.5">(※ 주의: 이체 시 반드시 환자 성명과 '간병비' 단어(예: 환자명간병비)를 기재해 주십시오.)</p>
                        </div>
                      </div>

                      {/* 8시간 미만 (시급) */}
                      <div className="p-3 flex justify-between items-center">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">8시간 미만 (시급)</span>
                        <span className="font-black text-slate-900 text-xs">{formData.caregivingFeeHour} 원</span>
                      </div>

                      {/* 협회 중개 수수료 */}
                      <div className="p-3 space-y-1.5 bg-amber-50/10">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#b45309] bg-amber-50 px-2 py-0.5 rounded-md text-[10px]">협회 중개 수수료</span>
                          <span className="font-black text-[#b45309] text-xs">{formData.referralFee} 원</span>
                        </div>
                        <div className="bg-amber-50/30 rounded-lg p-2 text-[10px] text-[#b45309]/95 leading-relaxed">
                          <p className="font-bold text-slate-700 mb-0.5">• 수수료 납부 정책:</p>
                          <p>협회 중개 수수료는 1일 기준 4,000원으로 부과됩니다.</p>
                          <p className="font-extrabold text-slate-800 mt-0.5">[국민은행 838901-04-167095 (예금주: 석은영 온가족간병협회)]</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Standard terms */}
                <div className="space-y-2.5 text-[9px] text-slate-500 leading-relaxed text-justify">
                  <h4 className="text-xs font-black text-[#1e3a8a] text-slate-800 border-l-2 border-[#1e3a8a] pl-1.5">간병인 알선 및 중개 계약서 약정 조항</h4>
                  
                  <p>
                    <strong>제1조 (목적 및 성격)</strong><br />
                    “중개업체”는 유료직업소개소(제2026-3100300-14-5-00009호)로서, 구인자와 구직자 간의 간병 서비스 알선 및 소개 업무를 수행한다. 본 계약은 「근로기준법」 제11조 및 관련 법령에 따라 가사사용인(간병인)의 업무적 특성을 고려하며, “중개업체”는 간병 서비스 계약의 당사자가 아닌 알선중개자로서의 지위만을 가진다.
                  </p>
                  
                  <p>
                    <strong>제2조 (업무의 범위 및 책임)</strong><br />
                    “구직자”는 “구인자”와 사전에 협의된 업무 범위 내에서 간병 서비스를 성실히 제공할 의무가 있다. “중개업체”는 구인·구직자 간의 알선 업무를 수행할 뿐이며, 서비스 이용 중 발생하는 분쟁, 사고, 서비스 품질 문제 등에 대하여 직접적인 법적 책임을 지지 않는다. 계약 내용(기간, 장소, 금액 등)에 변경이 발생할 경우, “구인자”와 “구직자”는 즉시 “중개업체”에 이를 통보하여야 한다.
                  </p>
                  
                  <p>
                    <strong>제3조 (간병비 정산 및 수수료)</strong><br />
                    간병 서비스에 대한 대가(간병비)는 “구인자”가 “구직자”에게 직접 지급하는 것을 원칙으로 한다. “중개업체”는 “구인자”로부터 직업소개에 따른 알선 수수료만을 수취하며, 간병비 전액은 구인자와 구직자 간의 직접 정산을 원칙으로 한다.
                  </p>
                  
                  <p>
                    <strong>제4조 (개인정보 수집 및 활용)</strong><br />
                    “중개업체”는 계약 체결 및 알선 서비스 제공을 위해 성명, 연락처, 생년월일, 병원명, 간병 관련 정보 등 필수 개인정보를 수집 및 이용한다. “구인자”와 “구직자”는 상호 간의 원활한 서비스 제공과 계약 이행을 위해 필요한 범위 내에서 자신의 개인정보가 상대방에게 제공되는 것에 동의한다.
                  </p>
                  
                  <p>
                    <strong>제5조 (가사사용인에 관한 사항)</strong><br />
                    본 서비스의 제공자는 근로기준법상 가사사용인으로서, 당사자 간의 구체적인 업무 내용과 근무 조건은 별도의 서면 합의서(간병 서비스 약정서)에 따른다. 중개 수수료 및 서비스 비용 정산은 「직업안정법」 및 관련 세무 법령을 준수한다.
                  </p>

                  <p className="font-bold text-[#1e3a8a] text-[9.5px] py-1">
                    본인은 위 내용을 충분히 숙지하였으며, 온가족간병협회의 중개 알선 서비스 이용에 동의합니다.
                  </p>

                  {formData.specialTerms && (
                    <p className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <strong>제6조 (특약 사항)</strong> {formData.specialTerms}
                    </p>
                  )}
                </div>

                {/* Sign and Seal Footer */}
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>계약 체결일: {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {/* Association Stamp */}
                    <div className="border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-28 relative overflow-hidden bg-slate-50/50">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-[#1e3a8a] block">대리 중개기관</span>
                        <span className="text-xs font-black text-slate-800 block">온가족간병협회</span>
                        <span className="text-[9px] text-slate-500 block leading-none">유료직업소개소 등록번호:</span>
                        <span className="text-[9px] font-semibold text-[#1e3a8a] block leading-none">제2026-3100300-14-5-00009호</span>
                        <span className="text-[9px] text-slate-400 block mt-1">고객센터: {phone}</span>
                      </div>
                      
                      {/* Real official stamp image */}
                      <img 
                        src="https://i.postimg.cc/fRmr17nH/ongajogganbyeonghyeobhoeuiin.png" 
                        alt="온가족간병협회 직인" 
                        className="absolute right-2 bottom-1 w-16 h-16 object-contain pointer-events-none select-none rotate-[-6deg]"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Interactive Electronic Signature pad */}
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col justify-between h-28 relative bg-slate-50/50 print:border-solid">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-black text-[#1e3a8a] block">구인자 서명 또는 날인</span>
                        {!isSigned && (
                          <span className="text-[9px] font-bold text-amber-600 flex items-center gap-0.5 print:hidden">
                            <PenTool className="w-2.5 h-2.5" />
                            서명 필요
                          </span>
                        )}
                      </div>

                      {/* Canvas Wrapper */}
                      <div className="relative flex-1 bg-white border border-slate-100 rounded-lg mt-1.5 overflow-hidden">
                        {!isSigned ? (
                          <>
                            <canvas
                              ref={canvasRef}
                              width={250}
                              height={55}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="w-full h-full cursor-crosshair"
                            />
                            {/* Signature Actions */}
                            <div className="absolute right-1 bottom-1 flex gap-1 print:hidden z-10">
                              <button
                                type="button"
                                onClick={clearCanvas}
                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-[8px] text-slate-500 font-bold rounded"
                              >
                                지우기
                              </button>
                              <button
                                type="button"
                                onClick={saveSignature}
                                className="px-1.5 py-0.5 bg-[#1e3a8a] hover:bg-blue-800 text-[8px] text-white font-bold rounded"
                              >
                                저장
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative">
                            {signatureData && (
                              <img src={signatureData} alt="Client Signature" className="max-h-full max-w-full object-contain" />
                            )}
                            <div className="absolute right-2 bottom-2 bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 print:hidden">
                              <Check className="w-2.5 h-2.5" />
                              등록됨
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsSigned(false)}
                              className="absolute left-2 bottom-2 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-[8px] text-slate-500 font-bold rounded print:hidden"
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
          <div className="w-16 h-16 bg-emerald-50 text-[#1e3a8a] rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8 text-[#1e3a8a]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-800">간병인 중개 계약 체결 완료!</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-bold">
              입력하신 계약 서류 정보가 온가족간병협회 관리 시스템에 정상 등재되었습니다.<br />
              필요시 인쇄 / PDF 다운로드 기능을 통해 증빙 서류로 보존 가능합니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">구인자(보호자)</span>
              <span className="font-bold text-slate-800">{formData.clientName} 님</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">간병 공급원</span>
              <span className="font-bold text-slate-800">{formData.caregiverName} 님</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">환자명</span>
              <span className="font-bold text-slate-800">{formData.patientName} 님</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">일일 간병비</span>
              <span className="font-bold text-[#1e3a8a]">{formData.caregivingFee} 원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">근무 장소</span>
              <span className="font-bold text-slate-600">{formData.location}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setIsSigned(false);
                setSignatureData(null);
              }}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-[#1a1a1a] rounded-xl text-xs font-black cursor-pointer"
            >
              새 계약 작성
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-blue-900/10"
            >
              홈 화면으로 돌아가기
            </button>
          </div>
        </motion.div>
      )}

      {/* Alimtalk / SMS Notification Modal */}
      {contractNotification && contractNotification.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[24px] max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#372a24] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FFEB3B] flex items-center justify-center text-[#372a24]">
                  <MessageCircle className="w-4 h-4 fill-[#372a24]" />
                </div>
                <span className="text-xs font-black tracking-wide">알림톡 도착</span>
              </div>
              <button
                onClick={() => setContractNotification(null)}
                className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="bg-white p-5 space-y-4 text-[#1a1a1a]">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <img 
                  src="https://i.postimg.cc/Tw4SQMtk/ongajoklogo.png" 
                  alt="온가족간병협회 로고" 
                  className="w-9 h-9 object-contain rounded-full border border-slate-200 bg-white"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-black text-slate-800">온가족간병협회</h4>
                  <p className="text-[9px] text-slate-400 font-bold">공식 알림 채널</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-[#F2F2F2] rounded-2xl p-3.5 border border-slate-200 text-[11px] leading-relaxed text-slate-800 font-semibold space-y-1 shadow-inner">
                  <p className="text-[#372a24] font-black text-xs mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-[#1e3a8a]" />
                    [간병 중개 계약 체결 완료 안내]
                  </p>
                  <p>안녕하세요, 온가족간병협회입니다.</p>
                  <p className="text-[#1e3a8a] font-extrabold mt-1">
                    구인자님과 간병인님 간의 간병인 알선 및 중개 계약이 성공적으로 완료 및 등록되었습니다.
                  </p>
                  <div className="pt-2 mt-2 border-t border-slate-200 space-y-1 text-[10px] text-slate-600 font-bold">
                    <p>• 구인자(보호자): {contractNotification.clientName} 님</p>
                    <p>• 구직자(간병인): {contractNotification.caregiverName} 님</p>
                    <p>• 환자명: {contractNotification.patientName} 님</p>
                    <p className="text-blue-700 font-black">• 시스템 자동 전송일시: {contractNotification.receivedAt}</p>
                    <p>• 상태: 서명 완료 및 협회 시스템 즉시 등재</p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-snug font-bold">
                  * 위 수신 고지는 간병인 연락처({contractNotification.caregiverPhone}), 보호자 연락처({contractNotification.clientPhone}), 그리고 협회 고객센터(010-9520-7839)로 실시간 동시 전송되었습니다.
                </p>

                {contractNotification.isSending ? (
                  <div className="flex items-center gap-2 justify-center py-2 text-[10px] text-indigo-600 font-extrabold bg-indigo-50/50 rounded-xl border border-dashed border-indigo-200 animate-pulse">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    실시간 알리고 알림톡 및 문자 전송 처리 중...
                  </div>
                ) : (
                  <div className={`text-[10px] p-2.5 rounded-xl border font-bold flex flex-col gap-1 ${
                    contractNotification.mode === "simulated"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : (contractNotification.mode === "error_config" || contractNotification.mode === "live_failed")
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}>
                    <p className="flex items-center gap-1 text-xs font-black">
                      {(contractNotification.mode === "error_config" || contractNotification.mode === "live_failed") ? (
                        <X className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      {contractNotification.mode === "simulated"
                        ? "알리고 발송 완료 (시뮬레이션)"
                        : contractNotification.mode === "error_config"
                        ? "알리고 API 설정 필요 (실시간 전송)"
                        : contractNotification.mode === "live_failed"
                        ? "알림 문자 실제 전송 실패 (IP 또는 설정 오류)"
                        : "실시간 실제 발송 완료"}
                    </p>
                    <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                      {contractNotification.statusMessage || (contractNotification.mode === "simulated"
                        ? "API 키 미설정으로 가상 전송을 완료했습니다. 검수 완료 후 .env 설정 시 실제 발송됩니다."
                        : "중개 계약 완료 알림이 관련 계약 당사자 및 협회 고객센터(010-9520-7839)로 실시간 전송되었습니다.")}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm button */}
              <button
                onClick={() => setContractNotification(null)}
                className="w-full py-3 bg-[#372a24] hover:bg-[#251c18] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
