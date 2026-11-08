import { PublicService, Counter, Officer, Ward } from '../types';
import { removeVietnameseTones } from './speech';

export interface AIAnalysisResult {
  service: PublicService | null;
  counter: Counter | null;
  officer: Officer | null;
  spokenResponse: string;
  isConfirmation: boolean; // Người dùng nói "đã rõ", "cảm ơn", "hiểu rồi"
  suggestedQuestions: string[];
}

export const analyzeCitizenSpeech = (
  queryText: string,
  services: PublicService[],
  counters: Counter[],
  officers: Officer[],
  ward: Ward
): AIAnalysisResult => {
  const normQuery = removeVietnameseTones(queryText);

  // 1. Kiểm tra xem người dùng có đang xác nhận đã hiểu/cảm ơn không
  const confirmationKeywords = [
    'da ro', 'da hieu', 'hieu roi', 'cam on', 'cam on chau', 'cam on em', 
    'biet roi', 'duoc roi', 'ok', 'xong roi', 'khong can nua', 'thoi duoc roi'
  ];
  const isConfirmation = confirmationKeywords.some(keyword => normQuery.includes(keyword));

  if (isConfirmation) {
    return {
      service: null,
      counter: null,
      officer: null,
      spokenResponse: `Dạ vâng, cháu rất vui vì đã hỗ trợ được Bác! Kính chúc Bác luôn dồi dào sức khỏe và một ngày thật nhiều niềm vui. Cháu xin phép trở về chế độ chờ Kiosk nhé ạ!`,
      isConfirmation: true,
      suggestedQuestions: []
    };
  }

  // 2. Tìm kiếm thủ tục phù hợp nhất dựa trên từ khóa ngữ nghĩa
  const tokens = normQuery.split(/\s+/).filter(t => t.length > 1);

  let bestMatch: PublicService | null = null;
  let highestScore = 0;

  for (const srv of services) {
    let score = 0;
    const normName = removeVietnameseTones(srv.name);
    const normSummary = removeVietnameseTones(srv.summary);
    const normKeywords = srv.searchKeywords.map(k => removeVietnameseTones(k)).join(' ');
    const code = srv.code.toLowerCase();

    if (normName.includes(normQuery)) score += 35;
    if (normKeywords.includes(normQuery)) score += 30;
    if (normSummary.includes(normQuery)) score += 20;
    if (normQuery.includes(code)) score += 40;

    tokens.forEach(tok => {
      if (normName.includes(tok)) score += 6;
      if (normKeywords.includes(tok)) score += 5;
      if (normSummary.includes(tok)) score += 2;
    });

    // Semantic mappings cho các câu nói tự nhiên thường gặp của bà con
    if ((normQuery.includes('khai sinh') || normQuery.includes('sinh con') || normQuery.includes('chau moi sinh')) && srv.id === 'srv-khai-sinh') score += 50;
    if ((normQuery.includes('ket hon') || normQuery.includes('lay vo') || normQuery.includes('lay chong')) && srv.id === 'srv-ket-hon') score += 50;
    if ((normQuery.includes('khai tu') || normQuery.includes('nguoi mat') || normQuery.includes('mai tang') || normQuery.includes('chung tu')) && srv.id === 'srv-khai-tu') score += 50;
    if ((normQuery.includes('cong chung') || normQuery.includes('sao y') || normQuery.includes('photo cong chung') || normQuery.includes('chung thuc')) && srv.id === 'srv-chung-thuc-ban-sao') score += 45;
    if ((normQuery.includes('chu ky') || normQuery.includes('so yeu ly lich') || normQuery.includes('uy quyen') || normQuery.includes('nhan luong huu')) && srv.id === 'srv-chung-thuc-chu-ky') score += 45;
    if ((normQuery.includes('doc than') || normQuery.includes('tinh trang hon nhan') || normQuery.includes('mua dat') || normQuery.includes('vay von')) && srv.id === 'srv-xac-nhan-hon-nhan') score += 45;
    if ((normQuery.includes('ho kinh doanh') || normQuery.includes('mo quan') || normQuery.includes('tap hoa') || normQuery.includes('buon ban') || normQuery.includes('cua hang')) && srv.id === 'srv-ho-kinh-doanh-moi') score += 45;
    if ((normQuery.includes('an toan thuc pham') || normQuery.includes('attp') || normQuery.includes('ve sinh quan an')) && srv.id === 'srv-an-toan-thuc-pham') score += 45;
    if ((normQuery.includes('80 tuoi') || normQuery.includes('nguoi gia') || normQuery.includes('tro cap xa hoi') || normQuery.includes('nguoi cao tuoi')) && srv.id === 'srv-tro-cap-nguoi-cao-tuoi') score += 50;
    if ((normQuery.includes('khuyet tat') || normQuery.includes('tan tat') || normQuery.includes('da cam')) && srv.id === 'srv-tro-cap-khuyet-tat') score += 45;
    if ((normQuery.includes('hoc phi') || normQuery.includes('mien giam') || normQuery.includes('sinh vien')) && srv.id === 'srv-mien-giam-hoc-phi') score += 45;
    if ((normQuery.includes('thuoc la') || normQuery.includes('ruou') || normQuery.includes('bia')) && srv.id === 'srv-ban-le-thuoc-la-ruou') score += 45;
    if ((normQuery.includes('vneid') || normQuery.includes('dinh danh') || normQuery.includes('online') || normQuery.includes('nop tren mang')) && srv.id === 'srv-ho-tro-vneid-dvc') score += 50;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = srv;
    }
  }

  // 3. Nếu tìm thấy dịch vụ phù hợp
  if (bestMatch && highestScore >= 10) {
    const matchedCounter = counters.find(c => c.id === bestMatch?.counterId) || counters[0];
    const matchedOfficer = officers.find(o => o.counterId === matchedCounter?.id) || 
      officers.find(o => o.name === matchedCounter?.officerName) || null;

    // Trích xuất tên các giấy tờ bắt buộc
    const docNames = bestMatch.requiredDocuments
      .slice(0, 3)
      .map(d => d.name)
      .join(', ');

    const spoken = `Dạ thưa Bác! Với thủ tục ${bestMatch.name}, Bác vui lòng đến ${matchedCounter.code}, Bàn số ${matchedCounter.positionNumber} gặp ${matchedCounter.officerName} nhé ạ. ` +
      `Thời gian giải quyết là ${bestMatch.processingDuration}, lệ phí là ${bestMatch.fee}. ` +
      `Bác chỉ cần mang theo: ${docNames}. Bác kiểm tra thông tin chi tiết trên màn hình nhé! Bác đã nắm rõ chưa ạ?`;

    return {
      service: bestMatch,
      counter: matchedCounter,
      officer: matchedOfficer,
      spokenResponse: spoken,
      isConfirmation: false,
      suggestedQuestions: [
        'Hồ sơ gồm những giấy tờ gì?',
        'Thời gian trả kết quả bao lâu?',
        'Lệ phí làm thủ tục này hết bao nhiêu?',
        'Tôi đã hiểu rõ, cảm ơn cháu!'
      ]
    };
  }

  // 4. Nếu là câu hỏi về vị trí Quầy hướng dẫn hoặc Khu tiện ích
  if (normQuery.includes('so thu tu') || normQuery.includes('viet don') || normQuery.includes('gap ai dau tien') || normQuery.includes('huong dan')) {
    const guideCounter = counters.find(c => c.id === 'counter-guide') || counters[0];
    const guideOfficer = officers.find(o => o.counterId === 'counter-guide') || null;

    return {
      service: null,
      counter: guideCounter,
      officer: guideOfficer,
      spokenResponse: `Dạ thưa Bác! Để lấy số thứ tự hoặc nhờ viết hộ đơn tờ khai, Bác đến ngay Quầy Hướng dẫn ở cửa ra vào gặp đồng chí Phạm Duy Đại nhé ạ. Đồng chí Đại sẽ phát số và chỉ Bác đến đúng ô chuyên môn hoàn toàn miễn phí ạ!`,
      isConfirmation: false,
      suggestedQuestions: [
        'Làm giấy khai sinh cho cháu',
        'Đăng ký kết hôn',
        'Công chứng căn cước công dân',
        'Tôi đã hiểu rõ, cảm ơn cháu!'
      ]
    };
  }

  if (normQuery.includes('photo') || normQuery.includes('sao chup') || normQuery.includes('nuoc uong') || normQuery.includes('kinh lup')) {
    const facilityCounter = counters.find(c => c.id === 'counter-facility') || counters[0];
    const facilityOfficer = officers.find(o => o.counterId === 'counter-facility') || null;

    return {
      service: null,
      counter: facilityCounter,
      officer: facilityOfficer,
      spokenResponse: `Dạ thưa Bác! Phường có bố trí máy photocopy miễn phí và nước uống nóng lạnh phục vụ bà con tại Khu Tiện ích, do đồng chí Mai Thị Thanh Tâm phụ trách. Bác cứ ghé qua photo giấy tờ mà không tốn tiền đâu ạ!`,
      isConfirmation: false,
      suggestedQuestions: [
        'Sao y công chứng căn cước',
        'Làm giấy khai sinh cho cháu',
        'Tôi đã hiểu rõ, cảm ơn cháu!'
      ]
    };
  }

  // 5. Nếu chưa nhận diện được rõ yêu cầu
  return {
    service: null,
    counter: null,
    officer: null,
    spokenResponse: `Dạ thưa Bác! Cháu chưa nghe rõ tên thủ tục Bác cần làm. Bác có thể bấm vào micro nói lại (ví dụ như: "Làm giấy khai sinh", "Đăng ký kết hôn", "Công chứng căn cước", "Trợ cấp 80 tuổi") hoặc chạm vào các gợi ý bên dưới để cháu chỉ dẫn ngay nhé ạ!`,
    isConfirmation: false,
    suggestedQuestions: [
      'Làm giấy khai sinh cho cháu',
      'Đăng ký kết hôn',
      'Công chứng căn cước công dân',
      'Xác nhận tình trạng hôn nhân (độc thân)',
      'Đăng ký kinh doanh quán ăn, cửa hàng',
      'Trợ cấp hàng tháng cho người 80 tuổi'
    ]
  };
};
