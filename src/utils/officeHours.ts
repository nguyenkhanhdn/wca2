import { PublicService, RequiredDocument, ServiceLevel } from '../types';

export interface OfficeStatusInfo {
  isOpen: boolean;
  statusLabel: string;
  detailText: string;
  bestVisitTip: string;
}

export function getWardOfficeStatus(now: Date = new Date()): OfficeStatusInfo {
  const day = now.getDay(); // 0 = CN, 1..5 = T2..T6, 6 = T7
  const mins = now.getHours() * 60 + now.getMinutes();

  const morningStart = 7 * 60 + 30;
  const morningEnd = 11 * 60 + 30;
  const afternoonStart = 13 * 60 + 30;
  const afternoonEnd = 17 * 60;

  const isWeekday = day >= 1 && day <= 5;
  const inMorning = isWeekday && mins >= morningStart && mins < morningEnd;
  const inAfternoon = isWeekday && mins >= afternoonStart && mins < afternoonEnd;

  let statusLabel = 'Đang ngoài giờ tiếp nhận';
  let detailText = 'Mở cửa tiếp nhận từ Thứ Hai đến Thứ Sáu (07h30–11h30 và 13h30–17h00).';

  if (inMorning) {
    statusLabel = 'Đang mở cửa tiếp nhận (Ca sáng)';
    detailText = 'Phục vụ liên tục đến 11h30. Bác có thể tranh thủ đến trước 10h45 để kịp giải quyết trong buổi sáng.';
  } else if (inAfternoon) {
    statusLabel = 'Đang mở cửa tiếp nhận (Ca chiều)';
    detailText = 'Phục vụ liên tục đến 17h00. Bác nên đến trước 16h15 để kịp kiểm tra hồ sơ và lấy phiếu hẹn.';
  } else if (isWeekday && mins < morningStart) {
    statusLabel = 'Sắp mở cửa lúc 07h30 sáng nay';
    detailText = 'Quầy Một cửa bắt đầu tiếp nhận lúc 07h30. Buổi sáng sớm thường ít đông nhất.';
  } else if (isWeekday && mins >= morningEnd && mins < afternoonStart) {
    statusLabel = 'Đang giờ nghỉ trưa (11h30–13h30)';
    detailText = 'Bộ phận Một cửa mở lại lúc 13h30 chiều nay. Bác có thể chuẩn bị sẵn hồ sơ ở nhà trước khi đi.';
  } else if (isWeekday && mins >= afternoonEnd) {
    statusLabel = 'Đã hết giờ tiếp nhận hôm nay';
    detailText =
      day === 5
        ? 'Hôm nay Thứ Sáu đã hết giờ làm việc. Bộ phận Một cửa mở lại lúc 07h30 sáng Thứ Hai tuần tới.'
        : 'Bộ phận Một cửa sẽ mở lại lúc 07h30 sáng ngày làm việc tiếp theo.';
  } else {
    statusLabel = 'Cuối tuần — Quầy Một cửa nghỉ làm việc';
    detailText = 'Thứ Bảy và Chủ Nhật nghỉ. Bác có thể chuẩn bị trước hồ sơ hoặc nộp trực tuyến 24/7 trên Cổng DVC Quốc gia.';
  }

  return {
    isOpen: inMorning || inAfternoon,
    statusLabel,
    detailText,
    bestVisitTip: 'Khung giờ vắng người cho người cao tuổi: 07h30–08h30 sáng hoặc 13h30–14h30 chiều (Thứ Ba – Thứ Năm).'
  };
}

export interface LifeScenario {
  id: string;
  title: string;
  subtitle: string;
  serviceIds: string[];
  preVisitTip: string;
}

export const LIFE_SCENARIOS: LifeScenario[] = [
  {
    id: 'newborn',
    title: 'Nhà mới sinh em bé',
    subtitle: 'Khai sinh liên thông BHYT, thường trú & trợ giúp VNeID',
    serviceIds: ['srv-khai-sinh', 'srv-ho-tro-vneid-dvc'],
    preVisitTip: 'Chỉ cần điền 1 lần thủ tục liên thông 3 trong 1 để cháu có cả Giấy khai sinh, Thường trú và Thẻ BHYT.'
  },
  {
    id: 'marriage',
    title: 'Kết hôn & Độc thân',
    subtitle: 'Đăng ký kết hôn, xin giấy xác nhận tình trạng hôn nhân',
    serviceIds: ['srv-ket-hon', 'srv-xac-nhan-hon-nhan'],
    preVisitTip: 'Đăng ký kết hôn cần cả hai vợ chồng có mặt trực tiếp để ký vào Sổ hộ tịch.'
  },
  {
    id: 'bereavement',
    title: 'Gia đình có người qua đời',
    subtitle: 'Đăng ký khai tử, trích lục & chứng thực giấy tờ thừa kế',
    serviceIds: ['srv-khai-tu', 'srv-chung-thuc-ban-sao'],
    preVisitTip: 'Cần mang theo Giấy báo tử bản chính và CCCD của người đi khai tử; trích lục làm nhiều bản luôn 1 lần.'
  },
  {
    id: 'elderly_pension',
    title: 'Người cao tuổi & Hưu trí',
    subtitle: 'Trợ cấp người cao tuổi 70–75 tuổi, chế độ hưu trí xã hội',
    serviceIds: ['srv-tro-cap-nguoi-cao-tuoi', 'srv-huu-tri'],
    preVisitTip: 'Người cao tuổi đi lại khó khăn có thể nhờ con cháu tra cứu trước ở nhà hoặc nhờ Quầy Hướng dẫn viết hộ.'
  },
  {
    id: 'business',
    title: 'Mở hộ kinh doanh & Quán ăn',
    subtitle: 'Đăng ký hộ kinh doanh, An toàn thực phẩm, bán lẻ đặc thù',
    serviceIds: ['srv-ho-kinh-doanh-moi', 'srv-an-toan-thuc-pham', 'srv-ban-le-thuoc-la-ruou'],
    preVisitTip: 'Nếu mở quán ăn hoặc tạp hóa nên chuẩn bị bản photo hợp đồng thuê mặt bằng/sổ đỏ trước khi đi.'
  },
  {
    id: 'notary_social',
    title: 'Công chứng & Trợ cấp xã hội',
    subtitle: 'Chứng thực bản sao, chữ ký, người khuyết tật, miễn giảm học phí',
    serviceIds: ['srv-chung-thuc-ban-sao', 'srv-chung-thuc-chu-ky', 'srv-tro-cap-khuyet-tat', 'srv-mien-giam-hoc-phi'],
    preVisitTip: 'Luôn mang theo bản chính đối chiếu và chưa ký trước vào giấy tờ cần chứng thực chữ ký.'
  }
];

