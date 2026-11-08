export type ServiceCategory = 
  | 'tu_phap_ho_tich'
  | 'kinh_doanh_attp'
  | 'van_hoa_giao_duc_y_te'
  | 'dan_toc_ton_giao_noi_vu'
  | 'cong_thuong_khac'
  | 'huong_dan_ho_tro';

export type ServiceLevel = 'toan_trinh' | 'mot_phan' | 'truc_tiep';

export interface Ward {
  id: string;
  name: string;
  district: string;
  city: string;
  address: string;
  hotline: string;
  workingHours: string;
  supportOfficer: string;
  description: string;
}

export interface Officer {
  id: string;
  name: string;
  title: string;
  counterId: string;
  wardId: string;
  phone?: string;
  avatarUrl?: string;
  fields: string[];
  primaryDuties: string[];
  concurrentRoles?: string[];
  badgeColor?: string;
}

export interface Counter {
  id: string;
  wardId: string;
  code: string; // e.g. "Ô số 1", "Ô số 2", "Quầy Hướng dẫn"
  name: string;
  officerId: string;
  officerName: string;
  primaryField: string;
  description: string;
  positionNumber: number; // For layout grid order 1, 2, 3, 4, 5, 6...
  colorTheme: string; // Tailwind color e.g. 'emerald', 'sky', 'indigo', 'amber', 'rose'
  isActive: boolean;
}

export interface RequiredDocument {
  id: string;
  name: string;
  note?: string;
  isRequired: boolean;
  isOriginal: boolean;
  isCopyOrCertified: boolean;
  quantity?: number;
  sampleFormName?: string;
}

export interface ProcedureStep {
  stepNumber: number;
  title: string;
  description: string;
  counterNote?: string;
}

export interface PublicService {
  id: string;
  wardId: string;
  code: string; // Mã thủ tục hành chính
  name: string;
  category: ServiceCategory;
  level: ServiceLevel;
  counterId: string; // ID của ô tiếp nhận
  summary: string; // Tóm tắt ngắn gọn dễ hiểu cho người cao tuổi
  processingDuration: string; // Ví dụ: "Trong ngày", "03 ngày làm việc"
  fee: string; // Ví dụ: "Miễn phí", "10.000 VNĐ / bản"
  requiredDocuments: RequiredDocument[];
  steps: ProcedureStep[];
  audioScript: string; // Lời văn bản đọc chậm rãi dễ nghe cho người lớn tuổi
  legalBasis?: string[];
  faq?: { question: string; answer: string }[];
  searchKeywords: string[]; // Từ khóa tìm kiếm bằng giọng nói
  nationalPortalUrl?: string; // Đường dẫn đến dịch vụ tương ứng trên Cổng DVC Quốc gia (dichvucong.gov.vn)
  isPopular?: boolean;
}

export interface AccessibilityConfig {
  textScale: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  voiceSpeed: number; // 0.8, 1.0, 1.2
  autoReadAloud: boolean;
}
