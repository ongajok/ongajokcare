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
      {/* Sleek Floating Action Panel for Mobile & Desktop Right Side */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col gap-2.5 sm:gap-3 items-end pointer-events-auto">
        
        {/* Kakao Talk Consultation */}
        <motion.button
          onClick={handleKakaoClick}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#FFE812] text-[#191919] flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.18)] border-2 border-yellow-300/80 relative group cursor-pointer"
          title="카카오톡 실시간 1:1 상담"
        >
          {/* Accent Ping Notification */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
          </span>
          <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-[#191919]">
            <path d="M12 3c-5.523 0-10 3.582-10 8c0 2.91 1.848 5.485 4.636 6.883l-1.18 4.316c-.1.365.311.666.623.46l5.067-3.342c.28.024.564.043.854.043 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
          </svg>
          <span className="absolute right-14 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:inline-block">
            실시간 카톡상담
          </span>
        </motion.button>

        {/* Call Consultation */}
        <motion.button
          onClick={handlePhoneClick}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(2,132,199,0.35)] border-2 border-sky-300/80 relative group cursor-pointer"
          title="전화상담 바로연결"
        >
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
          <span className="absolute right-14 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:inline-block">
            010-9520-7839 전화상담
          </span>
        </motion.button>

        {/* Scroll To Top button */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 flex items-center justify-center shadow-md border border-slate-700/80 cursor-pointer"
          title="맨 위로 이동"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>

      </div>
    </>
  );
}
