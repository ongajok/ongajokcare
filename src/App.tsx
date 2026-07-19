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
  // 3D/4D Interactive Mouse Tilt state
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // range: -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // range: -0.5 to 0.5
    setHeroTilt({ x: x * 10, y: y * -10 }); // Tilt up to 10 degrees
  };
  const handleHeroMouseLeave = () => {
    setHeroTilt({ x: 0, y: 0 });
  };

  // View state: 'home' | 'contract' | 'log' | 'registration'
  const [currentView, setCurrentView] = useState<"home" | "contract" | "log" | "registration">("home");

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
          if (notice.id === "notice-5" || notice.title.includes("등록은 언제")) {
            return {
              ...notice,
              content: "대부분의 보험 📋 약관상 실제 간병이 시작되기 전에 협회에 등록이 완료되어야 정상적인 청구 및 심사가 가능합니다. 퇴원 후에 소급하여 등록하는 것은 심사상 불인정되거나 매우 어려울 수 있으니, 입원 즉시 등록해 주세요!\n\n궁금하신 부분은 언제든 협회 고객센터(010-9520-7839)로 문의해 주시기 바랍니다.\n\n지금 바로 간병인을 등록하시려면 하단의 👉 [가족간병 즉시신청] 버튼을 누르시거나 카카오톡 상담을 이용해 주세요."
            };
          }
          if (
            notice.id === "notice-3" || 
            notice.title.includes("간병과 비용") || 
            notice.title.includes("알선 중개수수료") || 
            notice.title.includes("비용은 어떻게")
          ) {
            return {
              ...notice,
              title: "비용은 어떻게 적용되나요?",
              content: "1일 기준 4,000원의 합리적인 행정 수수료로 소중한 가족의 건강과 행복을 온 마음으로 응원하겠습니다."
            };
          }
          return notice;
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
    } else {
      parsed = parsed.map((reg) => {
        let updated = { ...reg };
        let isModified = false;
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
    }
    return parsed;
  });

  // Admin access state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Accordion Expand/Collapse State (Initially collapsed per user request)
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [isProcessExpanded, setIsProcessExpanded] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

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
      if (hash === "#registration") {
        setCurrentView("registration");
        window.scrollTo(0, 0);
      } else if (hash === "#contract") {
        setCurrentView("contract");
        window.scrollTo(0, 0);
      } else if (hash === "#log") {
        setCurrentView("log");
        window.scrollTo(0, 0);
      } else if (hash === "#home" || hash === "") {
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
      if (["#registration", "#contract", "#log"].includes(window.location.hash.toLowerCase())) {
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
    if (id === "registration") {
      setCurrentView("registration");
      window.scrollTo(0, 0);
      return;
    }
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
          
          {/* Logo Brand with elegant split 2-line text */}
          <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <CompanyLogo size={44} />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors">온가족</span>
              <span className="text-xs md:text-sm lg:text-base font-black tracking-tighter text-[#1e3a8a]">간병협회</span>
            </div>
          </div>

          {/* Desktop Navigation links - split into elegant 2-line layout */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-slate-700">
            <button
              onClick={() => {
                setCurrentView("home");
                setIsIntroExpanded(true);
                setTimeout(() => handleScrollToSection("accordion-introduction"), 100);
              }}
              className="group hover:scale-105 transition-all cursor-pointer flex flex-col items-center leading-tight text-center px-1"
            >
              <span className="text-[10px] lg:text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">협회</span>
              <span className="text-xs lg:text-sm font-black text-slate-800 group-hover:text-[#1e3a8a] transition-colors">소개</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("home");
                setIsProcessExpanded(true);
                setTimeout(() => handleScrollToSection("accordion-process"), 100);
              }}
              className="group hover:scale-105 transition-all cursor-pointer flex flex-col items-center leading-tight text-center px-1"
            >
              <span className="text-[10px] lg:text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">간병</span>
              <span className="text-xs lg:text-sm font-black text-slate-800 group-hover:text-[#1e3a8a] transition-colors">신청절차</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("home");
                setIsMapExpanded(true);
                setTimeout(() => handleScrollToSection("accordion-map"), 100);
              }}
              className="group hover:scale-105 transition-all cursor-pointer flex flex-col items-center leading-tight text-center px-1"
            >
              <span className="text-[10px] lg:text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">오시는</span>
              <span className="text-xs lg:text-sm font-black text-slate-800 group-hover:text-[#1e3a8a] transition-colors">길</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("registration");
                window.scrollTo(0, 0);
              }}
              className="group hover:scale-105 transition-all cursor-pointer flex flex-col items-center leading-tight text-center px-1"
            >
              <span className="text-[10px] lg:text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">가족간병</span>
              <span className="text-xs lg:text-sm font-black text-[#e11d48] group-hover:text-[#be123c] transition-colors">즉시신청</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("home");
                handleScrollToSection("notices");
              }}
              className="group hover:scale-105 transition-all cursor-pointer flex flex-col items-center leading-tight text-center px-1"
            >
              <span className="text-[10px] lg:text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">게시</span>
              <span className="text-xs lg:text-sm font-black text-slate-800 group-hover:text-[#1e3a8a] transition-colors">판</span>
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
              onClick={() => {
                setCurrentView("registration");
                window.scrollTo(0, 0);
              }}
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
      {currentView === "home" && (
        <section className="relative w-full max-w-6xl mx-auto px-4 pt-6 pb-12">
        <div 
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          style={{ perspective: "1000px" }}
          className="relative rounded-3xl overflow-hidden shadow-[0_35px_70px_rgba(0,0,0,0.3),inset_0_2px_10px_rgba(255,255,255,0.15)] min-h-[540px] md:min-h-[580px] flex items-center justify-center border border-white/10 transition-all duration-500 cursor-pointer py-10 md:py-12"
        >
          
          {/* Multi-Layered 3D & 4D Cinematic Parallax Engine */}
          <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
            {/* Layer 1: Ambient Background Layer (Soft film-grain blur 20% intensity, slow cinematic 4D pan + mouse tilt) */}
            <motion.img
              src={HERO_FAMILY_IMAGE}
              alt="Cinematic Background Layer"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.72] contrast-[1.12] blur-[1px] scale-[1.20]"
              animate={{
                scale: [1.20, 1.28, 1.23, 1.30, 1.20],
                x: [-20 + heroTilt.x * 2.0, 20 + heroTilt.x * 2.0, -10 + heroTilt.x * 2.0, 15 + heroTilt.x * 2.0, -20 + heroTilt.x * 2.0],
                y: [12 + heroTilt.y * 2.0, -15 + heroTilt.y * 2.0, 10 + heroTilt.y * 2.0, -12 + heroTilt.y * 2.0, 12 + heroTilt.y * 2.0],
                rotateX: heroTilt.y * 1.2,
                rotateY: heroTilt.x * 1.2,
              }}
              transition={{
                scale: {
                  duration: 24,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                x: {
                  duration: 24,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                y: {
                  duration: 24,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotateX: { type: "spring", stiffness: 90, damping: 15 },
                rotateY: { type: "spring", stiffness: 90, damping: 15 },
              }}
            />

            {/* Layer 2: Real-time 3D depth-separating foreground layer (Super sharp high-definition with ultra-subtle edge blur) */}
            <motion.div
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                clipPath: "circle(58% at 50% 50%)",
              }}
              animate={{
                scale: [1.10, 1.16, 1.12, 1.18, 1.10],
                x: [10 + heroTilt.x * 1.2, -10 + heroTilt.x * 1.2, 12 + heroTilt.x * 1.2, -8 + heroTilt.x * 1.2, 10 + heroTilt.x * 1.2],
                y: [-8 + heroTilt.y * 1.2, 10 + heroTilt.y * 1.2, -10 + heroTilt.y * 1.2, 8 + heroTilt.y * 1.2, -8 + heroTilt.y * 1.2],
                rotateX: heroTilt.y * 0.9,
                rotateY: heroTilt.x * 0.9,
              }}
              transition={{
                scale: {
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                x: {
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                y: {
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotateX: { type: "spring", stiffness: 95, damping: 18 },
                rotateY: { type: "spring", stiffness: 95, damping: 18 },
              }}
            >
              <img
                src={HERO_FAMILY_IMAGE}
                alt="High-Res Focus Layer"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter brightness-[0.84] contrast-[1.10] blur-[0.8px]"
              />
            </motion.div>

            {/* Layer 3: Warm Environmental Glow & Moving Volumetric Light Ray */}
            <motion.div 
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_25%,rgba(251,191,36,0.22),transparent_65%)] pointer-events-none mix-blend-screen"
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/20 z-[2]" />
          <div className="absolute inset-0 bg-amber-900/10 pointer-events-none z-[2]" />

          {/* Slogan and details centered/bottomed on banner */}
          <div className="absolute bottom-6 left-6 right-6 md:left-12 md:right-12 text-center md:text-left z-10 space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <span className="text-[10px] font-black tracking-widest text-amber-300 bg-amber-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/20 uppercase shadow-sm">
                Nationwide Caregiving Association
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
            >
              아픈 가족의 곁, 가장 가까운 곳에서 <br className="hidden md:inline" /> 따뜻한 동행이 시작됩니다
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-slate-100 font-semibold leading-relaxed max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] hidden sm:block"
            >
              가족간병 등록부터 행정 서류 구비까지 온가족간병협회가 보호자님과 늘 함께하겠습니다.
            </motion.p>

            {/* 3 Premium Card Buttons in Grid (Navy, Gold, Ivory 3D Themes) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-2.5 space-y-3 w-full max-w-xl mx-auto md:mx-0"
            >
              {/* Row 1: Full-width Button Card - Shining 3D Bright Gold */}
              <button
                onClick={() => {
                  setCurrentView("registration");
                  window.scrollTo(0, 0);
                }}
                className="w-full text-left p-4 bg-gradient-to-r from-[#fef08a] via-[#facc15] to-[#eab308] text-amber-950 rounded-2xl shadow-[0_12px_28px_rgba(234,179,8,0.4),0_0_15px_rgba(254,240,138,0.25)] border-b-4 border-[#a16207] hover:border-b-2 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer relative overflow-hidden group border-t border-white/45 flex items-center justify-between"
              >
                {/* Shimmer overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                
                <div className="flex items-center gap-3 z-10">
                  <div className="p-2 bg-amber-950/10 rounded-xl">
                    <Edit3 className="w-5 h-5 text-amber-950" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-black tracking-tight text-amber-950">가족간병 즉시신청</h3>
                    <p className="text-[10px] text-amber-900 font-bold">협회 표준 시스템에 가족간병 등록 신청서를 제출합니다.</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-amber-950/10 flex items-center justify-center group-hover:translate-x-1 transition-transform z-10">
                  <span className="text-xs font-black text-amber-950">→</span>
                </div>
              </button>

              {/* Row 2: Left/Right Split Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Left Button Card: Caregiver Contract - Shining 3D Navy */}
                <button
                  onClick={() => setCurrentView("contract")}
                  className="text-left p-4 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] text-white rounded-2xl shadow-[0_12px_24px_rgba(30,58,138,0.35),0_0_15px_rgba(59,130,246,0.25)] border-b-4 border-[#0f172a] hover:border-b-2 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer border-t border-white/20 flex flex-col justify-between h-[90px] relative overflow-hidden group"
                >
                  {/* Shimmer overlay */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                  <div className="flex items-center gap-2 z-10">
                    <div className="p-1.5 bg-white/15 text-white rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black tracking-tight text-white">간병인 알선 및 중개 계약서</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between w-full z-10">
                    <span className="text-[9px] text-blue-100 font-bold">계약서 조항 작성 및 날인</span>
                    <span className="text-xs font-black text-white group-hover:translate-x-1 transition-transform">작성 →</span>
                  </div>
                </button>

                {/* Right Button Card: Caregiving Log - Shining 3D Ivory */}
                <button
                  onClick={() => setCurrentView("log")}
                  className="text-left p-4 bg-gradient-to-r from-[#fafaf6] via-[#f4f2ea] to-[#e8e4d9] text-slate-800 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.08),0_0_15px_rgba(255,255,255,0.8)] border-b-4 border-[#b5af9e] hover:border-b-2 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer border-t border-white flex flex-col justify-between h-[90px] relative overflow-hidden group"
                >
                  {/* Shimmer overlay */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                  <div className="flex items-center gap-2 z-10">
                    <div className="p-1.5 bg-amber-900/10 text-amber-950 rounded-lg">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black tracking-tight text-slate-800">간병일지 작성</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between w-full z-10">
                    <span className="text-[9px] text-slate-500 font-bold">일일 환자 돌봄 현황 기록</span>
                    <span className="text-xs font-black text-[#1e3a8a] group-hover:translate-x-1 transition-transform">기록 →</span>
                  </div>
                </button>
              </div>
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
            {/* INTERACTIVE ACCORDIONS SECTION (협회소개 / 신청절차 / 오시는 길) */}
            {/* ========================================================= */}
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
              
              {/* Accordion 1: 협회소개 */}
              <div id="accordion-introduction" className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all scroll-mt-24">
                <button
                  onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-white/30 transition-colors focus:outline-none cursor-pointer"
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
                      <div className="border-t border-slate-200/50 bg-white/10 pb-6 md:pb-8">
                        <Introduction config={config} showOnly="greeting" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 2: 간병 신청 절차 */}
              <div id="accordion-process" className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all scroll-mt-24">
                <button
                  onClick={() => setIsProcessExpanded(!isProcessExpanded)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-white/30 transition-colors focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 shadow-inner flex-shrink-0">
                      <ClipboardList className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-black text-[#1e3a8a]">간병 신청 절차</h3>
                      <p className="text-[11px] md:text-xs text-slate-500 font-semibold mt-0.5">원클릭 간편등록 및 보험청구를 위한 가이드 라인</p>
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
                      <div className="border-t border-slate-200/50 bg-white/10 pb-6 md:pb-8">
                        <Process config={config} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 3: 오시는 길 */}
              <div id="accordion-map" className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all scroll-mt-24">
                <button
                  onClick={() => setIsMapExpanded(!isMapExpanded)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-white/30 transition-colors focus:outline-none cursor-pointer"
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
                      <div className="border-t border-slate-200/50 bg-white/10 pb-6 md:pb-8">
                        <Introduction config={config} showOnly="directions" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* ========================================================= */}
            {/* NOTICE & NEWS BOARD (알림 및 소식 게시판) */}
            {/* ========================================================= */}
            <NoticeBoard
              config={config}
              notices={notices}
              isAdmin={isAdminMode}
              onAddNotice={handleAddNotice}
              onDeleteNotice={handleDeleteNotice}
              onOpenIntro={() => {
                setIsIntroExpanded(true);
                setTimeout(() => {
                  const el = document.getElementById("accordion-introduction");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              onGoToRegistration={() => {
                setCurrentView("registration");
                window.scrollTo(0, 0);
              }}
              onGoToCaregivingLog={() => {
                setCurrentView("log");
                window.scrollTo(0, 0);
              }}
            />
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
        ) : currentView === "registration" ? (
          <motion.div
            key="registration-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <RegistrationForm
              config={config}
              onRegisterSubmit={handleRegisterSubmit}
              onOpenLegalModal={setLegalModalType}
              onBack={() => {
                setCurrentView("home");
                window.scrollTo(0, 0);
              }}
            />
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
