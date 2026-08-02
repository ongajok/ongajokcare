import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, MessageSquare, Edit3, Lock, Unlock, Settings, X, Check, HelpCircle, ArrowDown, FileText, ClipboardList, ChevronDown, MapPin, Award } from "lucide-react";
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
import CaregiverContract from "./components/CaregiverContract";
import CaregivingLog from "./components/CaregivingLog";

// Real generated image path from step response
const HERO_FAMILY_IMAGE = "https://i.postimg.cc/4x6hRz3m/gajogsajin.png";

export default function App() {
  // View state: 'home' | 'contract' | 'log'
  const [currentView, setCurrentView] = useState<"home" | "contract" | "log">("home");

  // Website states with LocalStorage persistence
  const [config, setConfig] = useState<WebsiteConfig>(() => {
    const saved = localStorage.getItem("ongajok_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Auto-fill missing or empty essential contacts with official defaults
        if (!parsed.phone || parsed.phone === "") parsed.phone = DEFAULT_CONFIG.phone;
        if (!parsed.kakaoLink || parsed.kakaoLink === "" || parsed.kakaoLink === "http://pf.kakao.com/_YxhcwX") {
          parsed.kakaoLink = DEFAULT_CONFIG.kakaoLink;
        }
        return parsed;
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [notices, setNotices] = useState<NoticePost[]>(() => {
    const saved = localStorage.getItem("ongajok_notices_v2");
    if (saved) {
      try {
        const parsed: NoticePost[] = JSON.parse(saved);
        return parsed.map(notice => {
          const updatedNotice = { ...notice };
          if (updatedNotice.date === "2026-07-16") {
            updatedNotice.date = "2026-07-20";
          }
          if (
            updatedNotice.id === "notice-3" || 
            updatedNotice.title.includes("간병과 비용") || 
            updatedNotice.title.includes("알선 중개수수료") || 
            updatedNotice.title.includes("비용은 어떻게")
          ) {
            updatedNotice.title = "비용은 어떻게 적용되나요?";
            updatedNotice.content = "1일 기준 4,000원의 합리적인 행정 수수료로 소중한 가족의 건강과 행복을 온 마음으로 응원하겠습니다.";
          }
          return updatedNotice;
        });
      } catch (e) {
        return INITIAL_NOTICES;
      }
    }
    return INITIAL_NOTICES;
  });

  const [registrations, setRegistrations] = useState<CaregiverRegistration[]>(() => {
    const saved = localStorage.getItem("ongajok_registrations");
    let parsed: CaregiverRegistration[] = [];
    if (saved) {
      try {
        parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed = parsed.filter(reg => reg.id !== "reg-mock-1" && reg.caregiverName !== "홍길동" && reg.caregiverPhone !== "010-1234-5678");
        }
      } catch (e) {
        parsed = [];
      }
    }
    return parsed;
  });

  // Admin access state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Accordion Expand/Collapse State
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [isProcessExpanded, setIsProcessExpanded] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);

  // Sync to LocalStorage & Hash Routing
  useEffect(() => {
    localStorage.setItem("ongajok_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("ongajok_notices_v2", JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem("ongajok_registrations", JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#contract") {
        setCurrentView("contract");
        window.scrollTo(0, 0);
      } else if (hash === "#log") {
        setCurrentView("log");
        window.scrollTo(0, 0);
      } else if (hash === "#home" || hash === "" || hash === "#registration") {
        setCurrentView("home");
      }
    };

    // Run once on load
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Sync hash state with currentView
  useEffect(() => {
    if (currentView === "home") {
      if (["#contract", "#log", "#registration"].includes(window.location.hash.toLowerCase())) {
        window.history.pushState(null, "", window.location.pathname + window.location.search);
      }
    } else {
      if (window.location.hash.toLowerCase() !== `#${currentView}`) {
        window.location.hash = currentView;
      }
    }
  }, [currentView]);

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

  // Phone Call Action
  const handlePhoneCall = () => {
    const phoneNum = config.phone || "010-9520-7839";
    window.location.href = `tel:${phoneNum}`;
  };

  // Kakao Consultation Action
  const handleKakaoConsultation = () => {
    const kakaoUrl = config.kakaoLink || "http://pf.kakao.com/_YxhcwX/chat";
    window.open(kakaoUrl, "_blank");
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
    <div className="bg-gradient-to-br from-[#faf8f5] via-[#f0f4f8] to-[#e8f0fe] text-[#1e293b] min-h-screen relative overflow-x-hidden font-sans pb-12 selection:bg-sky-100">
      
      {/* ========================================================= */}
      {/* BRIGHT SLEEK AMBIENT GLOW SYSTEM */}
      {/* ========================================================= */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-sky-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-25 pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-25 pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-[500px] h-[500px] bg-[#fcd34d] rounded-full mix-blend-multiply filter blur-[130px] opacity-20 pointer-events-none" />

      {/* ========================================================= */}
      {/* HEADER / NAVIGATION BAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 cursor-pointer group select-none shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <CompanyLogo size={36} />
            <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-[#1e3a8a] whitespace-nowrap">
              온가족 간병협회
            </span>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            <a
              href="#accordion-introduction"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView("home");
                setIsIntroExpanded(true);
                setTimeout(() => handleScrollToSection("accordion-introduction"), 100);
              }}
              title="협회소개 페이지"
              className="text-xs md:text-sm font-extrabold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
            >
              협회소개
            </a>
            <a
              href="tel:010-9520-7839"
              title="전화상담 연결 (010-9520-7839)"
              className="text-xs md:text-sm font-extrabold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
            >
              전화상담
            </a>
            <a
              href={config.kakaoLink || "http://pf.kakao.com/_YxhcwX/chat"}
              target="_blank"
              rel="noopener noreferrer"
              title="간병인신청 카카오톡 1:1 상담"
              className="text-xs md:text-sm font-extrabold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
            >
              간병인신청
            </a>
            <a
              href="#accordion-map"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView("home");
                setIsMapExpanded(true);
                setTimeout(() => handleScrollToSection("accordion-map"), 100);
              }}
              title="오시는길"
              className="text-xs md:text-sm font-extrabold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
            >
              오시는길
            </a>
            <a
              href="#accordion-notices"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView("home");
                setIsNoticeExpanded(true);
                setTimeout(() => handleScrollToSection("accordion-notices"), 100);
              }}
              title="게시판"
              className="text-xs md:text-sm font-extrabold text-slate-700 hover:text-[#1e3a8a] transition-colors cursor-pointer"
            >
              게시판
            </a>
          </nav>

          {/* Header Direct Phone Call & Kakao Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Phone Call Button */}
            <a
              href="tel:010-9520-7839"
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm cursor-pointer transition-all duration-200 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold whitespace-nowrap"
              title="전화상담 연결 (010-9520-7839)"
            >
              <Phone className="w-3.5 h-3.5 fill-white shrink-0" />
              <span className="hidden sm:inline">010-9520-7839</span>
              <span className="inline sm:hidden">전화</span>
            </a>

            {/* KakaoTalk Consultation Button */}
            <a
              href={config.kakaoLink || "http://pf.kakao.com/_YxhcwX/chat"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#fee500] hover:bg-[#edd300] text-[#191919] rounded-xl shadow-sm cursor-pointer transition-all duration-200 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-black whitespace-nowrap"
              title="카카오톡 1:1 상담"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#191919] shrink-0">
                <path d="M12 3c-5.523 0-10 3.582-10 8c0 2.91 1.848 5.485 4.636 6.883l-1.18 4.316c-.1.365.311.666.623.46l5.067-3.342c.28.024.564.043.854.043 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
              </svg>
              <span>카톡 1:1 상담</span>
            </a>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* HIGH-CONTRAST HERO BANNER WITH DIRECT CONSULTATION BUTTONS */}
      {/* ========================================================= */}
      {currentView === "home" && (
        <section className="relative w-full max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-6 sm:pb-8">
        <div 
          className="relative rounded-3xl sm:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] min-h-[460px] md:min-h-[500px] flex items-center justify-center border border-white/20 py-10 md:py-14 bg-slate-950"
        >
          
          {/* Static Clear Background Image - No Blend Modes or Blur */}
          <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
            <img
              src={HERO_FAMILY_IMAGE}
              alt="온가족간병협회 대표 이미지"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.05]"
            />
          </div>

          {/* High-Contrast Dark Gradient Overlay for Maximum Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-900/40 z-[2]" />

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-block"
            >
              <span className="text-xs font-black tracking-wider text-amber-300 bg-slate-900/80 border border-amber-400/50 backdrop-blur-md px-4 py-1.5 rounded-full shadow-md">
                🏢 전국공식허가 온가족간병협회
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
            >
              아픈 가족의 곁, 가장 가까운 곳에서 <br className="hidden sm:inline" /> 
              <span className="text-[#fde047] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">따뜻한 동행</span>이 시작됩니다
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm md:text-base text-slate-100 font-extrabold max-w-xl mx-auto leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
            >
              가족간병인의 공식 등록부터 행정 서류 준비 대행까지 <br className="hidden md:inline" />
              <span className="text-sky-300">온가족간병협회</span>가 친절하고 정성껏 상담해 드립니다.
            </motion.p>

            {/* Direct Consultation Buttons Grid (Phone Consultation & KakaoTalk Consultation) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto"
            >
              {/* Phone Consultation Button */}
              <a
                href="tel:010-9520-7839"
                className="group relative flex items-center justify-center gap-3 p-3.5 sm:p-4 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-700 hover:from-sky-600 hover:to-blue-800 text-white rounded-2xl shadow-[0_10px_25px_rgba(2,132,199,0.4)] border border-sky-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 fill-white text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                    <span>📞 전화상담</span>
                  </div>
                  <div className="text-[11px] font-extrabold text-sky-100">
                    010-9520-7839
                  </div>
                </div>
              </a>

              {/* KakaoTalk 1:1 Consultation Button */}
              <a
                href={config.kakaoLink || "http://pf.kakao.com/_YxhcwX/chat"}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-3 p-3.5 sm:p-4 bg-gradient-to-r from-[#ffe812] via-[#fde047] to-[#eab308] hover:from-[#fde047] hover:to-[#ca8a04] text-[#191919] rounded-2xl shadow-[0_10px_25px_rgba(234,179,8,0.4)] border border-yellow-200/70 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#191919]">
                    <path d="M12 3c-5.523 0-10 3.582-10 8c0 2.91 1.848 5.485 4.636 6.883l-1.18 4.316c-.1.365.311.666.623.46l5.067-3.342c.28.024.564.043.854.043 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-black tracking-tight text-[#191919]">
                    💬 카카오톡 1:1 상담
                  </div>
                  <div className="text-[11px] font-extrabold text-[#422006]">
                    실시간 1:1 채팅 문의
                  </div>
                </div>
              </a>
            </motion.div>

          </div>
        </div>
      </section>
      )}

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

      <AnimatePresence mode="wait">
        {currentView === "home" ? (
          <motion.div
            key="home-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* ========================================================= */}
            {/* INTERACTIVE ACCORDIONS SECTION */}
            {/* ========================================================= */}
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
              
              {/* Accordion 1: 협회소개 */}
              <div id="accordion-introduction" className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all scroll-mt-24">
                <button
                  onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-white/50 transition-colors focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-2xl border border-blue-100 shadow-inner flex-shrink-0">
                      <Award className="w-6 h-6 text-[#1e3a8a]" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-black text-[#1e3a8a]">협회 소개</h3>
                      <p className="text-[11px] md:text-xs text-slate-500 font-semibold mt-0.5">온가족간병협회 대표 인사말 및 신뢰 장치 안내</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isIntroExpanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isIntroExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-200/50 bg-white/40 pb-6 md:pb-8">
                        <Introduction config={config} showOnly="greeting" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 2: 간병 신청 절차 */}
              <div id="accordion-process" className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all scroll-mt-24">
                <button
                  onClick={() => setIsProcessExpanded(!isProcessExpanded)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-white/50 transition-colors focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 shadow-inner flex-shrink-0">
                      <ClipboardList className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-black text-[#1e3a8a]">간병 신청 절차</h3>
                      <p className="text-[11px] md:text-xs text-slate-500 font-semibold mt-0.5">간편 상담 등록 및 공식 서류 발급 절차 가이드</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isProcessExpanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isProcessExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-200/50 bg-white/40 pb-6 md:pb-8">
                        <Process config={config} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 3: 오시는 길 */}
              <div id="accordion-map" className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all scroll-mt-24">
                <button
                  onClick={() => setIsMapExpanded(!isMapExpanded)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-white/50 transition-colors focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-100 shadow-inner flex-shrink-0">
                      <MapPin className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-black text-[#1e3a8a]">오시는 길</h3>
                      <p className="text-[11px] md:text-xs text-slate-500 font-semibold mt-0.5">상계역 5번 출구 앞 협회 주소 및 실시간 지도</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isMapExpanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isMapExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-200/50 bg-white/40 pb-6 md:pb-8">
                        <Introduction config={config} showOnly="directions" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 4: 알림 및 소식 게시판 */}
              <div id="accordion-notices" className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/80 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all scroll-mt-24">
                <button
                  onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-white/50 transition-colors focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-2xl border border-blue-100 shadow-inner flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-[#1e3a8a]" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-black text-[#1e3a8a]">알림 및 소식 게시판</h3>
                      <p className="text-[11px] md:text-xs text-slate-500 font-semibold mt-0.5">협회 주요 공지사항 및 유용한 요양 정보 안내</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isNoticeExpanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isNoticeExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-200/50 bg-white/40 p-4 md:p-6">
                        <NoticeBoard
                          config={config}
                          notices={notices}
                          isAdmin={isAdminMode}
                          onAddNotice={handleAddNotice}
                          onDeleteNotice={handleDeleteNotice}
                          isAccordionMode={true}
                          onOpenIntro={() => {
                            setIsIntroExpanded(true);
                            setTimeout(() => {
                              const el = document.getElementById("accordion-introduction");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }, 100);
                          }}
                          onGoToCaregivingLog={() => {
                            setCurrentView("log");
                            window.scrollTo(0, 0);
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        ) : currentView === "contract" ? (
          <motion.div
            key="contract-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <CaregiverContract onBack={() => setCurrentView("home")} phone={config.phone} />
          </motion.div>
        ) : (
          <motion.div
            key="log-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <CaregivingLog onBack={() => setCurrentView("home")} phone={config.phone} />
          </motion.div>
        )}
      </AnimatePresence>

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
