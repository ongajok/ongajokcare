import { motion } from "motion/react";
import { MapPin, Phone, Award, ShieldCheck, ExternalLink } from "lucide-react";
import { WebsiteConfig } from "../types";
import MascotOni from "./MascotOni";

interface IntroductionProps {
  config: WebsiteConfig;
  showOnly?: "greeting" | "directions";
}

export default function Introduction({ config, showOnly }: IntroductionProps) {
  // Opening Kakao Map with search query of address
  const handleMapClick = () => {
    const query = encodeURIComponent("상계역");
    window.open(`https://map.kakao.com/?q=${query}`, "_blank");
  };

  if (showOnly === "greeting") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto px-4 py-4">
        {/* Mascot On-i introduction text */}
        <div className="mb-4">
          <MascotOni text={config.oniAboutText} pose="point" />
        </div>

        {/* Left Side: 3D Greeting Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="w-full bg-white/75 backdrop-blur-xl rounded-[24px] p-6 md:p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-[#1a1a1a]"
        >
          {/* Decorative 3D Ambient Ring in Card Header */}
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-extrabold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-inner">
              보호자가 신뢰하는 동반자
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#84cc16] to-[#1e3a8a] shadow-md flex items-center justify-center text-white font-bold text-xs select-none">
              ★
            </div>
          </div>

          {/* Representative's Sincere Greeting */}
          <div className="space-y-4 text-left">
            <h3 className="text-lg md:text-xl font-bold text-[#1e3a8a] leading-snug">
              안녕하세요.<br />
              <span className="text-[#1e3a8a]">온가족간병협회 대표 석은영입니다.</span>
            </h3>
            <p className="text-xs md:text-sm leading-relaxed text-slate-700 font-medium">
              가족이 아플 때 가장 신뢰할 수 있고 든든한 버팀목이 되는 것은 역시 가족입니다. 
              가족의 마음으로 정성을 다하는 간병 활동은 그 가치가 고귀하며 사회적으로 존중받아야 합니다.
            </p>
            <p className="text-xs md:text-sm leading-relaxed text-slate-700 font-medium">
              저희 온가족간병협회는 행정적 절차의 사소한 어려움이나 서류 발급 오류 등으로 인해 
              보호자님들의 소중한 희생과 노력이 온전한 평가를 받지 못하는 일이 없도록, 
              가장 공식적이고 투명한 행정 중개 서비스를 원칙으로 삼고 있습니다. 
              단 한 번의 등록으로 꼼꼼한 관리 시스템을 제공받으실 수 있도록 온가족이 성심껏 함께하겠습니다.
            </p>
          </div>

          {/* Representative Signature Area */}
          <div className="mt-8 pt-6 border-t border-slate-200/50 flex justify-end items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">
                association representative
              </p>
              <div className="mt-1">
                <span className="text-xs font-extrabold text-slate-500 block leading-none mb-1">
                  온가족간병협회대표
                </span>
                <span className="text-base font-black text-[#1e3a8a] tracking-wide">
                  석 은 영
                </span>
              </div>
            </div>
            {/* Stamp-like design with real seal image */}
            <div className="relative w-14 h-14 flex items-center justify-center select-none shrink-0">
              <img
                src="https://i.postimg.cc/fRmr17nH/ongajogganbyeonghyeobhoeuiin.png"
                alt="온가족간병협회 대표 직인"
                className="w-14 h-14 object-contain rotate-6 hover:rotate-12 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showOnly === "directions") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto px-4 py-4 text-[#1a1a1a]">
        {/* 3D Map Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="bg-white/75 backdrop-blur-xl rounded-[24px] p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 text-[#1a1a1a] text-left flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="text-[#1e3a8a] w-5 h-5" />
              <h4 className="text-sm font-bold text-[#1e3a8a]">협회 사무소 오시는 길</h4>
            </div>

            {/* Real Interactive Map Box with Google Map and Kakao Map synchronization */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner group mb-4">
              <iframe
                title="온가족간병협회 실시간 지도"
                src={`https://maps.google.com/maps?q=${encodeURIComponent("상계역")}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                className="border-0 w-full h-full grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
              
              {/* Floating Action Bar for Synchronized Kakao Map */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-black/0 p-3 flex justify-between items-center opacity-90 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] md:text-xs text-white font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  🗺️ 4호선 상계역 5번 출구 주변 (2층)
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMapClick}
                  className="bg-[#fee500] text-[#191919] hover:bg-[#ffeb3b] px-3 py-1.5 rounded-xl text-[10px] font-black shadow-md border border-[#fee500] flex items-center gap-1 cursor-pointer transition-all duration-300 shrink-0"
                >
                  <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                  <span>실시간 카카오맵 연결 ↗</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Address & Metro Station Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-1.5 text-slate-700 font-semibold leading-relaxed">
              <span className="text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-black flex-shrink-0 mt-0.5">지번 주소</span>
              <span>{config.address}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1a1a1a] font-bold flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-[10px] font-black">4</div>
              <span>상계역 5번 출구에서 100m 이내 (상계벽산종합상가 제2층)</span>
            </div>
          </div>
        </motion.div>

        {/* 3D Nationwide Service Scope (Stacked Vertically) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="bg-gradient-to-br from-[#1e3a8a] to-[#001c40] rounded-[24px] p-6 text-white border border-white/10 shadow-2xl flex flex-col justify-center gap-5 relative overflow-hidden text-left"
        >
          {/* 3D sphere background elements */}
          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-blue-700/20 filter blur-xl" />
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-emerald-400/10 filter blur-md" />

          {/* Stacked Row 1: 전국 서비스망 */}
          <div className="flex items-start gap-3.5 pb-4 border-b border-blue-800/40 relative z-10">
            <div className="p-2.5 rounded-2xl bg-white/10 shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.1)] border border-white/10 text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-[11px] font-black tracking-widest text-[#84cc16] uppercase">
                Service Scope
              </h5>
              <h4 className="text-base font-black tracking-tight mt-0.5">
                전국 서비스망
              </h4>
              <p className="text-xs text-blue-200 font-medium mt-1 leading-relaxed">
                협회 사무실은 서울 노원에 있으나, 행정 전산망을 통해 <span className="text-[#84cc16] font-bold">대한민국 전 지역 환자 및 가족간병인을 위한 서비스</span>를 누수 없이 제공합니다.
              </p>
            </div>
          </div>

          {/* Stacked Row 2: 공식 등록 기관 */}
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="p-2.5 rounded-2xl bg-white/10 shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.1)] border border-white/10 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-[11px] font-black tracking-widest text-[#84cc16] uppercase">
                Association Status
              </h5>
              <h4 className="text-base font-black tracking-tight mt-0.5">
                공식 등록 기관
              </h4>
              <p className="text-xs text-blue-200 font-medium mt-1 leading-relaxed">
                온가족간병협회는 정식 구인·구직 등록 및 중개 절차를 철저히 이행하며, 보험사에서 검토하는 기준에 부합하는 서류발급 체계를 완비하고 있습니다.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Original fallback layout
  return (
    <section id="introduction" className="py-12 px-4 max-w-6xl mx-auto scroll-mt-20">
      {/* Section Title with 3D Float effect */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="inline-block"
        >
          <span className="text-[11px] font-bold tracking-widest text-[#f43f5e] bg-rose-100 px-3 py-1 rounded-full uppercase shadow-sm">
            ABOUT ASSOCIATION
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e3a8a] mt-2 tracking-tight whitespace-nowrap">
            협회 소개
          </h2>
        </motion.div>
      </div>

      {/* Mascot On-i introduction text */}
      <div className="mb-8 max-w-3xl mx-auto">
        <MascotOni text={config.oniAboutText} pose="point" />
      </div>

      {/* Main 3D Styled Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: 3D Greeting Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="lg:col-span-7 bg-white/70 backdrop-blur-xl rounded-[24px] p-6 md:p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between text-[#1a1a1a]"
        >
          {/* Decorative 3D Ambient Ring in Card Header */}
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-extrabold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-inner">
              보호자가 신뢰하는 동반자
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#84cc16] to-[#1e3a8a] shadow-md flex items-center justify-center text-white font-bold text-xs select-none">
              ★
            </div>
          </div>

          {/* Representative's Sincere Greeting */}
          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold text-[#1e3a8a] leading-snug">
              안녕하세요.<br />
              <span className="text-[#1e3a8a]">온가족간병협회 대표 석은영입니다.</span>
            </h3>
            <p className="text-xs md:text-sm leading-relaxed text-slate-700 font-medium">
              가족이 아플 때 가장 신뢰할 수 있고 든든한 버팀목이 되는 것은 역시 가족입니다. 
              가족의 마음으로 정성을 다하는 간병 활동은 그 가치가 고귀하며 사회적으로 존중받아야 합니다.
            </p>
            <p className="text-xs md:text-sm leading-relaxed text-slate-700 font-medium">
              저희 온가족간병협회는 행정적 절차의 사소한 어려움이나 서류 발급 오류 등으로 인해 
              보호자님들의 소중한 희생과 노력이 온전한 평가를 받지 못하는 일이 없도록, 
              가장 공식적이고 투명한 행정 중개 서비스를 원칙으로 삼고 있습니다. 
              단 한 번의 등록으로 꼼꼼한 관리 시스템을 제공받으실 수 있도록 온가족이 성심껏 함께하겠습니다.
            </p>
          </div>

          {/* Representative Signature Area */}
          <div className="mt-8 pt-6 border-t border-slate-200/50 flex justify-end items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">
                association representative
              </p>
              <div className="mt-1">
                <span className="text-xs font-extrabold text-slate-500 block leading-none mb-1">
                  온가족간병협회대표
                </span>
                <span className="text-base font-black text-[#1e3a8a] tracking-wide">
                  석 은 영
                </span>
              </div>
            </div>
            {/* Stamp-like design with real seal image */}
            <div className="relative w-14 h-14 flex items-center justify-center select-none shrink-0">
              <img
                src="https://i.postimg.cc/fRmr17nH/ongajogganbyeonghyeobhoeuiin.png"
                alt="온가족간병협회 대표 직인"
                className="w-14 h-14 object-contain rotate-6 hover:rotate-12 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>

        {/* Right Side: 3D Map & Service Scope */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* 3D Map Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, delay: 0.2 }}
            className="bg-white/70 backdrop-blur-xl rounded-[24px] p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 text-[#1a1a1a]"
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="text-[#1e3a8a] w-5 h-5" />
              <h4 className="text-sm font-bold text-[#1e3a8a]">협회 사무소 오시는 길</h4>
            </div>

            {/* Real Interactive Map Box with Google Map and Kakao Map synchronization */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner group">
              <iframe
                title="온가족간병협회 실시간 지도"
                src={`https://maps.google.com/maps?q=${encodeURIComponent("상계역")}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                className="border-0 w-full h-full grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
              
              {/* Floating Action Bar for Synchronized Kakao Map */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-black/0 p-3 flex justify-between items-center opacity-90 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] md:text-xs text-white font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  🗺️ 4호선 상계역 5번 출구 주변 (2층)
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMapClick}
                  className="bg-[#fee500] text-[#191919] hover:bg-[#ffeb3b] px-3 py-1.5 rounded-xl text-[10px] font-black shadow-md border border-[#fee500] flex items-center gap-1 cursor-pointer transition-all duration-300 shrink-0"
                >
                  <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                  <span>실시간 카카오맵 연결 ↗</span>
                </motion.button>
              </div>
            </div>

            {/* Address & Metro Station Details */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-start gap-1.5 text-slate-700 font-semibold leading-relaxed">
                <span className="text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-black flex-shrink-0 mt-0.5">지번 주소</span>
                <span>{config.address}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#1a1a1a] font-bold flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-[10px] font-black">4</div>
                <span>상계역 5번 출구에서 100m 이내 (상계벽산종합상가 제2층)</span>
              </div>
            </div>
          </motion.div>

          {/* 3D Nationwide Service Scope (Stacked Vertically) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, delay: 0.3 }}
            className="bg-gradient-to-br from-[#1e3a8a] to-[#001c40] rounded-[24px] p-6 text-white border border-white/10 shadow-2xl flex flex-col justify-center"
          >
            {/* 3D sphere background elements */}
            <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-blue-700/20 filter blur-xl" />
            <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-emerald-400/10 filter blur-md" />

            {/* Stacked Row 1: 전국 서비스망 */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-blue-800/40 relative z-10">
              <div className="p-2.5 rounded-2xl bg-white/10 shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.1)] border border-white/10 text-white">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-[11px] font-black tracking-widest text-[#84cc16] uppercase">
                  Service Scope
                </h5>
                <h4 className="text-base font-black tracking-tight mt-0.5">
                  전국 서비스망
                </h4>
                <p className="text-xs text-blue-200 font-medium mt-1">
                  협회 사무실은 서울 노원에 있으나, 행정 전산망을 통해 <span className="text-[#84cc16] font-bold">대한민국 전 지역 환자 및 가족간병인을 위한 서비스</span>를 누수 없이 제공합니다.
                </p>
              </div>
            </div>

            {/* Stacked Row 2: 공식 등록 기관 */}
            <div className="flex items-start gap-3.5 pt-4 relative z-10">
              <div className="p-2.5 rounded-2xl bg-white/10 shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.1)] border border-white/10 text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-[11px] font-black tracking-widest text-[#84cc16] uppercase">
                  Association Status
                </h5>
                <h4 className="text-base font-black tracking-tight mt-0.5">
                  공식 등록 기관
                </h4>
                <p className="text-xs text-blue-200 font-medium mt-1">
                  온가족간병협회는 정식 구인·구직 등록 및 중개 절차를 철저히 이행하며, 보험사에서 검토하는 기준에 부합하는 서류발급 체계를 완비하고 있습니다.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
