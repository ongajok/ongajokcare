export interface CaregiverRegistration {
  id: string;
  caregiverName: string; // 간병인 성명
  caregiverPhone: string; // 간병인 연락처
  caregiverSsn: string; // 간병인 생년월일
  relationship: string; // 환자와의 관계
  patientName: string; // 환자 성명
  guardianName: string; // 구인자(보호자) 성명
  guardianPhone: string; // 구인자(보호자) 연락처
  insuranceCompany: string; // 가입 보험회사명
  hospitalName: string; // 입원 병원명
  admissionDate: string; // 입원(예정) 날짜
  caregivingFee: string; // 1일(24시간) 또는 1시간 기준 간병비 (원)
  createdAt: string;
}

export interface NoticePost {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface WebsiteConfig {
  representativeName: string; // 대표자명 (석은영)
  address: string; // 협회 주소
  phone: string; // 고객센터 연락처 (공란 시작)
  businessNumber: string; // 사업자등록번호 (공란 시작)
  kakaoLink: string; // 카카오톡 상담 링크 (공란 시작)
  mascotName: string; // 온이
  themeStyle: "3d-soft" | "3d-bold";
  
  // Custom speech bubble texts for Mascot '온이'
  oniIntroText: string;
  oniAboutText: string;
  oniProcessText: string;
  oniFormText: string;
  oniNoticeText: string;
  oniAdminText: string;
}
