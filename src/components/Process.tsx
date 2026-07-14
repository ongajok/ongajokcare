import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserCheck, Heart, FileText, Coins, ArrowRight, HelpCircle } from "lucide-react";
import { WebsiteConfig } from "../types";
import MascotOni from "./MascotOni";

interface ProcessProps {
  config: WebsiteConfig;
}

interface StepItem {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  icon: any;
  colorClass: string;
  iconColor: string;
}

export default function Process({ config }: ProcessProps) {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps: StepItem[] = [
    {
      number: 1,
      title: "간병인등록신청",
      subtitle: "원클릭 간편등록",
      description: "회원가입/앱설치 없는 원클릭 간편 등록 가능",
      detail: "회원가입없이, 앱설치없이 원클릭 간편등록",
      icon: UserCheck,
      colorClass: "from-sky-50/70 via-white/80 to-white/70 hover:from-sky-100/60 border-sky-100 shadow-sm",
      iconColor: "text-[#1e3a8a] bg-sky-100/80"
    },
    {
      number: 2,
      title: "가족간병인시작",
      subtitle: "실질적 간병사실 이행",
      description: "지급기준 확인 및 실질적 간병사실 요구 충족",
      detail: "보험사별 가족간병 지급기준 확인, 간호기록지에 간병사실 기록, 위치확인 등 실질적 간병사실 요구",
      icon: Heart,
      colorClass: "from-rose-50/70 via-white/80 to-white/70 hover:from-rose-100/60 border-rose-100 shadow-sm",
      iconColor: "text-[#f43f5e] bg-rose-100/80"
    },
    {
      number: 3,
      title: "간병일지작성 및 서류발급",
      subtitle: "공식 증빙 서류 발급",
      description: "병원·협회·개인 청구 서류 원스톱 완비",
      detail: "병원서류, 협회서류, 개인서류를 체계적으로 준비하여 공신력 있는 공식 행정 증빙을 발급받습니다.",
      icon: FileText,
      colorClass: "from-[#84cc16]/5 via-white/80 to-white/70 hover:from-[#84cc16]/15 border-lime-100 shadow-sm",
      iconColor: "text-lime-700 bg-lime-100/80"
    },
    {
      number: 4,
      title: "간병비보상신청",
      subtitle: "보험사별 보상청구",
      description: "보험사별 청구기준에 맞춘 최종 심사 신청",
      detail: "보험사별 청구기준 확인",
      icon: Coins,
      colorClass: "from-amber-50/70 via-white/80 to-white/70 hover:from-amber-100/60 border-amber-100 shadow-sm",
      iconColor: "text-amber-700 bg-amber-100/80"
    }
  ];

  return (
    <section id="process" className="py-12 px-4 max-w-6xl mx-auto scroll-mt-20">
      
      {/* Title */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="inline-block"
        >
          <span className="text-[11px] font-bold tracking-widest text-[#f43f5e] bg-rose-100 px-3 py-1 rounded-full uppercase shadow-sm">
            SERVICE STEP
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e3a8a] mt-2 tracking-tight whitespace-nowrap">
            간병 신청 절차
          </h2>
        </motion.div>
      </div>

      {/* Mascot On-i instructions */}
      <div className="mb-8 max-w-3xl mx-auto">
        <MascotOni text={config.oniProcessText} pose="wave" />
      </div>

      {/* 3D Grid Layout for Steps (Responsive: 2 columns on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 items-stretch mb-8">
        {steps.map((step, idx) => {
          const IconComponent = step.icon;
          const isSelected = activeStep === idx;

          return (
            <motion.div
              key={step.number}
              onClick={() => setActiveStep(idx)}
              whileHover={{ y: -6, rotateX: 2, rotateY: 2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative cursor-pointer rounded-[20px] md:rounded-[24px] p-3.5 md:p-5 border-2 bg-gradient-to-br ${step.colorClass} ${
                isSelected
                  ? "border-[#1e3a8a] shadow-[0_15px_30px_rgba(30,58,138,0.12),inset_0_2px_4px_rgba(255,255,255,0.8)] translate-y-[-4px]"
                  : "border-white/50 shadow-[5px_5px_15px_rgba(0,0,0,0.03)]"
              } transition-all duration-300 flex flex-col justify-between`}
            >
              {/* Step indicator balloon */}
              <div className="absolute top-2.5 right-2.5 md:top-4 md:right-4 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#1e3a8a] text-white font-black text-[9px] md:text-xs flex items-center justify-center shadow-md select-none">
                0{step.number}
              </div>

              {/* Main content */}
              <div>
                {/* Step Icon (Responsive sizes) */}
                <div className={`w-9 h-9 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 ${step.iconColor} shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.6),0_6px_12px_-3px_rgba(0,0,0,0.08)] border border-white`}>
                  <IconComponent className="w-5 h-5 md:w-7 md:h-7" />
                </div>

                <h4 className="text-[11px] md:text-sm font-black text-[#1e3a8a] mb-0.5 md:mb-1">{step.title}</h4>
                <p className="text-[8px] md:text-[10px] text-slate-400 font-extrabold tracking-wide uppercase mb-1 md:mb-2">{step.subtitle}</p>
                <p className="text-[10px] md:text-xs text-slate-500 font-semibold leading-normal md:leading-relaxed">{step.description}</p>
              </div>

              {/* Detail indicator button at bottom */}
              <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[8px] md:text-[10px] font-bold text-slate-400">자세히 보기</span>
                <motion.div
                  animate={{ x: isSelected ? 4 : 0 }}
                  className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center ${isSelected ? "bg-[#1e3a8a] text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3D Expanded Explanation Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[24px] p-5 md:p-6 shadow-xl relative text-[#1a1a1a]"
        >
          {/* Light-bulb Badge */}
          <div className="absolute top-[-12px] left-6 bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_4px_8px_rgba(245,158,11,0.25)] border border-amber-300 animate-pulse">
            <HelpCircle className="w-3.5 h-3.5" /> 
            <span>실시간 안내 데스크</span>
          </div>

          <div className="flex flex-col gap-4 pt-1">
            <div className="flex items-center gap-2 mb-1 mt-1">
              <span className="text-xs font-black text-white bg-[#1e3a8a] px-2.5 py-0.5 rounded-full shadow-sm">
                STEP 0{activeStep + 1}
              </span>
              <h3 className="text-sm md:text-base font-black text-[#1e3a8a]">{steps[activeStep].title} 세부 지침</h3>
            </div>

            {activeStep === 0 && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 shadow-inner">
                <p className="text-xs md:text-sm font-extrabold text-[#1e3a8a] leading-relaxed flex items-center gap-2">
                  ✨ {steps[activeStep].detail}
                </p>
                <p className="text-[11px] md:text-xs text-slate-500 font-bold mt-2 leading-relaxed">
                  협회는 보호자님들의 번거로움을 덜어드리기 위해 회원가입과 앱 설치 없이 일체의 복잡한 전차를 생략하고 간편 등록 신청을 접수받고 있습니다. 아래 신청서 서식에 맞춰 이름과 가입 보험 정보 등을 기재하여 한 번만 제출해주시면 정식 등록이 완료됩니다.
                </p>
              </div>
            )}

            {activeStep === 1 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 shadow-inner space-y-2">
                <p className="text-xs md:text-sm font-extrabold text-rose-800 leading-relaxed">
                  💡 {steps[activeStep].detail}
                </p>
                <p className="text-[11px] md:text-xs text-slate-500 font-bold leading-relaxed">
                  가족이 직접 병실에 동행하여 수행하는 간병 활동에 대해, 보험사 심사는 실제 근무 이행의 투명성을 집중 검토합니다. 보험사별 가이드라인에 따른 사전 기준 확인은 물론, 담당 주치의 및 원내 간호인력에 간병 개시를 확인 고지하고 간호기록지상 간병 사실 기록 및 입증 체계를 충실하게 지키는 것이 가장 결정적입니다.
                </p>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <p className="text-[11px] md:text-xs text-slate-500 font-bold leading-relaxed mb-1">
                  보험금 정밀 심사에 대비하기 위하여 협회와 병원, 개인이 각각 준비해야 할 서류 일체입니다. 저희 협회는 이 모든 증빙서류를 오류 없이 완벽하게 준비 및 정비할 수 있도록 최상의 원스톱 자동화 서류발급 서비스를 제공합니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 병원 서류 */}
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider mb-2 pb-1 border-b border-blue-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a]" />
                        병원 구비 서류
                      </h4>
                      <ul className="text-[11px] text-slate-700 font-bold space-y-1.5 leading-normal">
                        <li>• 입퇴원확인서</li>
                        <li>• 진단서 <span className="text-rose-500 text-[10px]">(보험사 요청시)</span></li>
                        <li>• 진료확인서 <span className="text-slate-500 text-[10px]">(필요시)</span></li>
                        <li>• 의무기록 또는 간호기록지 <span className="text-rose-500 text-[10px]">(보험사 요청시)</span></li>
                      </ul>
                    </div>
                  </div>

                  {/* 협회 서류 */}
                  <div className="p-4 rounded-2xl bg-lime-50 border border-lime-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-lime-800 uppercase tracking-wider mb-2 pb-1 border-b border-lime-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-600" />
                        협회 공인 서류
                      </h4>
                      <ul className="text-[10px] md:text-[11px] text-slate-700 font-bold space-y-1.5 leading-normal">
                        <li>• 사업자등록증 사본</li>
                        <li>• 가족간병 확인서</li>
                        <li>• 간병서비스 이용확인서</li>
                        <li>• 간병기간 확인서</li>
                        <li>• 간병비 공식 영수증</li>
                        <li>• 간병비 입금확인서 <span className="text-slate-500 text-[10px]">(계좌이체 등)</span></li>
                        <li>• 간병계약서 또는 이용계획서</li>
                        <li>• 간병일지 <span className="text-rose-500 text-[10px]">(보험사 요청시)</span></li>
                      </ul>
                    </div>
                  </div>

                  {/* 개인 서류 */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2 pb-1 border-b border-amber-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        개인 제출 서류
                      </h4>
                      <ul className="text-[11px] text-slate-700 font-bold space-y-1.5 leading-normal">
                        <li>• 보험금 청구서</li>
                        <li>• 개인정보 수집·이용 동의서</li>
                        <li>• 청구인 신분증 사본</li>
                        <li>• 보험금 수령용 통장 사본</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 shadow-inner">
                <p className="text-xs md:text-sm font-extrabold text-amber-800 leading-relaxed flex items-center gap-2">
                  💰 {steps[activeStep].detail}
                </p>
                <p className="text-[11px] md:text-xs text-slate-500 font-bold mt-2 leading-relaxed">
                  가입하신 보험회사의 약관 상 가족간병 인정 규정과 지급 심사 청구 기준을 최종 검토하여 승인이 순조롭게 처리될 수 있도록 밀착 조력합니다. 협회에서 공인 인증하여 발급한 정밀 행정 증빙서류 일체는 실질 근무 이행에 대한 확실한 보증 수단이 됩니다.
                </p>
              </div>
            )}

          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
