import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, FileText, Scale, Landmark } from "lucide-react";

export type LegalModalType = "terms" | "privacy" | "community" | null;

interface LegalModalsProps {
  isOpen: boolean;
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  const getTitle = () => {
    switch (type) {
      case "terms":
        return "서비스 이용약관";
      case "privacy":
        return "개인정보 처리방침";
      case "community":
        return "커뮤니티 및 게시판 이용규칙";
      default:
        return "약관 고지";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "terms":
        return <Scale className="w-6 h-6 text-indigo-500" />;
      case "privacy":
        return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
      case "community":
        return <FileText className="w-6 h-6 text-amber-500" />;
      default:
        return <Landmark className="w-6 h-6 text-slate-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-3xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100">
                {getIcon()}
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1e3a8a] tracking-tight">{getTitle()}</h3>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                  ONGAJOK CAREGIVING ASSOCIATION • LEGAL POLICY
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content with rich legal formatting */}
          <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700 leading-relaxed space-y-6 font-semibold select-text">
            {type === "terms" && <TermsOfService />}
            {type === "privacy" && <PrivacyPolicy />}
            {type === "community" && <CommunityRules />}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="text-[10px] text-slate-400 font-bold">
              온가족간병협회 | 사업자번호: 403-99-01901
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-xs font-extrabold hover:bg-blue-800 transition-all shadow-md shadow-blue-900/10"
            >
              확인 및 닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* --- 1. 서비스 이용약관 (Terms of Service) --- */
const TermsOfService: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
        <p className="text-[#1e3a8a] font-black text-sm">온가족간병협회 서비스 이용약관</p>
        <p className="text-slate-500 text-[10px]">최초 공포 및 적용 시행일: 2026년 7월 16일</p>
        <p className="text-slate-500 text-[10px]">
          직업안정법 제19조(유료직업소개사업)에 따른 정식 신고기관: 제2026-3100300-14-5-00009호
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 1 조 (목적)</h4>
        <p>
          본 약관은 온가족간병협회(이하 &quot;협회&quot;)가 제공하는 가족간병 매칭 중개 서비스, 온라인 공식 서류 구비 대행 서비스 및 관련 부가 행정 지원 서비스(이하 &quot;서비스&quot;)의 이용 조건과 절차, 이용자와 협회 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 2 조 (용어의 정의)</h4>
        <div className="pl-3 border-l-2 border-slate-200 space-y-1.5">
          <p>1. <strong>&quot;이용자&quot;</strong>라 함은 본 약관에 동의하고 협회가 제공하는 서비스를 이용하는 구인자(보호자) 및 구직자(가족간병인)를 의미합니다.</p>
          <p>2. <strong>&quot;구인자(보호자)&quot;</strong>라 함은 환자의 가족 구성원으로서, 보험금 보상 청구 및 가족 간의 유급 간병을 수행하고자 가족간병인을 모집 및 위촉하는 자를 말합니다.</p>
          <p>3. <strong>&quot;구직자(가족간병인)&quot;</strong>라 함은 환자의 직계존비속, 배우자, 형제자매 등 민법상의 가족 범위 내의 인원으로서 환자의 원내 간병 의무를 성실히 수행하고 급여를 수령하고자 하는 자를 말합니다.</p>
          <p>4. <strong>&quot;중개 수수료&quot;</strong>라 함은 직업안정법 및 관련 고시 범위 내에서 협회가 적법하게 수취하는 알선, 행정 관리 및 서류 발급 지원 비용을 의미합니다.</p>
        </div>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 3 조 (협회의 신고 및 대행 자격 고지)</h4>
        <p>
          협회는 유료직업소개소 및 간병 중개 적법 허가 기관(유료직업소개사업 신고번호: 제2026-3100300-14-5-00009호)으로서, 직업안정법상 정합성을 완벽하게 충족하는 중개 업무를 수행합니다. 협회는 구인자 및 구직자 간의 사적인 거래 방지를 위하여 계약 체결 대행 및 세무·회계상 공신력을 부여하는 거래 중개인 역할을 정직하게 이행합니다.
        </p>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 4 조 (서비스의 제공 및 범위)</h4>
        <div className="pl-3 border-l-2 border-slate-200 space-y-1">
          <p>• 가족간병 매칭 알선 및 중개 계약 체결 지원</p>
          <p>• 가입 보험사에 즉시 제출 가능한 법적·행정상 가족간병 증빙 서류 구비 대행</p>
          <p>• 원활한 보험 심사를 위한 행정 조율 및 이행 증빙 가이드라인 안내</p>
          <p>• 커뮤니티 및 게시판을 통한 정보 제공 및 질문 답변 상담</p>
        </div>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 5 조 (중개수수료 지불 및 반환 불가 고지)</h4>
        <div className="pl-3 border-l-2 border-slate-200 space-y-1.5">
          <p>1. 협회가 제공하는 행정 수수료는 원내 실제 매칭, 공식 자격 심사, 간병 관련 실무 서류 발급 등 전 과정에 수반되는 전문적 행정 비용에 대한 대가입니다.</p>
          <p>2. <strong>중개 및 행정 증빙 계약이 완료된 이후에는 이용자가 가입한 각 보험회사의 실질적인 보험금 지급 여부, 청구 심사 보류 또는 반려 등 외부 기관의 결과 사유와 무관하게 수수료 환불 및 반환이 일체 불가능합니다.</strong></p>
        </div>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 6 조 (이용자의 성실 의무 및 면책 규정)</h4>
        <div className="pl-3 border-l-2 border-slate-200 space-y-1.5">
          <p>1. 이용자는 협회에 제공하는 모든 개인정보(이름, 연락처, 생년월일, 가입 보험사, 입원 병원 및 병실 정보, 가족관계 증빙 등)를 위조나 오기 없이 진실되게 제출할 의무가 있습니다. 허위 정보 제공으로 인한 보험 청구 상의 법적 책임(보험사기 방지 특별법 위반 등)은 모두 이용자 본인에게 귀속됩니다.</p>
          <p>2. 협회는 적법한 중개 및 공신력 있는 서류 발급 행정을 대행할 뿐이며, 원내 간병 행위 중 발생한 사고(낙상, 의료 과실, 환자 방치, 절도, 폭행, 상해 등)에 대하여 어떠한 법적 책임도 부담하지 않으며, 이는 전적으로 간병 계약 당사자 간의 민·형사상 해결 과제로 귀속됩니다.</p>
        </div>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 7 조 (관할 법원)</h4>
        <p>
          본 서비스 이용과 관련하여 발생한 이용자와 협회 간의 분쟁에 대하여 소송이 제기될 경우, 협회의 본사 소재지를 관할하는 법원을 합의 관할 법원으로 합니다.
        </p>
      </div>
    </div>
  );
};

