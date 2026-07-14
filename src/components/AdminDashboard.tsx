import { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "motion/react";
import { Settings2, ShieldCheck, Phone, MapPin, Link2, FileKey2, MessageSquareText, Users, Eye, HelpCircle } from "lucide-react";
import { WebsiteConfig, CaregiverRegistration } from "../types";
import MascotOni from "./MascotOni";

interface AdminDashboardProps {
  config: WebsiteConfig;
  onUpdateConfig: (newConfig: Partial<WebsiteConfig>) => void;
  registrations: CaregiverRegistration[];
  onClearRegistrations: () => void;
}

export default function AdminDashboard({ config, onUpdateConfig, registrations, onClearRegistrations }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"text" | "mascot" | "registrations">("text");

  // Local state for configuration inputs
  const [inputs, setInputs] = useState({
    representativeName: config.representativeName,
    address: config.address,
    phone: config.phone,
    businessNumber: config.businessNumber,
    kakaoLink: config.kakaoLink,
    oniIntroText: config.oniIntroText,
    oniAboutText: config.oniAboutText,
    oniProcessText: config.oniProcessText,
    oniFormText: config.oniFormText,
    oniNoticeText: config.oniNoticeText,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyChanges = (e: FormEvent) => {
    e.preventDefault();
    onUpdateConfig(inputs);
    alert("축하합니다! 관리자 수정사항이 전체 홈페이지 레이아웃에 실시간 적용되었습니다. 🚀");
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border-4 border-slate-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] relative overflow-hidden max-w-4xl mx-auto my-12">
      {/* 3D Gloss reflection overlay */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-40" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#1e3a8a] rounded-xl text-white shadow-[0_4px_12px_rgba(30,58,138,0.4)] animate-pulse">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wider text-blue-400 flex items-center gap-1.5 uppercase">
              Admin Configuration Control <ShieldCheck className="w-4 h-4 text-green-400" />
            </h3>
            <h2 className="text-lg font-extrabold text-white">협회 실시간 통합 대시보드</h2>
          </div>
        </div>
        <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full shadow-inner uppercase select-none">
          Live Editor Connected
        </span>
      </div>

      {/* Mascot Speech Bubble inside Admin Area */}
      <div className="mb-6">
        <MascotOni text={config.oniAdminText} pose="think" className="!bg-slate-800/80 !border-slate-700/50 !text-slate-100" />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("text")}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "text"
              ? "bg-[#1e3a8a] text-white shadow-[0_-2px_10px_rgba(30,58,138,0.15)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileKey2 className="w-3.5 h-3.5" />
          <span>기본 정보 및 정보 연동</span>
        </button>
        <button
          onClick={() => setActiveTab("mascot")}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "mascot"
              ? "bg-[#1e3a8a] text-white shadow-[0_-2px_10px_rgba(30,58,138,0.15)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          <span>온이 마스코트 문구 수정</span>
        </button>
        <button
          onClick={() => setActiveTab("registrations")}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "registrations"
              ? "bg-[#1e3a8a] text-white shadow-[0_-2px_10px_rgba(30,58,138,0.15)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>등록된 간병인 명단 ({registrations.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Text inputs */}
      {activeTab === "text" && (
        <form onSubmit={handleApplyChanges} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Representative Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                온가족간병협회 대표 <HelpCircle className="w-3.5 h-3.5 text-slate-500" title="대표 인사말과 시그니처에 적용됩니다" />
              </label>
              <input
                type="text"
                name="representativeName"
                value={inputs.representativeName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                협회 주소 <MapPin className="w-3.5 h-3.5 text-slate-500" />
              </label>
              <input
                type="text"
                name="address"
                value={inputs.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Phone (Placeholder enabled) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                고객센터 전화번호 <Phone className="w-3.5 h-3.5 text-slate-500" title="비어 있는 경우 공란 표시" />
              </label>
              <input
                type="text"
                name="phone"
                value={inputs.phone}
                onChange={handleInputChange}
                placeholder="예: 1544-XXXX (확인 후 즉시 입력)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-500"
              />
            </div>

            {/* Business Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                사업자등록번호 <FileKey2 className="w-3.5 h-3.5 text-slate-500" />
              </label>
              <input
                type="text"
                name="businessNumber"
                value={inputs.businessNumber}
                onChange={handleInputChange}
                placeholder="예: XXX-XX-XXXXX (확인 후 즉시 입력)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-500"
              />
            </div>

            {/* Kakao link */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                실시간 카카오톡 채널 상담 주소 <Link2 className="w-3.5 h-3.5 text-slate-500" />
              </label>
              <input
                type="text"
                name="kakaoLink"
                value={inputs.kakaoLink}
                onChange={handleInputChange}
                placeholder="예: https://pf.kakao.com/_XXXX (확인 후 즉시 입력)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-500"
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1a337a] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer border-b-2 border-[#162a64] mt-4 text-center block"
          >
            기본정보 실시간 동기화 완료
          </button>
        </form>
      )}

      {/* TAB CONTENT 2: Mascot Speeches */}
      {activeTab === "mascot" && (
        <form onSubmit={handleApplyChanges} className="space-y-4">
          <div className="space-y-3.5">
            {/* Hero Oni Text */}
            <div>
              <label className="block text-[11px] font-bold text-blue-300 mb-1">히어로 배너 온이 인사말</label>
              <textarea
                name="oniIntroText"
                value={inputs.oniIntroText}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-semibold rounded-xl text-white focus:outline-none"
              />
            </div>

            {/* Intro Oni Text */}
            <div>
              <label className="block text-[11px] font-bold text-blue-300 mb-1">협회소개 섹션 온이 문구</label>
              <textarea
                name="oniAboutText"
                value={inputs.oniAboutText}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-semibold rounded-xl text-white focus:outline-none"
              />
            </div>

            {/* Process Oni Text */}
            <div>
              <label className="block text-[11px] font-bold text-blue-300 mb-1">신청절차 섹션 온이 문구</label>
              <textarea
                name="oniProcessText"
                value={inputs.oniProcessText}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-semibold rounded-xl text-white focus:outline-none"
              />
            </div>

            {/* Form Oni Text */}
            <div>
              <label className="block text-[11px] font-bold text-blue-300 mb-1">간병인등록 신청서 온이 문구</label>
              <textarea
                name="oniFormText"
                value={inputs.oniFormText}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-semibold rounded-xl text-white focus:outline-none"
              />
            </div>

            {/* Notice Oni Text */}
            <div>
              <label className="block text-[11px] font-bold text-blue-300 mb-1">게시판 섹션 온이 문구</label>
              <textarea
                name="oniNoticeText"
                value={inputs.oniNoticeText}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-semibold rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1a337a] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer border-b-2 border-[#162a64] mt-4 text-center block"
          >
            마스코트 온이 대화문구 실시간 수정 저장
          </button>
        </form>
      )}

      {/* TAB CONTENT 3: Registered Caregivers */}
      {activeTab === "registrations" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span>등록된 가족간병인 명부 (총 {registrations.length}명)</span>
            </h4>
            {registrations.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("등록된 모든 내역을 초기화하시겠습니까? 데이터가 전부 지워집니다.")) {
                    onClearRegistrations();
                  }
                }}
                className="text-[10px] font-black text-rose-400 bg-rose-950/40 border border-rose-900 px-2 py-1 rounded hover:bg-rose-900 hover:text-white transition-all cursor-pointer"
              >
                전체 기록 삭제
              </button>
            )}
          </div>

          {registrations.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800 text-xs font-bold text-slate-400">
              현재 제출된 등록 신청이 존재하지 않습니다. 메인 화면의 가족간병 신청서를 입력해보세요.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 font-extrabold">
                    <th className="p-3">간병인 (관계)</th>
                    <th className="p-3">생년월일</th>
                    <th className="p-3">환자명</th>
                    <th className="p-3">병원명</th>
                    <th className="p-3">가입 보험사</th>
                    <th className="p-3">간병비</th>
                    <th className="p-3">연락처 (간병인 / 보호자)</th>
                    <th className="p-3">등록시간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-semibold text-slate-200">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/50">
                      <td className="p-3 text-white font-extrabold">
                        {reg.caregiverName} ({reg.relationship})
                      </td>
                      <td className="p-3 text-rose-300 font-mono text-[10px] select-all bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-900/40">
                        {reg.caregiverSsn || "-"}
                      </td>
                      <td className="p-3">{reg.patientName}</td>
                      <td className="p-3 text-emerald-400">{reg.hospitalName}</td>
                      <td className="p-3 text-blue-300">{reg.insuranceCompany}</td>
                      <td className="p-3 font-bold text-yellow-400">{reg.caregivingFee}</td>
                      <td className="p-3 text-[10px]">
                        <p>간: {reg.caregiverPhone}</p>
                        <p className="text-slate-400">보: {reg.guardianPhone}</p>
                      </td>
                      <td className="p-3 text-[10px] text-slate-400">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