export interface ServiceLevelInfo {
  code: ServiceLevel | string;
  shortLabel: string;
  fullLabel: string;
  homeAdvice: string;
  canOnlineFromHome: boolean;
}

export function getServiceLevelInfo(level?: ServiceLevel | string): ServiceLevelInfo {
  const normalized = (level || '').toLowerCase().trim();
  if (normalized === 'toan_trinh' || normalized === 'toàn trình') {
    return {
      code: 'toan_trinh',
      shortLabel: 'Nộp online 100% ở nhà được',
      fullLabel: 'Dịch vụ công Toàn trình (Có thể nộp 100% tại nhà)',
      homeAdvice: 'Bác hoặc con cháu có tài khoản VNeID mức 2 có thể ngồi tại nhà nộp trực tuyến trên dichvucong.gov.vn mà không bắt buộc phải lên phường trước.',
      canOnlineFromHome: true
    };
  }
  if (normalized === 'mot_phan' || normalized === 'một phần') {
    return {
      code: 'mot_phan',
      shortLabel: 'Khai trước ở nhà, mang bản chính đối chiếu',
      fullLabel: 'Dịch vụ công Một phần (Khai trước online, đối chiếu bản chính)',
      homeAdvice: 'Có thể gửi hồ sơ trước qua mạng để rút ngắn thời gian, sau đó mang bản chính ra quầy đối chiếu và nhận kết quả.',
      canOnlineFromHome: true
    };
  }
  return {
    code: 'truc_tiep',
    shortLabel: 'Cần có mặt trực tiếp tại quầy',
    fullLabel: 'Thực hiện trực tiếp tại Bộ phận Một cửa',
    homeAdvice: 'Thủ tục này cần ký tên trực tiếp hoặc đối chiếu bản chính tại quầy. Bác chuẩn bị sẵn giấy tờ theo checklist ở nhà rồi mang ra đúng ô tiếp nhận.',
    canOnlineFromHome: false
  };
}

export interface ConsolidatedDocItem {
  key: string;
  displayName: string;
  isRequired: boolean;
  isOriginal: boolean;
  isCopyOrCertified: boolean;
  serviceNames: string[];
  notes: string[];
}

function normalizeDocKey(rawName: string): string {
  const lower = rawName.toLowerCase();
  if (
    lower.includes('căn cước công dân') ||
    lower.includes('cccd') ||
    lower.includes('định danh') ||
    lower.includes('giấy tờ tùy thân')
  ) {
    return 'cccd_identity';
  }
  if (lower.includes('ảnh') && (lower.includes('3x4') || lower.includes('4x6'))) {
    return 'portrait_photo';
  }
  return lower
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ0-9]+/g, ' ')
    .trim();
}

export function consolidateDocumentsForServices(services: PublicService[]): ConsolidatedDocItem[] {
  const map = new Map<string, ConsolidatedDocItem>();

  for (const srv of services) {
    for (const doc of srv.requiredDocuments || []) {
      const key = normalizeDocKey(doc.name);
      const existing = map.get(key);
      if (existing) {
        existing.isRequired = existing.isRequired || doc.isRequired;
        existing.isOriginal = existing.isOriginal || doc.isOriginal;
        existing.isCopyOrCertified = existing.isCopyOrCertified || doc.isCopyOrCertified;
        if (!existing.serviceNames.includes(srv.name)) {
          existing.serviceNames.push(srv.name);
        }
        if (doc.note && !existing.notes.includes(doc.note)) {
          existing.notes.push(doc.note);
        }
      } else {
        map.set(key, {
          key,
          displayName:
            key === 'cccd_identity'
              ? 'Căn cước công dân gắn chip (hoặc VNeID mức độ 2 trên điện thoại)'
              : doc.name,
          isRequired: doc.isRequired,
          isOriginal: doc.isOriginal,
          isCopyOrCertified: doc.isCopyOrCertified,
          serviceNames: [srv.name],
          notes: doc.note ? [doc.note] : []
        });
      }
    }
  }

  // Required first, CCCD at top
  return Array.from(map.values()).sort((a, b) => {
    if (a.key === 'cccd_identity') return -1;
    if (b.key === 'cccd_identity') return 1;
    if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
    return 0;
  });
}