/* --- 2. 개인정보 처리방침 (Privacy Policy) --- */
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
        <p className="text-[#1e3a8a] font-black text-sm">온가족간병협회 개인정보 처리방침</p>
        <p className="text-slate-500 text-[10px]">최초 제정 및 적용 시행일: 2026년 7월 16일</p>
        <p className="text-slate-500 text-[10px]">
          개인정보보호법 제15조 및 제22조에 입각한 정부 공인 표준 개인정보보호 수집 기준 준수
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 1 조 (개인정보의 수집 및 이용 목적)</h4>
        <p>
          협회는 다음의 목적을 위하여 최소한의 개인정보를 수집하고 이용합니다. 수집된 모든 정보는 목적 외의 용도로는 사용되지 않으며, 이용 목적이 변경될 시에는 반드시 사전에 별도의 고지 및 명확한 동의를 구할 예정입니다.
        </p>
        <div className="pl-3 border-l-2 border-slate-200 space-y-1">
          <p>• 가족간병 구인구직 중개 매칭 심사 및 적격 여부 확인</p>
          <p>• 가입 보험사에 제출할 가족간병 관련 행정 서류 구비 대행</p>
          <p>• 카카오톡 알림톡 및 LMS를 통한 본인 확인, 신청서 접수 현황 안내 및 상담 연결</p>
          <p>• 분쟁 발생 시 원활한 의사소통 및 소명자료 증빙 관리</p>
        </div>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 2 조 (수집하는 개인정보의 항목 및 동의 범위)</h4>
        <p>
          협회는 서비스 이용 및 행정 처리를 위해 아래와 같은 필수 및 선택 항목을 엄격한 보안 하에 수집합니다.
        </p>
        <div className="pl-3 border-l-2 border-slate-200 space-y-1.5 text-xs">
          <p>1. <strong>간병인(구직자) 정보 (필수):</strong> 성명, 휴대폰 번호, 생년월일(실질 간병 관계 및 세무 보고용), 환자와의 관계</p>
          <p>2. <strong>환자 정보 (필수):</strong> 성명, 생년월일(보험 이행 입증 및 실제 입원 재원 정보 매칭용), 가입 보험사, 입원 병원명, 입원 예정일(또는 기간), 하루 간병비 단가</p>
          <p>3. <strong>구인자(보호자) 정보 (필수):</strong> 성명, 연락처(휴대폰)</p>
          <p>4. <strong>기타 자동 수집 항목:</strong> 접속 IP주소, 서비스 이용 기록, 브라우저 정보</p>
        </div>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 3 조 (고유식별정보 및 생년월일 처리 근거)</h4>
        <p>
          <strong>생년월일 수집 안내:</strong> 보험금 대리 청구 행정 대행 및 세법 상의 가족 간 구인·구직 원천징수 신고, 실질 이행 여부 증빙 발급을 목적으로 정보주체의 동의하에 생년월일을 수집합니다. 수집된 생년월일은 즉시 단방향 256비트 AES 암호화 데이터베이스에 격리 저장되어 본 협회 직원을 포함한 외부인의 조회가 절대 불가능하게 원천 제어됩니다.
        </p>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 4 조 (개인정보의 보유 및 이용 기간)</h4>
        <div className="pl-3 border-l-2 border-slate-200 space-y-1.5">
          <p>1. 원칙적으로 이용자가 협회 서비스 이용 탈퇴를 요청하거나 목적이 완전히 달성된 경우 개인정보를 지체 없이 영구 파기합니다.</p>
          <p>2. 단, 전자상거래 등에서의 소비자보호에 관한 법률 및 국세기본법 등 관련 세무 법령에 따라 아래 목적 달성을 위한 경우 법정 보존 기간(최장 5년) 동안 개인정보를 엄격히 별도 관리 보존합니다.</p>
          <div className="pl-4 space-y-1 text-slate-500">
            <p>• 계약 또는 청약철회 등에 관한 기록: 5년</p>
            <p>• 대금결제 및 재화 등의 공급에 관한 기록: 5년</p>
            <p>• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</p>
          </div>
        </div>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 5 조 (개인정보의 제3자 제공에 관한 고지)</h4>
        <p>
          협회는 정보주체의 사전 동의 없이는 개인정보를 외부에 유출하거나 제3자에게 일체 제공하지 않습니다. 단, 이용자가 직접 보험청구 행정 대행을 위해 지정을 승인한 보험회사 또는 관계 법령에 의하여 정당한 사법적 요청이 있는 특별한 경우에만 법이 정한 절차에 따라 예외적으로 제공될 수 있습니다.
        </p>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 6 조 (개인정보보호 책임자 연락처)</h4>
        <p>
          • <strong>개인정보 관리 총괄 및 보호책임자:</strong> 석은영 대표<br />
          • <strong>공식 문의 메일:</strong> ongajok1090@gmail.com<br />
          • 이용자는 개인정보 조회, 정정, 삭제 및 파기 요구 권리를 행사할 수 있으며, 상기 관리 부서 연락을 통해 즉각적인 처리를 보장받습니다.
        </p>
      </div>
    </div>
  );
};

