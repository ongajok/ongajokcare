import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, MessageSquare, Edit3, Lock, Unlock, Settings, X, Check, HelpCircle, ArrowDown } from "lucide-react";
import { WebsiteConfig, NoticePost, CaregiverRegistration } from "./types";
import { DEFAULT_CONFIG, INITIAL_NOTICES } from "./data";

// Component Imports
import MascotOni from "./components/MascotOni";
import Introduction from "./components/Introduction";
import Process from "./components/Process";
import RegistrationForm from "./components/RegistrationForm";
import NoticeBoard from "./components/NoticeBoard";
import AdminDashboard from "./components/AdminDashboard";
import MobileFloatingButtons from "./components/MobileFloatingButtons";
import Footer from "./components/Footer";
import { CompanyLogo } from "./components/CompanyLogo";
import { LegalModals, LegalModalType } from "./components/LegalModals";

// Real generated image path from step response
const HERO_FAMILY_IMAGE = "/src/assets/images/korean_caregiving_family_1782756099570.jpg";

export default function App() {
  // Website states with LocalStorage persistence
  const [config, setConfig] = useState<WebsiteConfig>(() => {
    const saved = localStorage.getItem("ongajok_config");
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [notices, setNotices] = useState<NoticePost[]>(() => {
    const saved = localStorage.getItem("ongajok_notices_v2");
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [registrations, setRegistrations] = useState<CaregiverRegistration[]>(() => {
    const saved = localStorage.getItem("ongajok_registrations");
    return saved ? JSON.parse(saved) : [];
  });

  // Admin access state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("ongajok_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("ongajok_notices_v2", JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem("ongajok_registrations", JSON.stringify(registrations));
  }, [registrations]);

  // Section smooth scrolling helper
  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Admin callbacks
  const handleUpdateConfig = (newConfig: Partial<WebsiteConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handleAddNotice = (post: Omit<NoticePost, "id" | "date">) => {
    const newPost: NoticePost = {
      ...post,
      id: `notice-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setNotices((prev) => [newPost, ...prev]);
  };

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearRegistrations = () => {
    setRegistrations([]);
  };

  // Registration submit callback
  const handleRegisterSubmit = (formData: Omit<CaregiverRegistration, "id" | "createdAt">) => {
    const newReg: CaregiverRegistration = {
      ...formData,
      id: `reg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRegistrations((prev) => [newReg, ...prev]);
  };

  // Phone Call Action
  const handlePhoneCall = () => {
    if (config.phone) {
      window.location.href = `tel:${config.phone}`;
    } else {
      alert("고객센터 전화번호가 등록되지 않았습니다. 대표 관리자 설정에서 번호를 등록해 주세요!");
    }
  };

  // Kakao Consultation Action
  const handleKakaoConsultation = () => {
    if (config.kakaoLink) {
      window.open(config.kakaoLink, "_blank");
    } else {
      alert("실시간 카카오톡 연결 링크가 등록되지 않았습니다. 대표 관리자 설정에서 링크를 등록해 주세요!");
    }
  };

  // Login handler
  const handleAdminLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (adminPinInput === "0000" || adminPinInput === "") {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminPinInput("");
      alert("관리자 권한 승인 완료! 실시간 수정을 진행해 주세요. 🔓");
    } else {
      alert("비밀번호가 올바르지 않습니다. (안내 팁: '0000'을 입력해 주세요)");
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#f5f2ed] via-[#d1dace] to-[#e8dcc4] text-[#1a1a1a] min-h-screen relative overflow-x-hidden font-sans pb-12 selection:bg-rose-100">
      
      {/* ========================================================= */}
      {/* 3D SLEEK AMBIENT GLOW SYSTEM */}
      {/* ========================================================= */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#84cc16] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-[#f43f5e] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-[500px] h-[500px] bg-[#84cc16] rounded-full mix-blend-multiply filter blur-[120px] opacity-15 pointer-events-none" />
      <div className="absolute bottom-[35%] left-[-150px] w-[600px] h-[600px] bg-[#f43f5e] rounded-full mix-blend-multiply filter blur-[130px] opacity-15 pointer-events-none" />

      {/* ========================================================= */}
      {/* HEADER / NAVIGATION BAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo Brand with double line text */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <CompanyLogo size={44} />
            <div className="flex flex-col select-none">
              <span className="text-xs font-black tracking-widest text-[#1e3a8a] leading-tight">온가족</span>
              <span className="text-sm font-black tracking-tighter text-[#1e3a8a] leading-none">간병협회</span>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-black text-slate-600">
            <button onClick={() => handleScrollToSection("introduction")} className="hover:text-[#1e3a8a] hover:scale-105 transition-all cursor-pointer">
              협회소개
            </button>
            <button onClick={() => handleScrollToSection("process")} className="hover:text-[#1e3a8a] hover:scale-105 transition-all cursor-pointer">
              신청절차
            </button>
            <button onClick={() => handleScrollToSection("registration")} className="hover:text-[#1e3a8a] hover:scale-105 transition-all cursor-pointer">
              가족간병 등록
            </button>
            <button onClick={() => handleScrollToSection("notices")} className="hover:text-[#1e3a8a] hover:scale-105 transition-all cursor-pointer">
              게시판
            </button>
          </nav>

          {/* Header Action Buttons & Security Toggle */}
          <div className="flex items-center gap-2">
            {/* Header Direct Phone Call Icon */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePhoneCall}
              className="p-2.5 bg-white text-[#1e3a8a] hover:bg-slate-50 rounded-xl border border-blue-100 shadow-md cursor-pointer transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
              title="전화상담 연결"
            >
              <Phone className="w-4 h-4 fill-[#1e3a8a]" />
            </motion.button>

            {/* Header Direct KakaoTalk Consultation Icon */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleKakaoConsultation}
              className="p-2.5 bg-[#fee500] text-[#3c1e1e] hover:bg-[#edd300] rounded-xl shadow-md cursor-pointer transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
              title="카톡 실시간상담"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#3c1e1e]">
                <path d="M12 3c-5.523 0-10 3.582-10 8c0 2.91 1.848 5.485 4.636 6.883l-1.18 4.316c-.1.365.311.666.623.46l5.067-3.342c.28.024.564.043.854.043 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
              </svg>
            </motion.button>

            {/* Header Direct Caregiver Registration Form Nav Icon */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleScrollToSection("registration")}
              className="p-2.5 bg-[#f43f5e] text-white hover:bg-[#e11d48] rounded-xl shadow-md cursor-pointer transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
              title="가족간병 등록신청"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>

            {/* Administrative Panel Security Switch */}
            <div className="h-5 w-[1px] bg-slate-300 mx-1" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isAdminMode) {
                  setIsAdminMode(false);
                  alert("안전하게 로그아웃되어 일반 유저 화면으로 복귀했습니다. 🔒");
                } else {
                  setShowAdminLogin(true);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                isAdminMode
                  ? "bg-[#84cc16] text-white shadow-[#84cc16]/20"
                  : "bg-slate-900 text-slate-100 hover:bg-slate-800"
              }`}
            >
              {isAdminMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isAdminMode ? "관리자 켜짐" : "관리자 설정"}</span>
            </motion.button>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* MOVIE-POSTER STYLE CINEMATIC HERO BANNER */}
      {/* ========================================================= */}
      <section className="relative w-full max-w-6xl mx-auto px-4 pt-6 pb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-[0_35px_70px_rgba(0,0,0,0.3),inset_0_2px_10px_rgba(255,255,255,0.15)] h-[440px] md:h-[480px] flex items-center justify-center border border-white/10 transition-all duration-500">
          
          {/* Multi-Layered 3D & 4D Cinematic Parallax Engine */}
          <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
            {/* Layer 1: Ambient Background Layer (Slightly blurred, slow warm pan) */}
            <motion.img
              src={HERO_FAMILY_IMAGE}
              alt="Background Layer"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.75] contrast-[1.05] blur-[1px] scale-[1.12]"
              animate={{
                scale: [1.12, 1.18, 1.14, 1.20, 1.12],
                x: [-15, 10, -5, 15, -15],
                y: [8, -12, 10, -8, 8],
              }}
              transition={{
                duration: 32,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Layer 2: Main Subject Focus Layer (Simulates 3D separation of people from background)
                Uses a custom radial mask so only the family in the center is rendered, moving on a different offset scale */}
            <motion.div
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                clipPath: "ellipse(48% 52% at 50% 48%)",
              }}
              animate={{
                scale: [1.03, 1.08, 1.05, 1.10, 1.03],
                x: [10, -8, 12, -10, 10],
                y: [-6, 8, -12, 6, -6],
              }}
              transition={{
                duration: 24,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={HERO_FAMILY_IMAGE}
                alt="Subject Focus Layer"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter brightness-[0.98] contrast-[1.05] drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
              />
            </motion.div>

            {/* Layer 3: Warm Environmental Glow & Moving Volumetric Light Ray */}
            <motion.div 
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_25%,rgba(251,191,36,0.18),transparent_65%)] pointer-events-none mix-blend-screen"
              animate={{
                opacity: [0.5, 0.9, 0.6, 1.0, 0.5],
                scale: [1.0, 1.15, 1.05, 1.2, 1.0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Moving Sunbeam / Real-time Lens Flare */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/15 to-transparent pointer-events-none mix-blend-color-dodge"
              animate={{
                opacity: [0.3, 0.75, 0.3],
                x: ['-35%', '35%', '-35%'],
                y: ['-15%', '15%', '-15%'],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Simulated 4D Shadow Swaying Overlay (Creates separate dynamic lighting across subjects) */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-slate-950/30 pointer-events-none mix-blend-multiply"
              animate={{
                opacity: [0.2, 0.5, 0.2],
                x: [-20, 20, -20],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Floating Cinematic Bokeh Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-amber-200/20 mix-blend-screen filter blur-[2.5px]"
                  style={{
                    width: Math.random() * 9 + 4,
                    height: Math.random() * 9 + 4,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -90, 0],
                    x: [0, Math.random() * 50 - 25, 0],
                    scale: [1, Math.random() * 1.8 + 0.6, 1],
                    opacity: [Math.random() * 0.15 + 0.1, Math.random() * 0.7 + 0.2, Math.random() * 0.15 + 0.1],
                  }}
                  transition={{
                    duration: Math.random() * 12 + 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * -12,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Premium dark & warm transparent gradients for maximum text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent z-[2]" />
          <div className="absolute inset-0 bg-amber-900/10 pointer-events-none z-[2]" />

          {/* Slogan and details centered/bottomed on banner */}
          <div className="absolute bottom-10 left-6 right-6 md:left-12 md:right-12 text-center md:text-left z-10 space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <span className="text-[10px] font-black tracking-widest text-amber-300 bg-amber-900/50 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/20 uppercase shadow-sm">
                Nationwide Caregiving Association
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-4xl font-black text-white tracking-tight leading-snug"
            >
              아픈 가족의 곁, 가장 가까운 곳에서 <br className="hidden md:inline" /> 따뜻한 동행이 시작됩니다
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xs md:text-sm text-slate-200 font-semibold leading-relaxed max-w-2xl"
            >
              가족간병 등록부터 행정 서류 구비까지 온가족간병협회가 보호자님과 늘 함께하겠습니다.
            </motion.p>

            {/* Quick 3D Banner Call-To-Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3"
            >
              <button
                onClick={() => handleScrollToSection("registration")}
                className="px-5 py-2.5 bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg border-b-4 border-amber-600 hover:border-b-2 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer relative overflow-hidden group"
              >
                {/* Embedded dynamic glow overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                가족간병 신청서 즉시작성
              </button>
              <button
                onClick={handleKakaoConsultation}
                className="px-5 py-2.5 bg-[#1e3a8a] text-white font-extrabold text-xs rounded-xl border border-[#1e3a8a]/50 hover:bg-[#1a337a] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_4px_20px_rgba(30,58,138,0.45)] relative overflow-hidden group"
              >
                {/* Embedded dynamic glow overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#ffe812]">
                    <path d="M12 3c-5.523 0-10 3.582-10 8c0 2.91 1.848 5.485 4.636 6.883l-1.18 4.316c-.1.365.311.666.623.46l5.067-3.342c.28.024.564.043.854.043 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
                  </svg>
                  실시간 카카오톡 전문상담
                </span>
              </button>
            </motion.div>
          </div>

          {/* Floated Mini Welcoming Mascot '온이' Bubble inside Hero Banner */}
          <div className="absolute top-6 right-6 z-20 max-w-xs hidden md:block">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
            >
              <MascotOni text={config.oniIntroText} pose="wave" className="!bg-slate-950/70 !border-slate-800/40 !backdrop-blur-lg" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* COLLAPSIBLE ADMIN CONTROL CMS PANEL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isAdminMode && (
          <motion.section
            initial={{ opacity: 0, y: -40, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -40, height: 0 }}
            className="px-4 max-w-6xl mx-auto"
          >
            <AdminDashboard
              config={config}
              onUpdateConfig={handleUpdateConfig}
              registrations={registrations}
              onClearRegistrations={handleClearRegistrations}
            />
          </motion.section>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* ASSOCIATION INTRODUCTION (협회소개) */}
      {/* ========================================================= */}
      <Introduction config={config} />

      {/* ========================================================= */}
      {/* APPLICATION PROCESS (신청절차) */}
      {/* ========================================================= */}
      <Process config={config} />

      {/* ========================================================= */}
      {/* CAREGIVER REGISTRATION FORM (가족간병 등록 신청) */}
      {/* ========================================================= */}
      <RegistrationForm config={config} onRegisterSubmit={handleRegisterSubmit} onOpenLegalModal={setLegalModalType} />

      {/* ========================================================= */}
      {/* NOTICE & NEWS BOARD (알림 및 소식 게시판) */}
      {/* ========================================================= */}
      <NoticeBoard
        config={config}
        notices={notices}
        isAdmin={isAdminMode}
        onAddNotice={handleAddNotice}
        onDeleteNotice={handleDeleteNotice}
      />

      {/* ========================================================= */}
      {/* FOOTER & COMPLIANCES DISCLOSURES */}
      {/* ========================================================= */}
      <Footer config={config} onOpenLegalModal={setLegalModalType} />

      {/* ========================================================= */}
      {/* FLOATING ACTION INTERACTIVE MOBILE/DESKTOP ACTIONS */}
      {/* ========================================================= */}
      <MobileFloatingButtons config={config} onScrollToSection={handleScrollToSection} />

      {/* ========================================================= */}
      {/* ADMINISTRATOR ACCESS PASSWORD OVERLAY MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminLogin(false)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            />

            {/* Password Dialogue box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-sm bg-slate-900 border-2 border-slate-700 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                  <span className="text-sm font-black text-white">협회 전용 대시보드 로그인</span>
                </div>
                <button onClick={() => setShowAdminLogin(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Administrator PIN CODE
                  </label>
                  <input
                    type="password"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    placeholder="관리자 비밀번호를 입력해 주세요."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="p-3 bg-indigo-950/50 border border-indigo-900 rounded-2xl text-[10px] leading-relaxed text-indigo-300 font-bold">
                  💡 대표님 안내 가이드: <br />
                  현재는 초기 세팅 모드입니다. 비밀번호 창에 <span className="text-emerald-400 font-black underline">'0000'</span> 또는 <span className="text-emerald-400 font-black underline">빈칸</span>인 채로 로그인 버튼을 누르시면 관리자 편집 권한이 완벽히 승인됩니다!
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 rounded-2xl text-xs font-black text-slate-400 cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black tracking-wide cursor-pointer shadow-md"
                  >
                    인증 및 로그인
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* PROFESSIONAL LEGAL POLICY MODAL OVERLAYS */}
      {/* ========================================================= */}
      <LegalModals
        isOpen={legalModalType !== null}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

    </div>
  );
}
