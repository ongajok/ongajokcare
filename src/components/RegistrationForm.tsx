import { useState, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, CheckCircle2, Send, MessageCircle, AlertCircle, X, Check, Lock, ArrowLeft } from "lucide-react";
import { CaregiverRegistration, WebsiteConfig } from "../types";
import { KOREAN_INSURANCE_COMPANIES } from "../data";
import MascotOni from "./MascotOni";
import { sendRegistrationAlimtalk } from "../lib/aligoClient";

interface RegistrationFormProps {
  config: WebsiteConfig;
  onRegisterSubmit: (formData: Omit<CaregiverRegistration, "id" | "createdAt">) => void;
  onOpenLegalModal: (type: "terms" | "privacy" | "community") => void;
  onBack?: () => void;
}

export default function RegistrationForm({ config, onRegisterSubmit, onOpenLegalModal, onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    caregiverName: "",
    caregiverPhone: "",
    caregiverSsn: "",
    relationship: "",
    patientName: "",
    guardianName: "",
    guardianPhone: "",
    insuranceCompany: KOREAN_INSURANCE_COMPANIES[0],
    hospitalName: "",
    admissionDate: "",
    caregivingFee: "",
  });

  const [isAgreed, setIsAgreed] = useState({
    feePolicy: false,
    liabilityPolicy: false,
    insuranceConsent: false,
    privacyPolicy: false,
  });

  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    caregiverPhone: string;
    guardianPhone: string;
    caregiverName: string;
    patientName: string;
    guardianName: string;
    isSending: boolean;
    mode?: string;
    deliverySummary?: "alimtalk_success" | "sms_fallback_success" | "all_failed";
    statusMessage?: string;
    receivedAt?: string;
  } | null>(null);

  const relationships = ["자녀", "배우자", "사위/며느리", "형제/자매", "부모", "손자/손녀", "기타 친인척"];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof typeof isAgreed) => {
    setIsAgreed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Verification
    if (
      !formData.caregiverName ||
      !formData.caregiverPhone ||
      !formData.caregiverSsn ||
      !formData.patientName ||
      !formData.guardianName ||
      !formData.guardianPhone ||
      !formData.hospitalName ||
      !formData.admissionDate ||
      !formData.caregivingFee
    ) {
      alert("모든 필수 입력 정보를 기재해 주시기 바랍니다.");
      return;
    }

    if (!isAgreed.feePolicy || !isAgreed.liabilityPolicy || !isAgreed.insuranceConsent || !isAgreed.privacyPolicy) {
      alert("개인정보 처리방침 동의를 포함하여 모든 필수 약관 항목에 동의해 주셔야 등록 신청이 가능합니다.");
      return;
    }

    const dataToSubmit = { ...formData };

    // Submit to App state
    onRegisterSubmit(formData);

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

    // Open simulated/real Alimtalk alert notification modal
    setNotificationModal({
      isOpen: true,
      caregiverPhone: dataToSubmit.caregiverPhone,
      guardianPhone: dataToSubmit.guardianPhone,
      caregiverName: dataToSubmit.caregiverName,
      patientName: dataToSubmit.patientName,
      guardianName: dataToSubmit.guardianName,
      isSending: true,
      receivedAt: formattedReceivedAt,
    });

    // Reset Form
    setFormData({
      caregiverName: "",
      caregiverPhone: "",
      caregiverSsn: "",
      relationship: "자녀",
      patientName: "",
      guardianName: "",
      guardianPhone: "",
      insuranceCompany: KOREAN_INSURANCE_COMPANIES[0],
      hospitalName: "",
      admissionDate: "",
      caregivingFee: "",
    });
    setIsAgreed({
      feePolicy: false,
      liabilityPolicy: false,
      insuranceConsent: false,
      privacyPolicy: false,
    });

    // Trigger Aligo Alimtalk / SMS (using smart dual-tier dispatch)
    (async () => {
      try {
        console.log(`📡 Sending registration Alimtalk for caregiver ${dataToSubmit.caregiverName}...`);
        const result = await sendRegistrationAlimtalk(dataToSubmit);

        setNotificationModal((prev) =>
          prev
            ? {
                ...prev,
                isSending: false,
                mode: result.mode || "live",
                deliverySummary: result.deliverySummary || (result.success ? "alimtalk_success" : "all_failed"),
                statusMessage: result.message || "발송 처리가 완료되었습니다.",
              }
            : null
        );
      } catch (err: any) {
        console.error("Aligo API send error:", err);
        setNotificationModal((prev) =>
          prev
            ? {
                ...prev,
                isSending: false,
                mode: "error_config",
                deliverySummary: "all_failed",
                statusMessage: `알림톡/문자 발송 중 오류: ${err.message || "네트워크 오류"}.`,
              }
            : null
        );
      }
    })();
  };

  return (
    <section id="registration" className="py-8 px-4 max-w-6xl mx-auto scroll-mt-20">
      {onBack && (
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-[#1e3a8a] border border-blue-100 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            메인 화면으로
          </button>

          <span className="text-xs font-black tracking-widest text-[#1e3a8a] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            가족간병 즉시신청
          </span>
        </div>
      )}
      
      {/* SECTION TITLE */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="inline-block"
        >
          <span className="text-[11px] font-bold tracking-widest text-[#f43f5e] bg-rose-100 px-3 py-1 rounded-full uppercase shadow-sm">
            REGISTRATION FORM
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e3a8a] mt-2 tracking-tight whitespace-nowrap">
            가족간병 등록 신청
          </h2>
        </motion.div>
      </div>

      {/* Mascot On-i Speech Bubble */}
      <div className="mb-8 max-w-3xl mx-auto">
        <MascotOni text={config.oniFormText} pose="writing" />
      </div>

      {/* 3D OUTER REGISTRATION CARD (Placed immediately below title/mascot!) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 85 }}
        className="max-w-4xl mx-auto bg-white/70 backdrop-blur-xl rounded-[24px] p-6 md:p-8 border border-white/50 shadow-2xl relative overflow-hidden mb-10 text-[#1a1a1a]"
      >
        {/* Glow corner decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/50 rounded-full filter blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-100/40 rounded-full filter blur-3xl -z-10" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. 간병인 성명 */}
            <div>
              <label className="block text-sm font-extrabold text-[#1e3a8a] mb-1.5">
                간병인 성명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="caregiverName"
                value={formData.caregiverName}
                onChange={handleInputChange}
                placeholder="예: 홍길동"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm focus:bg-white"
                required
              />
            </div>

            {/* 2. 간병인 연락처 */}
            <div>
              <label className="block text-sm font-extrabold text-[#1e3a8a] mb-1.5">
                간병인 연락처 <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="caregiverPhone"
                value={formData.caregiverPhone}
                onChange={handleInputChange}
                placeholder="예: 010-1234-5678"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm focus:bg-white"
                required
              />
            </div>

            {/* 2-2. 간병인 생년월일 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-extrabold text-[#1e3a8a]">
                  간병인 생년월일 <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                  <Lock className="w-3 h-3 stroke-[2.5]" /> 256비트 암호화 보호
                </span>
              </div>
              <input
                type="text"
                name="caregiverSsn"
                value={formData.caregiverSsn}
                onChange={handleInputChange}
                placeholder="예: 1980년 01월 01일 (또는 800101)"
                maxLength={30}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm focus:bg-white"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1 font-medium">※ 보험사 제출 및 가족관계 증빙에 필요한 필수 정보입니다.</p>
            </div>



            {/* 4. 환자 성명 */}
            <div>
              <label className="block text-sm font-extrabold text-[#1e3a8a] mb-1.5">
                환자 성명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                placeholder="예: 홍길동"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm focus:bg-white"
                required
              />
            </div>

            {/* 5. 구인자(보호자) 성명 */}
            <div>
              <label className="block text-sm font-extrabold text-[#1e3a8a] mb-1.5">
                구인자(보호자) 성명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleInputChange}
                placeholder="예: 홍길동 (통상 간병비 청구 보호자)"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm focus:bg-white"
                required
              />
            </div>

            {/* 6. 구인자(보호자) 연락처 */}
            <div>
              <label className="block text-sm font-extrabold text-[#1e3a8a] mb-1.5">
                구인자(보호자) 연락처 <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleInputChange}
                placeholder="예: 010-8765-4321"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm focus:bg-white"
                required
              />
            </div>

            {/* 7. 가입 보험회사명 */}
            <div>
              <label className="block text-sm font-extrabold text-[#1e3a8a] mb-1.5">
                가입 보험회사명 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm appearance-none focus:bg-white"
                >
                  {KOREAN_INSURANCE_COMPANIES.map((ins) => (
                    <option key={ins} value={ins}>
                      {ins}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#1e3a8a] font-extrabold">
                  ▼
                </div>
              </div>
            </div>

            {/* 8. 입원 병원명 */}
            <div>
              <label className="block text-sm font-extrabold text-[#1e3a8a] mb-1.5">
                입원 병원명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                placeholder="예: 서울대학교병원 (원내 호실 포함 기재 가능)"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm focus:bg-white"
                required
              />
            </div>

            {/* 9. 입원(예정) 날짜 */}
            <div>
              <label className="block text-sm font-extrabold text-[#1e3a8a] mb-1.5">
                입원(예정) 날짜 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm focus:bg-white"
                required
              />
            </div>

            {/* 10. 1일(24시간) 또는 1시간 기준 간병비(원) */}
            <div>
              <label className="block text-sm font-extrabold text-[#1e3a8a] mb-1.5">
                1일(24시간) 또는 1시간 기준 간병비(원) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="caregivingFee"
                value={formData.caregivingFee}
                onChange={handleInputChange}
                placeholder="예: 1일 기준 150,000원"
                className="w-full px-4 py-2.5 rounded-2xl bg-white/70 border border-slate-300 text-xs md:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all shadow-sm focus:bg-white"
                required
              />
            </div>

          </div>

          {/* SERVICE TERMS / NOTICES (Placed inside the form, above the submit button!) */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs md:text-sm font-extrabold text-[#1e3a8a] tracking-tight mb-3 text-center">
              서비스 약관 및 매칭 고지사항 (필수 동의)
            </h3>

            {/* 협회 운영규정 효력 발생 고지 배너 */}
            <div className="mb-4 p-3.5 rounded-2xl bg-blue-50/75 border border-blue-100 text-[11px] text-[#1e3a8a] flex items-start gap-2.5 shadow-sm">
              <span className="text-base shrink-0">📢</span>
              <div>
                <p className="font-extrabold text-xs mb-0.5 text-[#1e3a8a]">협회 운영규정 등록 효력 안내</p>
                <p className="text-slate-600 font-semibold leading-relaxed">
                  "협회는 정상 접수된 신청에 대하여 <span className="text-blue-700 font-extrabold">접수일을 기준으로 등록 효력이 발생</span>한다."
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Notice 1: 중개수수료 반환 규정 */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleCheckboxChange("feePolicy")}
                className={`cursor-pointer bg-white/60 backdrop-blur-md rounded-2xl p-3.5 border transition-all duration-300 flex flex-col justify-between relative ${
                  isAgreed.feePolicy
                    ? "border-[#1e3a8a] shadow-[0_8px_20px_rgba(30,58,138,0.08)] bg-white/95"
                    : "border-slate-200/60 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 text-rose-700 font-extrabold text-[11px] mb-1.5">
                    <div className="flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>[필수] 중개수수료 정산 및 환불 불가 동의</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLegalModal("terms");
                      }}
                      className="text-slate-400 hover:text-[#1e3a8a] hover:underline text-[9px] font-bold p-0.5 cursor-pointer transition-colors shrink-0"
                    >
                      전문보기 ↗
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                    협회에 납부하시는 중개 행정 수수료는 구인·구직 중개 서비스 이용 및 행정 시스템 활용에 대한 대가이며, 가입 보험사의 실제 지급 심사 결과 및 부적합 반려 여부와 무관하게 계약 성립 및 서비스 제공 후에는 환불되지 않습니다.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">내용 확인 및 동의</span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isAgreed.feePolicy
                        ? "bg-[#1e3a8a] border-[#1e3a8a] text-white"
                        : "border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </motion.div>

              {/* Notice 2: 협회의 중개 책임 한계 */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleCheckboxChange("liabilityPolicy")}
                className={`cursor-pointer bg-white/60 backdrop-blur-md rounded-2xl p-3.5 border transition-all duration-300 flex flex-col justify-between relative ${
                  isAgreed.liabilityPolicy
                    ? "border-[#1e3a8a] shadow-[0_8px_20px_rgba(30,58,138,0.08)] bg-white/95"
                    : "border-slate-200/60 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 text-amber-700 font-extrabold text-[11px] mb-1.5">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>[필수] 협회 중개 책임한계 및 면책 법률 고지 동의</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLegalModal("terms");
                      }}
                      className="text-slate-400 hover:text-[#1e3a8a] hover:underline text-[9px] font-bold p-0.5 cursor-pointer transition-colors shrink-0"
                    >
                      전문보기 ↗
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                    온가족간병협회는 환자와 간병인 간 구인·구직 활동을 중개하는 플랫폼 기관으로, 정식 등록 이후 실제 현장 근무 중 발생되는 상호 간의 민·형사상 분쟁 및 과실에 대해서는 일체의 연대책임을 지지 않으며 분쟁 의무는 양 당사자에게 귀속됩니다.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">내용 확인 및 동의</span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isAgreed.liabilityPolicy
                        ? "bg-[#1e3a8a] border-[#1e3a8a] text-white"
                        : "border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </motion.div>

              {/* Notice 3: 보험사 추가 증빙 보완 요구 */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleCheckboxChange("insuranceConsent")}
                className={`cursor-pointer bg-white/60 backdrop-blur-md rounded-2xl p-3.5 border transition-all duration-300 flex flex-col justify-between relative ${
                  isAgreed.insuranceConsent
                    ? "border-[#1e3a8a] shadow-[0_8px_20px_rgba(30,58,138,0.08)] bg-white/95"
                    : "border-slate-200/60 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 text-emerald-700 font-extrabold text-[11px] mb-1.5">
                    <div className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>[필수] 보험사 실질 이행 입증 및 협조 서약</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLegalModal("terms");
                      }}
                      className="text-slate-400 hover:text-[#1e3a8a] hover:underline text-[9px] font-bold p-0.5 cursor-pointer transition-colors shrink-0"
                    >
                      전문보기 ↗
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                    보험회사 심사과정에서는 가족간병 이행의 진위 파악을 위해 원내 간호기록지 사본, 병실 재원증명 등 추가적 보완 서류를 요구할 수 있습니다. 환자의 안전 및 명확한 실시간 간병 입증을 위해 원내 간호 확인 및 위치확인 관련 서약 동의가 수반될 수 있습니다.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">내용 확인 및 동의</span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isAgreed.insuranceConsent
                        ? "bg-[#1e3a8a] border-[#1e3a8a] text-white"
                        : "border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </motion.div>

              {/* Notice 4: 개인정보 수집 및 이용 동의 */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => handleCheckboxChange("privacyPolicy")}
                className={`cursor-pointer bg-white/60 backdrop-blur-md rounded-2xl p-3.5 border transition-all duration-300 flex flex-col justify-between relative ${
                  isAgreed.privacyPolicy
                    ? "border-[#1e3a8a] shadow-[0_8px_20px_rgba(30,58,138,0.08)] bg-white/95"
                    : "border-slate-200/60 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 text-indigo-700 font-extrabold text-[11px] mb-1.5">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>[필수] 개인정보 수집 및 이용 방침 동의</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLegalModal("privacy");
                      }}
                      className="text-slate-400 hover:text-indigo-700 hover:underline text-[9px] font-bold p-0.5 cursor-pointer transition-colors shrink-0"
                    >
                      전문보기 ↗
                    </button>
                  </div>
                  <div className="text-[9px] text-slate-600 font-semibold leading-relaxed space-y-0.5">
                    <p className="text-[#1e3a8a] font-extrabold">※ 개인정보보호법 제15조 및 제22조 의무 고지사항</p>
                    <p><span className="font-bold text-slate-800">• 목적:</span> 간병신청 심사, 본인확인, 알림발송, 보험청구 행정대행</p>
                    <p><span className="font-bold text-slate-800">• 항목:</span> 간병인명·연락처·<span className="text-[#f43f5e] font-extrabold">생년월일</span>, 관계, 환자명·<span className="text-[#f43f5e] font-extrabold">생년월일</span>, 보호자정보, 보험사, 병원, 예정일, 단가</p>
                    <p><span className="font-bold text-slate-800">• 보유:</span> 탈퇴 시 즉시 파기 (단, 관계 법령에 따른 보존 시 해당 기간 준수)</p>
                    <p><span className="font-bold text-slate-800">• 거부:</span> 동의 거부 권리가 있으나, 거부 시 서비스 이용이 일체 불가합니다.</p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">내용 확인 및 동의</span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isAgreed.privacyPolicy
                        ? "bg-[#1e3a8a] border-[#1e3a8a] text-white"
                        : "border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* Core Submit Button (Sleek Theme style) */}
          <div className="pt-6 text-center">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98, y: 2 }}
              className="px-8 py-4 rounded-2xl bg-[#1e3a8a] hover:bg-[#1a337a] text-white font-extrabold text-sm shadow-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <Send className="w-4 h-4 text-[#84cc16]" />
              <span>가족간병 등록 신청서 전송</span>
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* KAKAOTALK ALIMTALK SIMULATION MODAL */}
      <AnimatePresence>
        {notificationModal && notificationModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Kakao Alimtalk Container (Bouncy Scale Entrance) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative w-full max-w-sm bg-[#FFEB3B] rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-4 border-yellow-400"
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
                  onClick={() => setNotificationModal(null)}
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="bg-white p-5 space-y-4">
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
                  <div className="bg-[#F2F2F2] rounded-2xl p-3.5 border border-slate-200 text-[11px] leading-relaxed text-slate-800 font-semibold space-y-2 shadow-inner whitespace-pre-wrap text-left">
                    <p className="text-[#372a24] font-black text-xs mb-1">
                      가족간병 등록 접수 완료 안내
                    </p>
                    <p>안녕하세요.</p>
                    <p>온가족간병협회입니다.</p>
                    <p>기재해 주신 정보가 협회 시스템에 안전하게 접수되었습니다.</p>
                    <p>"협회는 정상 접수된 신청에 대하여 접수일을 기준으로 등록 효력이 발생합니다." (협회 운영규정)</p>
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <p>간병인: <span className="text-blue-900 font-extrabold">{notificationModal.caregiverName}</span>님</p>
                      <p>보호자: <span className="text-blue-900 font-extrabold">{notificationModal.guardianName}</span>님</p>
                    </div>
                    <p className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-normal font-semibold">
                      ℹ️ 문의사항은 고객센터(010-9520-7839)로 연락주세요.{"\n"}
                      <span className="text-[9px] text-slate-400">채널 추가하고 이 채널의 광고와 마케팅 메시지를 카카오톡으로 받기</span>
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-snug font-bold">
                    * 위 수신 고지는 간병인 연락처({notificationModal.caregiverPhone}), 보호자 연락처({notificationModal.guardianPhone}), 그리고 협회 고객센터(010-9520-7839)로 실시간 동시 전송되었습니다.
                  </p>

                  {notificationModal.isSending ? (
                    <div className="flex items-center gap-2 justify-center py-2 text-[10px] text-indigo-600 font-extrabold bg-indigo-50/50 rounded-xl border border-dashed border-indigo-200 animate-pulse">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      실시간 알리고 알림톡 전송 처리 중...
                    </div>
                  ) : (
                    <div className={`text-[10px] p-2.5 rounded-xl border font-bold flex flex-col gap-1 ${
                      notificationModal.deliverySummary === "all_failed" || notificationModal.mode === "error_config"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : notificationModal.deliverySummary === "sms_fallback_success"
                        ? "bg-blue-50 text-blue-900 border-blue-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>
                      <p className="flex items-center gap-1 text-xs font-black">
                        {(notificationModal.deliverySummary === "all_failed" || notificationModal.mode === "error_config") ? (
                          <X className="w-4 h-4 text-rose-600" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {notificationModal.deliverySummary === "alimtalk_success"
                          ? "알림톡 발송 성공"
                          : notificationModal.deliverySummary === "sms_fallback_success"
                          ? "알림톡 실패 → 문자(LMS) 발송 성공"
                          : "알림톡 및 문자 발송 실패"}
                      </p>
                      <p className="text-[9px] font-semibold leading-relaxed">
                        {notificationModal.statusMessage}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm button */}
                <button
                  onClick={() => setNotificationModal(null)}
                  className="w-full py-3 bg-[#372a24] hover:bg-[#2b201a] text-white rounded-2xl text-xs font-black tracking-wide shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center"
                >
                  확인 및 닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