/* --- 3. 커뮤니티 이용규칙 (Community Rules) --- */
const CommunityRules: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
        <p className="text-[#1e3a8a] font-black text-sm">온가족간병협회 커뮤니티 및 게시판 이용규칙</p>
        <p className="text-slate-500 text-[10px]">최초 제정 및 적용 시행일: 2026년 7월 16일</p>
        <p className="text-slate-500 text-[10px]">
          정보통신망 이용촉진 및 정보보호 등에 관한 법률 제44조의2(정보의 삭제요청 등) 준수
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 1 조 (목적 및 의의)</h4>
        <p>
          본 규정은 온가족간병협회 공식 홈페이지 내의 소통 공간인 공지사항, 자유질문 게시판, 댓글 커뮤니티 공간을 투명하고 도덕적으로 운영하여, 가족간병을 전개하는 전국의 환자 보호자 간의 건전한 정보 공유망을 구축하고 보호하는 데 그 목적을 둡니다.
        </p>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 2 조 (게시물 및 댓글 등록 기준)</h4>
        <p>
          이용자는 게시판 작성 시, 타인의 명예를 훼손하거나 정보통신망법을 저해하는 비도덕적인 글을 올리지 않을 의무가 있습니다. 다음 각 호에 해당하는 부적절한 게시물 또는 댓글은 작성자에게 별도 사전 통보 없이 협회 관리자의 권한으로 즉시 보이지 않도록 즉각 삭제 또는 차단 처리가 진행됩니다.
        </p>
        <div className="pl-3 border-l-2 border-slate-200 space-y-1.5">
          <p>1. <strong>타인 비방 및 허위사실 유포:</strong> 특정 개인, 타 간병업체, 특정 요양기관, 특정 보험회사 또는 자사 직원에 대하여 객관적 물증 없이 악의적으로 거짓 사실을 유포하여 명예와 업무적 정합성을 저해하는 행위</p>
          <p>2. <strong>불법 및 도배성 광고 스팸:</strong> 불법 사행성 오락, 다단계, 성인 광고, 의료기기 대여 광고, 정체불명의 카카오톡 리딩방 광고 등 본 협회의 본래 설립 취지와 맞지 않는 타 영업성 정보 및 반복 작성 도배물</p>
          <p>3. <strong>음란물 및 폭력성 콘텐츠:</strong> 혐오감을 주거나 정서 안정을 저해하는 음란 사진, 욕설, 공갈 및 위해 가해 위협적 텍스트</p>
          <p>4. <strong>개인정보 무단 노출:</strong> 타인의 실명, 본인 동의 없는 타인의 전화번호나 주소, 비밀번호, 특정 주민등록번호나 생년월일 전체 등을 글 본문에 기재하는 경우 (개인정보보호법 저촉 우려로 자동 격리 대상)</p>
        </div>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 3 조 (저작권 침해 고지)</h4>
        <div className="pl-3 border-l-2 border-slate-200 space-y-1.5">
          <p>1. 이용자가 게시판에 직접 작성한 저작물의 소유권 및 책임은 저작자 본인에게 있으나, 본 서비스 제공 목적 하에 협회는 자사 마케팅용(블로그 게재, 후기 가공 등)으로 재사용할 권한을 무상 취득합니다.</p>
          <p>2. 이용자는 타 웹사이트에서 불법 스크랩한 신문 기사나 출처 없는 전문 의료 지식 칼럼 등 타인의 지식재산권을 침해하는 글을 영리 목적으로 게재하여서는 안 되며, 이로 인해 유발되는 저작권 손해배상 사건의 피해 귀속처는 원작성자로 귀속됩니다.</p>
        </div>

        <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">제 4 조 (서비스 이용 자격 정지 및 영구 차단)</h4>
        <p>
          본 규칙을 고의적 또는 지속적으로 3회 이상 위반하고 게시판 정화를 저해하는 유해 유저에 대해서는 협회 관리자의 직권 심사를 통하여 IP 접근 대역 원천 차단 및 공식 회원 제명 조치가 이뤄질 수 있습니다.
        </p>
      </div>
    </div>
  );
};
