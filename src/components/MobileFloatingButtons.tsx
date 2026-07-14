import { motion } from "motion/react";
import { Phone, Edit3, ArrowUp } from "lucide-react";
import { WebsiteConfig } from "../types";

interface MobileFloatingButtonsProps {
  config: WebsiteConfig;
  onScrollToSection: (id: string) => void;
}

export default function MobileFloatingButtons({ config, onScrollToSection }: MobileFloatingButtonsProps) {
  
  const handlePhoneClick = () => {
    if (config.phone) {
      window.location.href = `tel:${config.phone}`;
    } else {
      alert("고객센터 전화번호가 아직 등록되지 않았습니다. 관리자 대시보드에서 전화번호를 먼저 등록해 주세요!");
    }
  };

  const handleKakaoClick = () => {
    if (config.kakaoLink) {
      window.open(config.kakaoLink, "_blank");
    } else {
      alert("카카오톡 상담 채널 링크가 아직 등록되지 않았습니다. 관리자 대시보드에서 카카오톡 상담 채널 링크를 등록해 주세요!");
    }
  };

  return (
    <>
      {/* 3D Action Floating Panel for Mobile/Desktop Right Side */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3.5 items-end">
        
        {/* Kakao Talk Consultation (Hot Pink/Yellow Glow Accent) */}
        <motion.button
          onClick={handleKakaoClick}
          whileHover={{ scale: 1.15, y: -4 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-14 h-14 rounded-full bg-[#FFE812] text-[#3c1e1e] flex items-center justify-center shadow-[0_8px_20px_rgba(253,224,71,0.4),inset_0_3px_5px_rgba(255,255,255,0.7)] border-2 border-yellow-300 relative group cursor-pointer"
          title="카카오톡 실시간 상담"
        >
          {/* Accent Ping Glow */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
          </span>
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-[#3c1e1e]">
            <path d="M12 3c-5.523 0-10 3.582-10 8c0 2.91 1.848 5.485 4.636 6.883l-1.18 4.316c-.1.365.311.666.623.46l5.067-3.342c.28.024.564.043.854.043 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
          </svg>
          <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            실시간 카톡상담
          </span>
        </motion.button>

        {/* Call Consultation (Sky Blue 3D Bubble Accent) */}
        <motion.button
          onClick={handlePhoneClick}
          whileHover={{ scale: 1.15, y: -4 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-sky-400 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(56,189,248,0.4),inset_0_3px_5px_rgba(255,255,255,0.5)] border-2 border-sky-300 relative group cursor-pointer"
          title="전화상담 바로연결"
        >
          <Phone className="w-6 h-6 fill-white" />
          <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            고객센터 전화상담
          </span>
        </motion.button>

        {/* Quick Registration Form Navigation (Deep Navy 3D Bubble) */}
        <motion.button
          onClick={() => onScrollToSection("registration")}
          whileHover={{ scale: 1.15, y: -4 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-950 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(30,41,59,0.35),inset_0_3px_5px_rgba(255,255,255,0.4)] border-2 border-blue-950 relative group cursor-pointer"
          title="간병인 등록신청서 가기"
        >
          <Edit3 className="w-6 h-6" />
          <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            가족간병 등록 신청
          </span>
        </motion.button>

        {/* Scroll To Top button */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shadow-md border border-slate-700 cursor-pointer"
          title="맨 위로"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>

      </div>
    </>
  );
}
