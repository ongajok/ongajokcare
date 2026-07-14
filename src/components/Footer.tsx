import { WebsiteConfig } from "../types";
import { SEO_KEYWORDS, KOREAN_INSURANCE_COMPANIES } from "../data";
import { Shield, BookOpen, UserCheck, HelpCircle } from "lucide-react";
import { CompanyLogo } from "./CompanyLogo";

interface FooterProps {
  config: WebsiteConfig;
  onOpenLegalModal: (type: "terms" | "privacy" | "community") => void;
}

export default function Footer({ config, onOpenLegalModal }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12 px-6 border-t border-slate-900 relative overflow-hidden">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Upper Column: Logo, Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Logo & Slogan Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <CompanyLogo size={36} />
              <span className="text-base font-black tracking-tight text-white">온가족간병협회</span>
            </div>
            
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              전국 가족간병인의 행정 편의와 공식적인 매칭 중개를 지원합니다. 
              온가족의 헌신적인 사랑이 온전한 가치를 가질 수 있도록 늘 든든하고 신속하게 조력하겠습니다.
            </p>
          </div>

          {/* Business Details Column */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <h4 className="text-xs font-black text-white tracking-widest uppercase pb-1.5 border-b border-slate-800">
              ASSOCIATION CORPORATE DETAILS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 font-semibold text-slate-400">
              <p>
                <span className="text-slate-500 mr-2">대표자:</span>
                <span className="text-slate-300 font-extrabold">{config.representativeName} 대표</span>
              </p>
              <p>
                <span className="text-slate-500 mr-2">고객센터:</span>
                <span className={`${config.phone ? "text-emerald-400 font-extrabold" : "text-amber-500 italic font-bold"}`}>
                  {config.phone || "확인 및 변경 즉시 실시간 연결 가능 (공란)"}
                </span>
              </p>
              <p className="sm:col-span-2">
                <span className="text-slate-500 mr-2">협회 주소:</span>
                <span className="text-slate-300">{config.address} (전국 간병 등록 지원 가능)</span>
              </p>
              <p>
                <span className="text-slate-500 mr-2">사업자등록번호:</span>
                <span className={`${config.businessNumber ? "text-slate-300" : "text-amber-500 italic font-bold"}`}>
                  {config.businessNumber || "403-99-01901"}
                </span>
              </p>
              <p className="sm:col-span-2">
                <span className="text-slate-500 mr-2">유료직업소개사업 신고번호:</span>
                <span className="text-emerald-400 font-extrabold">제2026-3100300-14-5-00009호</span>
              </p>
              <p>
                <span className="text-slate-500 mr-2">카카오채널:</span>
                <span className={`${config.kakaoLink ? "text-slate-300 truncate inline-block max-w-[200px]" : "text-amber-500 italic font-bold"}`}>
                  {config.kakaoLink || "실시간 카톡상담 미지정 상태"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Middle Column: Legally Compliant Disclaimers (Extremely important!) */}
        <div className="border-t border-slate-900 pt-8 space-y-4 text-[11px] leading-relaxed text-slate-500 font-medium">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-500" /> 법률 면책 고지 및 이용자 주의사항
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <p>
              <span className="text-slate-400 font-extrabold block mb-1">■ 중개 행정 수수료 반환 불인정 고지</span>
              협회에 지불하시는 행정 수수료는 구인·구직 중개 서비스 이용 및 서류 정밀 발급 관리에 대한 정당한 대가입니다. 가입되어 있으신 보험사의 실제 보험금 지급 여부나 반려, 심사 보류 등 행정 외부 결과와 무관하게 가입 및 서류 발급 계약 성립 완료 후에는 환불 처리가 불가능합니다.
            </p>
            <p>
              <span className="text-slate-400 font-extrabold block mb-1">■ 협회 중개 범위 및 면책 한계 규정</span>
              온가족간병협회는 구인자(환자 보호자)와 구직자(가족간병인) 간의 채용 목적을 가진 알선 및 정식 중개 행정만을 지원합니다. 매칭 완료 후 실제 현장 간병 근무 중 일어나는 과실, 분쟁, 민·형사상 갈등 상황의 직접 해결 의무와 배상 책임은 전부 계약 거래 당사자 간에 귀속됩니다.
            </p>
            <p>
              <span className="text-slate-400 font-extrabold block mb-1">■ 보험회사 실질적 간병 이행 증빙 안내</span>
              가입하신 해당 보험회사에서 가족간병의 실제 이행 여부를 정밀 확인하기 위하여 원내 간호기록지 사본, 병실 재원 보완서류, 원내 재원 입동의 또는 실시간 위치 확인에 관한 증빙과 동의를 추가 요구할 수 있으며, 간병 신청인은 이와 같은 요청에 동의하고 보완할 수 있음을 사전 인지하시기 바랍니다.
            </p>
          </div>
        </div>

        {/* Lower Column: Search Engine Optimization (SEO) & Tags Cloud */}
        <div className="border-t border-slate-900 pt-8 space-y-5">
          {/* Tag cloud header */}
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-black text-slate-400 tracking-wider">
              네이버·구글·Bing 포털 검색 최적화 태그 및 관련 보험사 태그 클라우드
            </h4>
          </div>

          {/* Actual crawlable tags & insurance company name text for supreme SEO visibility */}
          <div className="space-y-3 text-[10px] leading-relaxed text-slate-500 font-medium select-none">
            {/* Keywords */}
            <div className="flex flex-wrap gap-x-2 gap-y-1 pb-2 border-b border-slate-900/40">
              {SEO_KEYWORDS.map((kw) => (
                <span key={kw} className="text-slate-600 hover:text-emerald-500 transition-colors">
                  #{kw}
                </span>
              ))}
            </div>

            {/* Insurance Companies listed for maximum SEO search score */}
            <div>
              <p className="text-[9px] text-slate-600 mb-1 font-bold">
                [검색 노출 타겟 보험사 목록 - 허위·과장 없는 실존 보험 정보 정합성 확보용]
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-slate-600">
                {KOREAN_INSURANCE_COMPANIES.map((ins) => (
                  <span key={ins} className="hover:text-sky-500 transition-colors">
                    {ins}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright and Trademark Statement */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 font-bold">
          <p>© 2026 온가족간병협회. All Rights Reserved. 저작권법 보호 대상이며 무단 도용을 금합니다.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenLegalModal("privacy")}
              className="hover:text-emerald-400 transition-colors cursor-pointer text-slate-500 hover:underline"
            >
              개인정보처리방침
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => onOpenLegalModal("terms")}
              className="hover:text-emerald-400 transition-colors cursor-pointer text-slate-500 hover:underline"
            >
              서비스이용약관
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => onOpenLegalModal("community")}
              className="hover:text-emerald-400 transition-colors cursor-pointer text-slate-500 hover:underline"
            >
              커뮤니티 이용규칙
            </button>
            <span className="text-slate-800">|</span>
            <span>공식등록번호: {config.businessNumber || "403-99-01901"}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
