export interface SampleFormField {
  label: string;
  sampleValue: string;
  blankLines?: number;
  citizenMustFill: boolean;
  fillHint?: string;
}

export interface SampleFormSection {
  heading: string;
  fields: SampleFormField[];
}

export interface SampleFormTemplate {
  serviceId: string;
  formCode: string;
  title: string;
  subtitle: string;
  legalNote: string;
  elderlyTip: string;
  spokenTip: string;
  hasBlankPrintableForm: boolean;
  signatureLabel: string;
  sections: SampleFormSection[];
}

export const SAMPLE_FORMS_BY_SERVICE: Record<string, SampleFormTemplate> = {
  'srv-khai-sinh': {
    serviceId: 'srv-khai-sinh',
    formCode: 'Mẫu TK-ĐKKS (Thông tư 04/2020/TT-BTP)',
    title: 'TỜ KHAI ĐĂNG KÝ KHAI SINH',
    subtitle: 'Kính gửi: Ủy ban nhân dân phường Sơn Trà, thành phố Đà Nẵng',
    legalNote: 'Ban hành kèm theo Thông tư số 04/2020/TT-BTP của Bộ Tư pháp',
    elderlyTip:
      'Bác chỉ cần mang theo Giấy chứng sinh của cháu và Căn cước công dân. Quầy Hướng dẫn (Đ/c Phạm Duy Đại) sẽ in sẵn tờ khai và điền giúp Bác, Bác chỉ kiểm tra lại họ tên cháu cho đúng rồi ký tên ở cuối tờ.',
    spokenTip:
      'Thưa Bác, đây là mẫu Tờ khai đăng ký khai sinh. Bác chỉ cần chú ý 3 phần chính: Thông tin của người đi khai sinh ở trên cùng, phần tên và ngày tháng năm sinh của cháu ở giữa, và chữ ký của Bác ở góc dưới bên phải. Quầy Hướng dẫn tại cửa vào sẽ viết hộ miễn phí cho Bác ạ.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Người yêu cầu (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: '1. Thông tin người yêu cầu (Ông/Bà hoặc Cha/Mẹ đi làm khai sinh)',
        fields: [
          {
            label: 'Họ, chữ đệm, tên người yêu cầu',
            sampleValue: 'NGUYỄN VĂN HÙNG',
            citizenMustFill: true,
            fillHint: 'Viết chữ IN HOA có dấu đúng theo thẻ Căn cước công dân'
          },
          {
            label: 'Nơi cư trú',
            sampleValue: 'Tổ 12, phường Sơn Trà, thành phố Đà Nẵng',
            citizenMustFill: true,
            fillHint: 'Ghi địa chỉ thường trú hoặc tạm trú hiện tại'
          },
          {
            label: 'Giấy tờ tùy thân (CCCD / Hộ chiếu)',
            sampleValue: 'CCCD số 0480 6500 1289, cấp ngày 12/08/2021 tại Cục CSQLHC về TTXH',
            citizenMustFill: true,
            fillHint: 'Xuất trình bản chính để cán bộ đối chiếu nhanh'
          },
          {
            label: 'Quan hệ với người được khai sinh',
            sampleValue: 'Ông nội (hoặc Cha / Mẹ / Bà ngoại)',
            citizenMustFill: true,
            fillHint: 'Ông, bà đi khai sinh cho cháu ghi rõ Ông nội / Bà ngoại'
          }
        ]
      },
      {
        heading: '2. Thông tin của người được đăng ký khai sinh (Cháu bé)',
        fields: [
          {
            label: 'Họ, chữ đệm, tên dự kiến đặt cho cháu',
            sampleValue: 'NGUYỄN MINH KHANG',
            citizenMustFill: true,
            fillHint: 'Kiểm tra thật kỹ chính tả tên cháu trước khi cán bộ vào sổ'
          },
          {
            label: 'Ngày, tháng, năm sinh (ghi bằng chữ và số)',
            sampleValue: '15/11/2026 (Ngày mười lăm tháng mười một năm hai nghìn không trăm hai mươi sáu)',
            citizenMustFill: true,
            fillHint: 'Ghi đúng theo Giấy chứng sinh của bệnh viện'
          },
          {
            label: 'Giới tính & Dân tộc & Quốc tịch',
            sampleValue: 'Nam · Dân tộc: Kinh · Quốc tịch: Việt Nam',
            citizenMustFill: true
          },
          {
            label: 'Nơi sinh',
            sampleValue: 'Bệnh viện Phụ sản - Nhi Đà Nẵng, phường Ngũ Hành Sơn, thành phố Đà Nẵng',
            citizenMustFill: false,
            fillHint: 'Cán bộ Ô số 1 hỗ trợ đối chiếu từ Giấy chứng sinh'
          },
          {
            label: 'Họ, chữ đệm, tên Mẹ & Cha của cháu',
            sampleValue: 'Mẹ: Trần Thị Lan (1995) · Cha: Nguyễn Minh Tuấn (1993)',
            citizenMustFill: true,
            fillHint: 'Nếu cha mẹ đã đăng ký kết hôn thì điền đủ cả hai'
          }
        ]
      },
      {
        heading: '3. Phần đề nghị liên thông (Cấp thẻ BHYT & Đăng ký thường trú)',
        fields: [
          {
            label: 'Đề nghị cấp thẻ Bảo hiểm y tế & Đăng ký thường trú cho trẻ dưới 6 tuổi',
            sampleValue: '[X] Đồng ý thực hiện liên thông 3 trong 1 (Khai sinh - Thường trú - BHYT)',
            citizenMustFill: false,
            fillHint: 'Cán bộ sẽ tích chọn giúp Bác để cháu có thẻ BHYT miễn phí ngay'
          }
        ]
      }
    ]
  },

  'srv-ket-hon': {
    serviceId: 'srv-ket-hon',
    formCode: 'Mẫu TK-ĐKKH (Thông tư 04/2020/TT-BTP)',
    title: 'TỜ KHAI ĐĂNG KÝ KẾT HÔN',
    subtitle: 'Kính gửi: Ủy ban nhân dân phường Sơn Trà, thành phố Đà Nẵng',
    legalNote: 'Ban hành kèm theo Thông tư số 04/2020/TT-BTP của Bộ Tư pháp',
    elderlyTip:
      'Hai bên nam và nữ cùng điền chung một tờ khai này hoặc kê khai trực tiếp tại Ô số 1. Cả hai phải có mặt trực tiếp để cùng ký tên trước mặt cán bộ Tư pháp.',
    spokenTip:
      'Thưa Bác và anh chị, mẫu Tờ khai đăng ký kết hôn gồm hai cột song song cho Bên nữ và Bên nam. Anh chị chỉ cần ghi đúng họ tên, ngày sinh, nơi cư trú và số Căn cước công dân của cả hai, sau đó cùng ký vào phần cuối tờ khai trước mặt cán bộ Ô số 1.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Hai bên nam, nữ cùng ký, ghi rõ họ tên',
    sections: [
      {
        heading: '1. Thông tin Bên nữ',
        fields: [
          {
            label: 'Họ, chữ đệm, tên Bên nữ',
            sampleValue: 'LÊ THỊ MAI ANH',
            citizenMustFill: true,
            fillHint: 'Viết chữ IN HOA có dấu đúng theo CCCD'
          },
          {
            label: 'Ngày sinh · Dân tộc · Quốc tịch',
            sampleValue: '20/05/1997 · Kinh · Việt Nam',
            citizenMustFill: true
          },
          {
            label: 'Nơi cư trú & Số CCCD',
            sampleValue: 'Số 24 Nguyễn Phan Vinh, P. Sơn Trà, TP. Đà Nẵng · CCCD: 0481 9700 2231',
            citizenMustFill: true
          },
          {
            label: 'Kết hôn lần thứ mấy',
            sampleValue: 'Lần thứ nhất',
            citizenMustFill: true,
            fillHint: 'Nếu từng kết hôn và đã ly hôn thì ghi rõ lần thứ hai'
          }
        ]
      },
      {
        heading: '2. Thông tin Bên nam',
        fields: [
          {
            label: 'Họ, chữ đệm, tên Bên nam',
            sampleValue: 'TRẦN QUỐC BẢO',
            citizenMustFill: true,
            fillHint: 'Viết chữ IN HOA có dấu đúng theo CCCD'
          },
          {
            label: 'Ngày sinh · Dân tộc · Quốc tịch',
            sampleValue: '10/09/1995 · Kinh · Việt Nam',
            citizenMustFill: true
          },
          {
            label: 'Nơi cư trú & Số CCCD',
            sampleValue: 'Tổ 08, P. Sơn Trà, TP. Đà Nẵng · CCCD: 0480 9500 5412',
            citizenMustFill: true
          },
          {
            label: 'Kết hôn lần thứ mấy',
            sampleValue: 'Lần thứ nhất',
            citizenMustFill: true
          }
        ]
      }
    ]
  },

  'srv-khai-tu': {
    serviceId: 'srv-khai-tu',
    formCode: 'Mẫu TK-ĐKKT (Thông tư 04/2020/TT-BTP)',
    title: 'TỜ KHAI ĐĂNG KÝ KHAI TỬ',
    subtitle: 'Kính gửi: Ủy ban nhân dân phường Sơn Trà, thành phố Đà Nẵng',
    legalNote: 'Ban hành kèm theo Thông tư số 04/2020/TT-BTP của Bộ Tư pháp',
    elderlyTip:
      'Gia đình chỉ cần mang Giấy báo tử và CCCD của người mất đến Ô số 1. Cán bộ Đinh Phú Thịnh sẽ hỗ trợ điền toàn bộ tờ khai và hướng dẫn luôn thủ tục xóa thường trú, hưởng mai táng phí.',
    spokenTip:
      'Thưa Bác, khi đi làm khai tử, gia đình không cần tự viết ở nhà đâu ạ. Cán bộ Ô số 1 sẽ dựa vào Giấy báo tử để lập tờ khai giúp gia đình, người thân chỉ kiểm tra lại giờ mất, ngày mất cho chính xác rồi ký xác nhận.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Người đi khai tử (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: '1. Thông tin người đi khai tử (Người thân trong gia đình)',
        fields: [
          {
            label: 'Họ, chữ đệm, tên người yêu cầu',
            sampleValue: 'PHẠM VĂN MINH',
            citizenMustFill: true
          },
          {
            label: 'Số CCCD & Nơi cư trú',
            sampleValue: 'CCCD: 0480 7800 3310 · Tổ 14, P. Sơn Trà, TP. Đà Nẵng',
            citizenMustFill: true
          },
          {
            label: 'Quan hệ với người đã chết',
            sampleValue: 'Con đẻ (hoặc Vợ / Chồng / Người thân thích)',
            citizenMustFill: true
          }
        ]
      },
      {
        heading: '2. Thông tin người đã qua đời',
        fields: [
          {
            label: 'Họ, chữ đệm, tên người đã chết',
            sampleValue: 'PHẠM VĂN TÁM',
            citizenMustFill: true,
            fillHint: 'Ghi đúng theo Giấy báo tử và CCCD của người mất'
          },
          {
            label: 'Ngày, giờ qua đời',
            sampleValue: 'Đã chết vào lúc 06 giờ 30 phút, ngày 18 tháng 11 năm 2026',
            citizenMustFill: false,
            fillHint: 'Cán bộ điền đối chiếu theo Giấy báo tử'
          },
          {
            label: 'Nơi chết & Nguyên nhân chết',
            sampleValue: 'Tại nhà riêng (hoặc Bệnh viện Đà Nẵng) · Theo Giấy báo tử số 112/GBT',
            citizenMustFill: false
          }
        ]
      }
    ]
  },

  'srv-chung-thuc-ban-sao': {
    serviceId: 'srv-chung-thuc-ban-sao',
    formCode: 'Quy trình không cần viết tờ khai (Nghị định 23/2015/NĐ-CP)',
    title: 'PHIẾU HƯỚNG DẪN CHUẨN BỊ HỒ SƠ CHỨNG THỰC BẢN SAO',
    subtitle: 'Thủ tục chứng thực bản sao từ bản chính tại Ô số 2 (Đ/c Đỗ Tấn Nhật)',
    legalNote: 'Theo Nghị định số 23/2015/NĐ-CP của Chính phủ',
    elderlyTip:
      'Thủ tục sao y công chứng KHÔNG CẦN viết tờ khai hay đơn từ gì cả! Bác chỉ cần đưa bản gốc giấy tờ cho cán bộ Ô số 2. Nếu chưa photo, Khu Tiện ích (Đ/c Tâm) sẽ photo giúp Bác miễn phí.',
    spokenTip:
      'Thưa Bác, khi đi sao y công chứng giấy tờ, Bác hoàn toàn không phải viết đơn hay tờ khai nào hết. Bác chỉ mang bản chính giấy tờ cần công chứng đến Ô số 2 gặp đồng chí Đỗ Tấn Nhật là làm được ngay ạ.',
    hasBlankPrintableForm: false,
    signatureLabel: 'Ghi chú kiểm tra tại quầy',
    sections: [
      {
        heading: 'Cách kiểm tra bản chính trước khi nộp tại Ô số 2',
        fields: [
          {
            label: 'Tình trạng bản chính giấy tờ',
            sampleValue: 'Còn nguyên vẹn, không bị rách nát, tẩy xóa, có đủ dấu đỏ và chữ ký gốc',
            citizenMustFill: false,
            fillHint: 'Cán bộ đối chiếu trực tiếp từ bản gốc Bác mang theo'
          },
          {
            label: 'Bản photocopy kèm theo',
            sampleValue: 'Photo rõ nét cả 2 mặt (nếu là CCCD/Sổ đỏ), hỗ trợ photo miễn phí tại Khu Tiện ích',
            citizenMustFill: false,
            fillHint: 'Bác có thể nhờ Đ/c Mai Thị Thanh Tâm photo miễn phí ngay tại sảnh'
          }
        ]
      }
    ]
  },

  'srv-chung-thuc-chu-ky': {
    serviceId: 'srv-chung-thuc-chu-ky',
    formCode: 'Mẫu hướng dẫn chứng thực chữ ký (Nghị định 23/2015/NĐ-CP)',
    title: 'MẪU MINH HỌA VỊ TRÍ KÝ TÊN KHI CHỨNG THỰC CHỮ KÝ',
    subtitle: 'Áp dụng cho Sơ yếu lý lịch, Giấy ủy quyền nhận lương hưu, Giấy cam kết',
    legalNote: 'Theo Nghị định số 23/2015/NĐ-CP của Chính phủ',
    elderlyTip:
      'LƯU Ý QUAN TRỌNG NHẤT: Bác điền thông tin ở trên bình thường, nhưng CHỖ KÝ TÊN Ở CUỐI GIẤY TUYỆT ĐỐI KHÔNG KÝ SẴN Ở NHÀ! Bác phải để trống để ký trực tiếp trước mặt cán bộ Ô số 2 (Đ/c Đỗ Tấn Nhật).',
    spokenTip:
      'Thưa Bác, khi đi chứng thực chữ ký trong sơ yếu lý lịch hoặc giấy ủy quyền nhận lương hưu, Bác nhớ kỹ một điều quan trọng: tuyệt đối không ký tên trước ở nhà. Bác mang văn bản và Căn cước công dân đến Ô số 2 rồi ký trực tiếp trước mặt cán bộ thì dấu chứng thực mới hợp lệ ạ.',
    hasBlankPrintableForm: true,
    signatureLabel: 'ĐỂ TRỐNG CHỖ NÀY — Ký trực tiếp trước mặt cán bộ Ô số 2',
    sections: [
      {
        heading: '1. Thông tin người ký / người ủy quyền (Điền sẵn hoặc nhờ viết hộ)',
        fields: [
          {
            label: 'Họ và tên người đề nghị chứng thực chữ ký',
            sampleValue: 'TRẦN THỊ HÒA',
            citizenMustFill: true,
            fillHint: 'Ghi đúng họ tên trên Căn cước công dân'
          },
          {
            label: 'Số CCCD & Địa chỉ thường trú',
            sampleValue: 'CCCD: 0481 5200 0918 · Tổ 05, phường Sơn Trà, thành phố Đà Nẵng',
            citizenMustFill: true
          },
          {
            label: 'Nội dung văn bản (Ví dụ: Ủy quyền nhận lương hưu / Sơ yếu lý lịch)',
            sampleValue: 'Tôi ủy quyền cho con gái là Nguyễn Thị Thu Hà nhận thay tiền lương hưu hàng tháng...',
            citizenMustFill: true,
            fillHint: 'Ghi rõ nội dung ủy quyền hoặc cam kết, KHÔNG ký ở dưới'
          }
        ]
      },
      {
        heading: '2. Khu vực chữ ký (BẮT BUỘC ĐỂ TRỐNG ĐẾN QUẦY MỚI KÝ)',
        fields: [
          {
            label: 'Chữ ký của người yêu cầu chứng thực',
            sampleValue: '[ĐỂ TRỐNG TẠI NHÀ] -> Ký trực tiếp trước mặt Đ/c Đỗ Tấn Nhật tại Ô số 2',
            citizenMustFill: true,
            fillHint: 'Nếu đã lỡ ký sẵn ở nhà, Bác phải viết lại tờ khác mới được đóng dấu'
          }
        ]
      }
    ]
  },

  'srv-xac-nhan-hon-nhan': {
    serviceId: 'srv-xac-nhan-hon-nhan',
    formCode: 'Mẫu TK-XNTTHN (Thông tư 04/2020/TT-BTP)',
    title: 'TỜ KHAI CẤP GIẤY XÁC NHẬN TÌNH TRẠNG HÔN NHÂN',
    subtitle: 'Kính gửi: Ủy ban nhân dân phường Sơn Trà, thành phố Đà Nẵng',
    legalNote: 'Ban hành kèm theo Thông tư số 04/2020/TT-BTP của Bộ Tư pháp',
    elderlyTip:
      'Mục quan trọng nhất trong tờ khai này là "Mục đích sử dụng" (ví dụ: để chuyển nhượng nhà đất, vay vốn ngân hàng hoặc để đăng ký kết hôn). Quầy Hướng dẫn sẽ điền giúp Bác đúng theo mẫu quy định.',
    spokenTip:
      'Thưa Bác, trong tờ khai xin xác nhận tình trạng hôn nhân, Bác chỉ cần nói rõ cho cán bộ biết mình dùng giấy này vào việc gì, như để bán đất, vay ngân hàng hay kết hôn. Cán bộ sẽ ghi đúng câu chữ quy định giúp Bác.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Người yêu cầu (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: '1. Thông tin người đề nghị xác nhận tình trạng hôn nhân',
        fields: [
          {
            label: 'Họ, chữ đệm, tên',
            sampleValue: 'ĐẶNG VĂN SƠN',
            citizenMustFill: true
          },
          {
            label: 'Ngày, tháng, năm sinh & Số CCCD',
            sampleValue: '12/04/1968 · CCCD: 0480 6800 4415',
            citizenMustFill: true
          },
          {
            label: 'Nơi cư trú hiện tại',
            sampleValue: 'Số 18 Hoàng Sa, phường Sơn Trà, thành phố Đà Nẵng',
            citizenMustFill: true
          }
        ]
      },
      {
        heading: '2. Thông tin tình trạng hôn nhân & Mục đích sử dụng',
        fields: [
          {
            label: 'Tình trạng hôn nhân trong thời gian cư trú tại phường',
            sampleValue: 'Chưa kết hôn lần nào (hoặc Đã ly hôn theo Bản án số... / Vợ đã mất theo Trích lục khai tử...)',
            citizenMustFill: true,
            fillHint: 'Ghi trung thực quá trình hôn nhân; nếu từng ly hôn/vợ chồng mất cần nộp kèm bản án hoặc giấy khai tử'
          },
          {
            label: 'Mục đích sử dụng Giấy xác nhận',
            sampleValue: 'Làm thủ tục chuyển nhượng quyền sử dụng đất (hoặc Vay vốn ngân hàng / Đăng ký kết hôn)',
            citizenMustFill: true,
            fillHint: 'Mục này bắt buộc ghi rõ đúng việc Bác sắp làm'
          }
        ]
      }
    ]
  },

  'srv-ton-giao-sinh-hoat': {
    serviceId: 'srv-ton-giao-sinh-hoat',
    formCode: 'Mẫu B1 / B5 (Nghị định 95/2023/NĐ-CP)',
    title: 'VĂN BẢN ĐĂNG KÝ SINH HOẠT TÔN GIÁO TẬP TRUNG',
    subtitle: 'Kính gửi: Ủy ban nhân dân phường Sơn Trà, thành phố Đà Nẵng',
    legalNote: 'Theo Luật Tín ngưỡng, tôn giáo và Nghị định 95/2023/NĐ-CP',
    elderlyTip:
      'Người đại diện nhóm sinh hoạt mang văn bản và giấy tờ địa điểm đến Ô số 3 gặp Đ/c Trần Đặng Bích Thuận để được hướng dẫn chi tiết.',
    spokenTip:
      'Thưa Bác, đây là mẫu đăng ký sinh hoạt tôn giáo tập trung. Người đại diện ghi rõ tên tôn giáo, địa điểm sinh hoạt, thời gian tổ chức và số lượng người tham gia dự kiến rồi nộp tại Ô số 3.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Người đại diện nhóm sinh hoạt (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: 'Thông tin đăng ký sinh hoạt / thông báo lễ hội',
        fields: [
          {
            label: 'Tên gọi tổ chức / điểm nhóm & Tôn giáo',
            sampleValue: 'Điểm sinh hoạt tôn giáo tập trung Sơn Trà',
            citizenMustFill: true
          },
          {
            label: 'Họ tên người đại diện & Số CCCD',
            sampleValue: 'Nguyễn Văn Tâm · CCCD: 0480 6200 7781',
            citizenMustFill: true
          },
          {
            label: 'Địa điểm hợp pháp & Thời gian sinh hoạt dự kiến',
            sampleValue: 'Số 45 đường Ngô Quyền, phường Sơn Trà · Sáng Chủ Nhật hàng tuần (08h00 - 10h00)',
            citizenMustFill: true
          }
        ]
      }
    ]
  },

  'srv-ho-kinh-doanh-moi': {
    serviceId: 'srv-ho-kinh-doanh-moi',
    formCode: 'Mẫu Phụ lục III-1 (Thông tư 02/2023/TT-BKHĐT)',
    title: 'GIẤY ĐỀ NGHỊ ĐĂNG KÝ HỘ KINH DOANH',
    subtitle: 'Kính gửi: Cơ quan đăng ký kinh doanh / Bộ phận Một cửa Phường Sơn Trà',
    legalNote: 'Ban hành kèm theo Thông tư số 02/2023/TT-BKHĐT của Bộ Kế hoạch và Đầu tư',
    elderlyTip:
      'Bác không cần nhớ mã ngành kinh doanh phức tạp. Bác chỉ cần nói dự định mở quán gì (ví dụ: bán tạp hóa, quán ăn sáng, tiệm sửa xe), Đ/c Lê Thị Hồng Hạnh tại Ô số 4 sẽ tra mã ngành và nhập máy giúp Bác.',
    spokenTip:
      'Thưa Bác, với mẫu Giấy đề nghị đăng ký hộ kinh doanh, Bác chỉ cần chuẩn bị 4 ý: Tên hộ kinh doanh dự kiến, địa chỉ cửa hàng, số vốn dự kiến và mặt hàng kinh doanh. Đồng chí Lê Thị Hồng Hạnh ở Ô số 4 sẽ điền mã ngành chuẩn giúp Bác.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Chủ hộ kinh doanh (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: '1. Thông tin chủ hộ kinh doanh',
        fields: [
          {
            label: 'Họ và tên chủ hộ · Ngày sinh · Số CCCD',
            sampleValue: 'LÊ VĂN PHƯỚC · 05/03/1972 · CCCD: 0480 7200 6621',
            citizenMustFill: true
          },
          {
            label: 'Số điện thoại liên hệ nhận mã số thuế',
            sampleValue: '0905 123 456',
            citizenMustFill: true,
            fillHint: 'Dùng để nhận tin nhắn thông báo kết quả và mã số thuế hộ kinh doanh'
          }
        ]
      },
      {
        heading: '2. Thông tin hộ kinh doanh dự kiến thành lập',
        fields: [
          {
            label: 'Tên hộ kinh doanh',
            sampleValue: 'HỘ KINH DOANH QUÁN ĂN GIA ĐÌNH PHƯỚC THỊNH',
            citizenMustFill: true,
            fillHint: 'Không đặt trùng tên hộ kinh doanh đã đăng ký trước trong địa bàn'
          },
          {
            label: 'Địa chỉ địa điểm kinh doanh',
            sampleValue: 'Số 102 Nguyễn Phan Vinh, phường Sơn Trà, thành phố Đà Nẵng',
            citizenMustFill: true
          },
          {
            label: 'Ngành, nghề kinh doanh chính',
            sampleValue: 'Bán lẻ hàng tạp hóa / Dịch vụ ăn uống giải khát (Đ/c Hạnh hỗ trợ áp mã ngành)',
            citizenMustFill: true,
            fillHint: 'Chỉ cần mô tả việc buôn bán bằng lời thường, cán bộ sẽ ghi đúng mã ngành'
          },
          {
            label: 'Vốn kinh doanh dự kiến',
            sampleValue: '50.000.000 đồng (Năm mươi triệu đồng)',
            citizenMustFill: true
          }
        ]
      }
    ]
  },

  'srv-an-toan-thuc-pham': {
    serviceId: 'srv-an-toan-thuc-pham',
    formCode: 'Mẫu số 01 (Nghị định 155/2018/NĐ-CP)',
    title: 'ĐƠN ĐỀ NGHỊ CẤP GIẤY CHỨNG NHẬN CƠ SỞ ĐỦ ĐIỀU KIỆN AN TOÀN THỰC PHẨM',
    subtitle: 'Kính gửi: Bộ phận Tiếp nhận & Trả kết quả UBND Phường Sơn Trà',
    legalNote: 'Theo Luật An toàn thực phẩm và Nghị định 155/2018/NĐ-CP',
    elderlyTip:
      'Quán ăn, quán giải khát phải có Giấy phép Hộ kinh doanh trước khi làm đơn này. Đ/c Lê Thị Hồng Hạnh (Ô số 4) sẽ phát kèm mẫu Bản thuyết minh cơ sở vật chất bếp ăn.',
    spokenTip:
      'Thưa Bác, đơn xin cấp giấy chứng nhận an toàn thực phẩm cần ghi rõ tên quán, địa chỉ quán ăn, số giấy đăng ký hộ kinh doanh và số lượng nhân viên trực tiếp chế biến. Bác nộp cùng bản sao giấy phép kinh doanh tại Ô số 4.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Chủ cơ sở kinh doanh (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: 'Thông tin cơ sở kinh doanh dịch vụ ăn uống',
        fields: [
          {
            label: 'Tên cơ sở & Số Giấy ĐK Hộ kinh doanh',
            sampleValue: 'Hộ kinh doanh Quán Cơm Sơn Trà · Số ĐKKD: 32E8001234',
            citizenMustFill: true
          },
          {
            label: 'Chủ cơ sở & Số CCCD',
            sampleValue: 'Nguyễn Thị Kim Liên · CCCD: 0481 7500 3389',
            citizenMustFill: true
          },
          {
            label: 'Loại hình kinh doanh & Số người trực tiếp chế biến',
            sampleValue: 'Quán ăn uống bình dân · 03 người (đã có xác nhận tập huấn ATTP)',
            citizenMustFill: true
          }
        ]
      }
    ]
  },

  'srv-tro-cap-nguoi-cao-tuoi': {
    serviceId: 'srv-tro-cap-nguoi-cao-tuoi',
    formCode: 'Mẫu số 01 (Nghị định 20/2021/NĐ-CP & Nghị định 176/2025/NĐ-CP)',
    title: 'TỜ KHAI ĐỀ NGHỊ HƯỞNG TRỢ CẤP XÃ HỘI / HƯU TRÍ XÃ HỘI NGƯỜI CAO TUỔI',
    subtitle: 'Kính gửi: Chủ tịch Ủy ban nhân dân phường Sơn Trà, thành phố Đà Nẵng',
    legalNote: 'Theo Nghị định 20/2021/NĐ-CP và Nghị định 176/2025/NĐ-CP của Chính phủ',
    elderlyTip:
      'Bác chỉ cần mang Căn cước công dân đến Ô số 5 gặp Đ/c Hà Vương. Nếu Bác muốn nhận tiền hàng tháng qua tài khoản ngân hàng của mình (hoặc qua người thân nhận thay), Bác mang thêm số tài khoản hoặc sổ hộ nghèo (nếu từ đủ 70 đến dưới 75 tuổi). Cán bộ sẽ viết hộ Bác từ đầu đến cuối!',
    spokenTip:
      'Thưa Bác, tờ khai hưởng trợ cấp người cao tuổi rất đơn giản ạ. Bác chỉ cần cung cấp họ tên, ngày tháng năm sinh trên Căn cước công dân và chọn hình thức nhận tiền qua bưu điện hay chuyển khoản ngân hàng. Nếu Bác mắt yếu hoặc mỏi tay, đồng chí Hà Vương ở Ô số 5 sẽ ghi giúp Bác toàn bộ tờ khai ạ.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Người kê khai / Người đại diện (Ký hoặc điểm chỉ)',
    sections: [
      {
        heading: '1. Thông tin của Người cao tuổi đề nghị hưởng trợ cấp',
        fields: [
          {
            label: 'Họ, chữ đệm, tên Người cao tuổi',
            sampleValue: 'NGUYỄN THỊ BẢY',
            citizenMustFill: true,
            fillHint: 'Ghi đúng theo thẻ Căn cước công dân'
          },
          {
            label: 'Ngày, tháng, năm sinh & Số CCCD',
            sampleValue: '02/06/1950 · CCCD: 0481 5000 0412',
            citizenMustFill: true,
            fillHint: 'Từ đủ 75 tuổi trở lên không có lương hưu; hoặc từ đủ 70 đến dưới 75 tuổi thuộc hộ nghèo/cận nghèo'
          },
          {
            label: 'Nơi cư trú hiện tại',
            sampleValue: 'Tổ 21, phường Sơn Trà, thành phố Đà Nẵng',
            citizenMustFill: true
          }
        ]
      },
      {
        heading: '2. Xác nhận hoàn cảnh & Hình thức nhận tiền trợ cấp hàng tháng',
        fields: [
          {
            label: 'Tình trạng hưởng lương hưu / trợ cấp BHXH hàng tháng',
            sampleValue: '[X] Không hưởng lương hưu hoặc trợ cấp bảo hiểm xã hội hàng tháng',
            citizenMustFill: true,
            fillHint: 'Cán bộ kiểm tra đối chiếu dữ liệu bảo hiểm'
          },
          {
            label: 'Hình thức nhận tiền hàng tháng mong muốn',
            sampleValue: 'Nhận tiền mặt tại điểm chi trả Bưu điện phường (hoặc Chuyển khoản Ngân hàng số TK...)',
            citizenMustFill: true,
            fillHint: 'Bác có thể chọn nhận tiền mặt cho tiện hoặc nhận qua tài khoản ngân hàng'
          }
        ]
      }
    ]
  },

  'srv-huu-tri': {
    serviceId: 'srv-huu-tri',
    formCode: 'Mẫu D01-TS / Đề nghị Hưu trí (Luật BHXH 2024)',
    title: 'TỜ KHAI ĐỀ NGHỊ GIẢI QUYẾT CHẾ ĐỘ HƯU TRÍ / CHUYỂN NƠI HƯỞNG',
    subtitle: 'Kính gửi: Bảo hiểm xã hội & Bộ phận Một cửa Phường Sơn Trà',
    legalNote: 'Theo Luật Bảo hiểm xã hội năm 2024 và Nghị định 176/2025/NĐ-CP',
    elderlyTip:
      'Thủ tục Hưu trí hiện được hỗ trợ nộp trực tuyến trên Cổng DVC Quốc gia. Bác mang CCCD, điện thoại có VNeID và sổ BHXH/Quyết định nghỉ hưu đến Ô số 5 (Đ/c Hà Vương) để cán bộ hỗ trợ kê khai trực tuyến giúp Bác.',
    spokenTip:
      'Thưa Bác, với nhóm thủ tục Hưu trí, Bác mang theo Căn cước công dân và sổ Bảo hiểm xã hội đến Ô số 5 gặp đồng chí Hà Vương. Cán bộ sẽ hỗ trợ Bác điền mẫu trực tuyến và chọn tài khoản ngân hàng nhận lương hưu hàng tháng.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Người đề nghị hưởng chế độ (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: 'Thông tin kê khai giải quyết chế độ hưu trí',
        fields: [
          {
            label: 'Họ tên & Số CCCD & Mã số BHXH (nếu có)',
            sampleValue: 'HỒ VĂN THÀNH · CCCD: 0480 6400 8821 · Mã BHXH: 4820123456',
            citizenMustFill: true
          },
          {
            label: 'Nội dung đề nghị',
            sampleValue: 'Giải quyết hưởng lương hưu hàng tháng / Chuyển nơi nhận lương hưu về phường Sơn Trà',
            citizenMustFill: true
          },
          {
            label: 'Số tài khoản ngân hàng nhận lương hưu',
            sampleValue: 'STK: 102003456789 · Ngân hàng VietinBank chi nhánh Đà Nẵng',
            citizenMustFill: true
          }
        ]
      }
    ]
  },

  'srv-tro-cap-khuyet-tat': {
    serviceId: 'srv-tro-cap-khuyet-tat',
    formCode: 'Mẫu số 01 (Thông tư 01/2019/TT-BLĐTBXH)',
    title: 'ĐƠN ĐỀ NGHỊ XÁC ĐỊNH, XÁC ĐỊNH LẠI MỨC ĐỘ KHUYẾT TẬT',
    subtitle: 'Kính gửi: Hội đồng xác định mức độ khuyết tật Phường Sơn Trà',
    legalNote: 'Ban hành kèm theo Thông tư số 01/2019/TT-BLĐTBXH',
    elderlyTip:
      'Nếu người khuyết tật không thể tự viết hoặc không đi lại được, người thân trong gia đình hoặc người giám hộ ký thay và mang giấy ra viện/bệnh án đến Ô số 5 gặp Đ/c Hà Vương.',
    spokenTip:
      'Thưa Bác, mẫu đơn xác định mức độ khuyết tật cần ghi rõ thông tin của người khuyết tật, dạng khuyết tật đang gặp phải và tên người đại diện chăm sóc nếu có. Bác mang theo giấy ra viện hoặc bệnh án đến Ô số 5 để được viết hộ đơn này.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Người làm đơn / Người đại diện hợp pháp (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: 'Thông tin người khuyết tật & Nội dung đề nghị',
        fields: [
          {
            label: 'Họ tên người khuyết tật · Ngày sinh · Số CCCD',
            sampleValue: 'LÊ VĂN BÌNH · 14/08/1958 · CCCD: 0480 5800 9123',
            citizenMustFill: true
          },
          {
            label: 'Tình trạng bệnh lý / Dạng tật đề nghị đánh giá',
            sampleValue: 'Khuyết tật vận động sau tai biến (kèm giấy ra viện Bệnh viện Đà Nẵng)',
            citizenMustFill: true
          },
          {
            label: 'Người đại diện / Người trực tiếp chăm sóc (nếu có)',
            sampleValue: 'Lê Thị Hoa (Con gái) · SĐT: 0914 222 333',
            citizenMustFill: false
          }
        ]
      }
    ]
  },

  'srv-mien-giam-hoc-phi': {
    serviceId: 'srv-mien-giam-hoc-phi',
    formCode: 'Mẫu Phụ lục IV / V (Nghị định 81/2021/NĐ-CP)',
    title: 'ĐƠN ĐỀ NGHỊ MIỄN, GIẢM HỌC PHÍ VÀ HỖ TRỢ CHI PHÍ HỌC TẬP',
    subtitle: 'Kính gửi: Nhà trường & Ủy ban nhân dân Phường Sơn Trà (Xác nhận đối tượng)',
    legalNote: 'Ban hành kèm theo Nghị định số 81/2021/NĐ-CP của Chính phủ',
    elderlyTip:
      'Đơn này thường do nhà trường phát cho học sinh, sinh viên điền sẵn, sau đó phụ huynh hoặc ông bà mang kèm Sổ hộ nghèo/giấy xác nhận chính sách đến Ô số 5 để UBND phường ký xác nhận và đóng dấu trong ngày.',
    spokenTip:
      'Thưa Bác, đơn xin miễn giảm học phí cần ghi rõ tên cháu học sinh, tên lớp, tên trường và thuộc diện hộ nghèo hay cận nghèo. Sau khi điền theo mẫu nhà trường, Bác mang ra Ô số 5 để phường đóng dấu xác nhận ngay trong ngày.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Cha/Mẹ/Người giám hộ học sinh (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: 'Thông tin học sinh, sinh viên & Gia đình',
        fields: [
          {
            label: 'Họ tên Phụ huynh / Người giám hộ & Số CCCD',
            sampleValue: 'NGUYỄN THỊ LAN · CCCD: 0481 8200 1122',
            citizenMustFill: true
          },
          {
            label: 'Họ tên Học sinh / Sinh viên · Lớp · Trường đang học',
            sampleValue: 'Trần Minh Quân · Lớp 7/2 · Trường THCS Nguyễn Chí Thanh',
            citizenMustFill: true
          },
          {
            label: 'Thuộc đối tượng ưu tiên theo quy định',
            sampleValue: 'Hộ nghèo / Hộ cận nghèo (Giấy chứng nhận số 42/GCN-ST)',
            citizenMustFill: true
          }
        ]
      }
    ]
  },

  'srv-ban-le-thuoc-la-ruou': {
    serviceId: 'srv-ban-le-thuoc-la-ruou',
    formCode: 'Mẫu Phụ lục (Nghị định 67/2013/NĐ-CP & 105/2017/NĐ-CP)',
    title: 'ĐƠN ĐỀ NGHỊ CẤP GIẤY PHÉP BÁN LẺ SẢN PHẨM THUỐC LÁ / RƯỢU',
    subtitle: 'Kính gửi: Bộ phận Tiếp nhận & Trả kết quả UBND Phường Sơn Trà',
    legalNote: 'Theo Nghị định 67/2013/NĐ-CP và Nghị định 105/2017/NĐ-CP',
    elderlyTip:
      'Chủ cửa hàng cần có Giấy phép Hộ kinh doanh trước và hợp đồng nguyên tắc với nhà phân phối hợp pháp. Đ/c Phạm Thị Thái Nguyên tại Ô số 6 sẽ rà soát đầy đủ hồ sơ giúp Bác.',
    spokenTip:
      'Thưa Bác, trong đơn xin cấp phép bán lẻ thuốc lá hoặc rượu, Bác ghi rõ tên hộ kinh doanh, địa chỉ cửa hàng và tên công ty phân phối cung cấp hàng. Nộp kèm bản sao giấy phép kinh doanh tại Ô số 6.',
    hasBlankPrintableForm: true,
    signatureLabel: 'Chủ hộ kinh doanh (Ký, ghi rõ họ tên)',
    sections: [
      {
        heading: 'Thông tin thương nhân đề nghị cấp phép',
        fields: [
          {
            label: 'Tên Hộ kinh doanh & Địa chỉ cửa hàng',
            sampleValue: 'Hộ kinh doanh Tạp hóa Minh Tâm · Số 78 Ngô Quyền, P. Sơn Trà',
            citizenMustFill: true
          },
          {
            label: 'Số Giấy chứng nhận ĐK Hộ kinh doanh',
            sampleValue: 'Số 32E8005678, cấp ngày 10/01/2025',
            citizenMustFill: true
          },
          {
            label: 'Thương nhân phân phối cung cấp hàng',
            sampleValue: 'Công ty TNHH Thương mại & Phân phối Đà Nẵng (kèm Hợp đồng nguyên tắc)',
            citizenMustFill: true
          }
        ]
      }
    ]
  },

  'srv-ho-tro-vneid-dvc': {
    serviceId: 'srv-ho-tro-vneid-dvc',
    formCode: 'Phiếu hướng dẫn thao tác (Đề án 06 Chính phủ)',
    title: 'PHIẾU CHUẨN BỊ KHI CÀI ĐẶT VNEID & NỘP HỒ SƠ TRỰC TUYẾN',
    subtitle: 'Hỗ trợ miễn phí tại Ô số 6 (Đ/c Nguyên) & Quầy Hướng dẫn (Đ/c Đại)',
    legalNote: 'Triển khai Đề án 06/CP về Chuyển đổi số phục vụ công dân',
    elderlyTip:
      'Bác KHÔNG CẦN viết đơn giấy! Chỉ cần mang theo Căn cước công dân gắn chip bản chính và điện thoại di động có SIM chính chủ đang dùng được để nhận mã tin nhắn OTP.',
    spokenTip:
      'Thưa Bác, khi đi nhờ cài đặt VNeID hoặc nộp hồ sơ trực tuyến, Bác không cần điền bất kỳ tờ khai giấy nào cả. Bác chỉ cần mang theo Căn cước công dân gắn chip và chiếc điện thoại di động đang sử dụng là cán bộ sẽ hỗ trợ cầm tay chỉ việc miễn phí ạ.',
    hasBlankPrintableForm: false,
    signatureLabel: 'Thông tin ghi nhớ cho công dân',
    sections: [
      {
        heading: '3 thứ cần kiểm tra trước khi nhờ cán bộ hỗ trợ số hóa',
        fields: [
          {
            label: '1. Thẻ Căn cước công dân gắn chip bản chính',
            sampleValue: 'Thẻ còn nguyên vẹn, không nứt gãy chip mặt sau để quét NFC',
            citizenMustFill: false
          },
          {
            label: '2. Điện thoại thông minh có kết nối Wi-Fi / 4G',
            sampleValue: 'Pin đủ từ 30% trở lên (tại sảnh phường có Wi-Fi miễn phí cho công dân)',
            citizenMustFill: false
          },
          {
            label: '3. Số điện thoại đăng ký chính chủ theo CCCD',
            sampleValue: 'Nhận tin nhắn mã xác thực OTP 6 chữ số để kích hoạt VNeID',
            citizenMustFill: false
          }
        ]
      }
    ]
  }
};
