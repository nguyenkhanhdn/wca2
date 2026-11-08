import { Ward, Counter, Officer, PublicService } from '../types';

export const INITIAL_WARDS: Ward[] = [
  {
    id: 'ward-sontra',
    name: 'Phường Sơn Trà',
    district: 'Thành phố Đà Nẵng',
    city: 'Thành phố Đà Nẵng',
    address: 'Số 06 Nguyễn Phan Vinh, phường Sơn Trà, thành phố Đà Nẵng',
    hotline: '0913 415 457',
    workingHours: 'Thứ Hai đến Thứ Sáu: Sáng 07h30 - 11h30 | Chiều 13h30 - 17h00',
    supportOfficer: 'Đ/c Phạm Duy Đại (Túc trực tại Quầy Tiếp đón)',
    description: 'Trung tâm Phục vụ Hành chính công Phường Sơn Trà đặt tại Số 06 Nguyễn Phan Vinh, phường Sơn Trà, thành phố Đà Nẵng - Lấy người dân làm trung tâm phục vụ, ưu tiên hỗ trợ người cao tuổi và người yếu thế.'
  },
  {
    id: 'ward-anhai',
    name: 'Phường An Hải Bắc',
    district: 'Thành phố Đà Nẵng',
    city: 'Thành phố Đà Nẵng',
    address: 'Đường Nguyễn Công Trứ, Phường An Hải Bắc, TP. Đà Nẵng',
    hotline: '0236.3844.889',
    workingHours: 'Sáng 07h30 - 11h30 | Chiều 13h30 - 17h00',
    supportOfficer: 'Bộ phận Tiếp nhận & Trả kết quả một cửa',
    description: 'Bộ phận một cửa điện tử Phường An Hải Bắc, TP. Đà Nẵng.'
  },
  {
    id: 'ward-naihiendong',
    name: 'Phường Nại Hiên Đông',
    district: 'Thành phố Đà Nẵng',
    city: 'Thành phố Đà Nẵng',
    address: 'Đường Trần Hưng Đạo kéo dài, Phường Nại Hiên Đông, TP. Đà Nẵng',
    hotline: '0236.3844.992',
    workingHours: 'Sáng 07h30 - 11h30 | Chiều 13h30 - 17h00',
    supportOfficer: 'Quầy hỗ trợ dịch vụ số',
    description: 'Bộ phận tiếp nhận và trả kết quả hiện đại Phường Nại Hiên Đông, TP. Đà Nẵng.'
  }
];

export const INITIAL_COUNTERS: Counter[] = [
  {
    id: 'counter-1',
    wardId: 'ward-sontra',
    code: 'Ô số 1',
    name: 'Tiếp nhận & Trả kết quả Tư pháp - Hộ tịch (Bàn 1)',
    officerId: 'officer-thinh',
    officerName: 'Đ/c Đinh Phú Thịnh',
    primaryField: 'Tư pháp - Hộ tịch',
    description: 'Chuyên trách tiếp nhận hồ sơ khai sinh, kết hôn, khai tử, trích lục hộ tịch.',
    positionNumber: 1,
    colorTheme: 'blue',
    isActive: true
  },
  {
    id: 'counter-2',
    wardId: 'ward-sontra',
    code: 'Ô số 2',
    name: 'Tiếp nhận & Trả kết quả Tư pháp - Hộ tịch & Chứng thực (Bàn 2)',
    officerId: 'officer-nhat',
    officerName: 'Đ/c Đỗ Tấn Nhật',
    primaryField: 'Tư pháp - Hộ tịch',
    description: 'Chuyên trách hồ sơ chứng thực bản sao từ bản chính, chứng thực chữ ký, lý lịch.',
    positionNumber: 2,
    colorTheme: 'blue',
    isActive: true
  },
  {
    id: 'counter-3',
    wardId: 'ward-sontra',
    code: 'Ô số 3',
    name: 'Dân tộc - Tôn giáo - Nội vụ & Quỹ cơ quan',
    officerId: 'officer-thuan',
    officerName: 'Đ/c Trần Đặng Bích Thuận',
    primaryField: 'Dân tộc - Tôn giáo - Nội vụ',
    description: 'Thủ quỹ cơ quan, tiếp nhận thủ tục về tôn giáo, dân tộc, thi đua khen thưởng và nội vụ.',
    positionNumber: 3,
    colorTheme: 'purple',
    isActive: true
  },
  {
    id: 'counter-4',
    wardId: 'ward-sontra',
    code: 'Ô số 4',
    name: 'Đăng ký Hộ kinh doanh & An toàn thực phẩm',
    officerId: 'officer-hanh',
    officerName: 'Đ/c Lê Thị Hồng Hạnh',
    primaryField: 'Đăng ký kinh doanh, An toàn thực phẩm',
    description: 'Cấp giấy phép kinh doanh cá thể, cấp chứng nhận an toàn thực phẩm, kiêm văn phòng.',
    positionNumber: 4,
    colorTheme: 'emerald',
    isActive: true
  },
  {
    id: 'counter-5',
    wardId: 'ward-sontra',
    code: 'Ô số 5',
    name: 'Văn hóa - Giáo dục - Y tế & Chính sách Xã hội',
    officerId: 'officer-vuong',
    officerName: 'Đ/c Hà Vương',
    primaryField: 'Văn hóa - Giáo dục - Y tế',
    description: 'Tham mưu chính, xác nhận trợ cấp bảo trợ xã hội, người cao tuổi, BHYT, giáo dục.',
    positionNumber: 5,
    colorTheme: 'teal',
    isActive: true
  },
  {
    id: 'counter-6',
    wardId: 'ward-sontra',
    code: 'Ô số 6',
    name: 'Công Thương, Thủ tục hành chính khác & Hỗ trợ nộp trực tuyến',
    officerId: 'officer-nguyen',
    officerName: 'Đ/c Phạm Thị Thái Nguyên',
    primaryField: 'Công Thương, TTHC khác',
    description: 'Cấp phép thương mại, hỗ trợ nộp hồ sơ dịch vụ công trực tuyến và đóng dấu kết quả.',
    positionNumber: 6,
    colorTheme: 'amber',
    isActive: true
  },
  {
    id: 'counter-guide',
    wardId: 'ward-sontra',
    code: 'Quầy Hướng dẫn',
    name: 'Quầy Hướng dẫn, Tiếp đón & Trợ giúp số cho Công dân',
    officerId: 'officer-dai',
    officerName: 'Đ/c Phạm Duy Đại',
    primaryField: 'Tiếp đón & Trợ giúp số',
    description: 'Phát số thứ tự tự động, hỗ trợ người cao tuổi viết đơn và tra cứu thủ tục.',
    positionNumber: 7,
    colorTheme: 'indigo',
    isActive: true
  },
  {
    id: 'counter-facility',
    wardId: 'ward-sontra',
    code: 'Khu Tiện ích',
    name: 'Khu Tiện ích Công dân, Kế toán & Quản lý CSVC',
    officerId: 'officer-tam',
    officerName: 'Đ/c Mai Thị Thanh Tâm',
    primaryField: 'Kế toán, CSVC & Phục vụ công dân',
    description: 'Phụ trách kế toán tài chính, trang thiết bị, nước uống, photocopy miễn phí cho người dân.',
    positionNumber: 8,
    colorTheme: 'rose',
    isActive: true
  }
];

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'officer-thinh',
    name: 'Đồng chí Đinh Phú Thịnh',
    title: 'Chuyên viên Tư pháp - Hộ tịch',
    counterId: 'counter-1',
    wardId: 'ward-sontra',
    phone: '0905.888.101',
    fields: ['Tư pháp - Hộ tịch'],
    primaryDuties: [
      'Hướng dẫn, hỗ trợ, tiếp nhận và trả kết quả hồ sơ Hộ tịch',
      'Đăng ký khai sinh, kết hôn, khai tử',
      'Cấp trích lục bản sao hộ tịch, nhận cha mẹ con'
    ],
    concurrentRoles: ['Thành viên Tổ chuyển đổi số tư pháp']
  },
  {
    id: 'officer-nhat',
    name: 'Đồng chí Đỗ Tấn Nhật',
    title: 'Chuyên viên Tư pháp - Hộ tịch',
    counterId: 'counter-2',
    wardId: 'ward-sontra',
    phone: '0905.888.102',
    fields: ['Tư pháp - Hộ tịch', 'Chứng thực'],
    primaryDuties: [
      'Hướng dẫn, hỗ trợ, tiếp nhận và trả kết quả',
      'Chứng thực bản sao từ bản chính (CCCD, bằng cấp, giấy tờ)',
      'Chứng thực chữ ký cá nhân, sơ yếu lý lịch',
      'Xác nhận tình trạng hôn nhân'
    ],
    concurrentRoles: ['Hỗ trợ kiểm tra pháp lý văn bản']
  },
  {
    id: 'officer-thuan',
    name: 'Đồng chí Trần Đặng Bích Thuận',
    title: 'Chuyên viên Dân tộc - Tôn giáo - Nội vụ',
    counterId: 'counter-3',
    wardId: 'ward-sontra',
    phone: '0905.888.103',
    fields: ['Dân tộc - Tôn giáo - Nội vụ'],
    primaryDuties: [
      'Phụ trách lĩnh vực Dân tộc - Tôn giáo - Nội vụ',
      'Nhiệm vụ phối hợp và tham mưu',
      'Kiêm nhiệm: Thủ quỹ cơ quan (thu nộp lệ phí, quản lý tài chính)'
    ],
    concurrentRoles: ['Thủ quỹ cơ quan']
  },
  {
    id: 'officer-hanh',
    name: 'Đồng chí Lê Thị Hồng Hạnh',
    title: 'Chuyên viên Kinh tế & An toàn thực phẩm',
    counterId: 'counter-4',
    wardId: 'ward-sontra',
    phone: '0905.888.104',
    fields: ['Đăng ký hộ kinh doanh', 'An toàn thực phẩm'],
    primaryDuties: [
      'Tiếp nhận cấp mới, thay đổi giấy phép Hộ kinh doanh cá thể',
      'Thủ tục cấp Giấy chứng nhận đủ điều kiện an toàn thực phẩm',
      'Kiêm nhiệm công tác văn phòng Ủy ban'
    ],
    concurrentRoles: ['Kiêm nhiệm công tác văn phòng']
  },
  {
    id: 'officer-vuong',
    name: 'Đồng chí Hà Vương',
    title: 'Chuyên viên Văn hóa - Xã hội',
    counterId: 'counter-5',
    wardId: 'ward-sontra',
    phone: '0905.888.105',
    fields: ['Văn hóa - Giáo dục - Y tế'],
    primaryDuties: [
      'Nhiệm vụ tham mưu chính lĩnh vực Văn hóa - Giáo dục - Y tế',
      'Nhiệm vụ xác nhận thông thường và chính sách an sinh xã hội',
      'Phối hợp tổ chức tập huấn, bồi dưỡng chuyên môn nghiệp vụ',
      'Thủ tục trợ cấp người cao tuổi, người khuyết tật, BHYT đối tượng chính sách'
    ],
    concurrentRoles: ['Tổ trưởng Tổ truyền thông văn hóa cơ sở']
  },
  {
    id: 'officer-nguyen',
    name: 'Đồng chí Phạm Thị Thái Nguyên',
    title: 'Chuyên viên Công Thương & Quản trị',
    counterId: 'counter-6',
    wardId: 'ward-sontra',
    phone: '0905.888.106',
    fields: ['Công Thương', 'Thủ tục hành chính khác'],
    primaryDuties: [
      'Nhiệm vụ chuyên môn và tham mưu lĩnh vực Công Thương',
      'Hỗ trợ nộp hồ sơ trực tuyến lĩnh vực Hộ tịch',
      'Đóng dấu hồ sơ, chuyển giao kết quả hành chính'
    ],
    concurrentRoles: ['Quản lý đóng dấu văn bản hành chính']
  },
  {
    id: 'officer-dai',
    name: 'Đồng chí Phạm Duy Đại',
    title: 'Cán bộ Tiếp đón & Hướng dẫn Dịch vụ số',
    counterId: 'counter-guide',
    wardId: 'ward-sontra',
    phone: '0905.888.107',
    fields: ['Hướng dẫn & Tiếp đón công dân'],
    primaryDuties: [
      'Hướng dẫn, hỗ trợ, tiếp nhận ban đầu và trả kết quả',
      'Trực tiếp trợ giúp người cao tuổi lấy số thứ tự và viết biểu mẫu',
      'Tư vấn quy trình và điều phối công dân đến đúng ô chuyên môn'
    ],
    concurrentRoles: ['Tổ trưởng Tổ hỗ trợ công nghệ số cộng đồng']
  },
  {
    id: 'officer-tam',
    name: 'Đồng chí Mai Thị Thanh Tâm',
    title: 'Kế toán viên & Quản trị Cơ sở vật chất',
    counterId: 'counter-facility',
    wardId: 'ward-sontra',
    phone: '0905.888.108',
    fields: ['Tài chính', 'Quản trị cơ sở vật chất'],
    primaryDuties: [
      'Nhiệm vụ tài chính: Phụ trách kế toán, xây dựng báo cáo tổng hợp tài chính',
      'Quản lý cơ sở vật chất và tài sản công',
      'Tiện ích và phục vụ công dân: nước uống, bàn viết, photocopy và hỗ trợ thiết bị'
    ],
    concurrentRoles: ['Phụ trách tài sản công UBND']
  }
];

export const INITIAL_SERVICES: PublicService[] = [
  // 1. Tư pháp - Hộ tịch (Ô số 1)
  {
    id: 'srv-khai-sinh',
    wardId: 'ward-sontra',
    code: '1.000128',
    name: 'Đăng ký Khai sinh (Liên thông Khai sinh - Thường trú - BHYT)',
    category: 'tu_phap_ho_tich',
    level: 'toan_trinh',
    counterId: 'counter-1',
    summary: 'Làm giấy khai sinh cho trẻ mới sinh, đồng thời tự động đăng ký nơi cư trú và cấp thẻ bảo hiểm y tế miễn phí.',
    processingDuration: 'Trong ngày (tối đa 02 ngày làm việc khi liên thông)',
    fee: 'Miễn phí cho trẻ em đăng ký đúng hạn',
    audioScript: 'Kính chào Bác! Để làm giấy khai sinh cho cháu, Bác cần chuẩn bị: Giấy chứng sinh bản chính từ bệnh viện, Căn cước công dân của cha hoặc mẹ, và Giấy chứng nhận kết hôn nếu có. Bác đến nộp tại Ô số 1, gặp đồng chí Đinh Phú Thịnh. Thủ tục này hoàn toàn miễn phí lệ phí cho trẻ em.',
    searchKeywords: ['khai sinh', 'sinh con', 'cháu mới sinh', 'làm giấy khai sinh', 'thẻ bhyt trẻ em', 'đăng ký thường trú'],
    isPopular: true,
    requiredDocuments: [
      {
        id: 'doc-ks-1',
        name: 'Giấy chứng sinh do Bệnh viện / Trạm y tế cấp',
        note: 'Bản chính. Nếu không có giấy chứng sinh thì có văn bản xác nhận của người làm chứng.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-ks-2',
        name: 'Giấy chứng nhận kết hôn của cha mẹ (nếu có)',
        note: 'Bản chính hoặc bản sao trích lục kết hôn.',
        isRequired: false,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-ks-3',
        name: 'Tờ khai đăng ký khai sinh',
        note: 'Cán bộ tại Quầy Hướng dẫn sẽ in sẵn và hỗ trợ Bác điền thông tin.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false,
        sampleFormName: 'Mẫu tờ khai khai sinh'
      },
      {
        id: 'doc-ks-4',
        name: 'Thẻ Căn cước công dân của người đi khai sinh',
        note: 'Xuất trình để cán bộ kiểm tra thông tin đối chiếu.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Lấy số thứ tự tại Quầy Hướng dẫn',
        description: 'Bác đến cửa ra vào gặp Đ/c Phạm Duy Đại để lấy số thứ tự Ô số 1 và nhận mẫu tờ khai.',
        counterNote: 'Quầy Hướng dẫn (Đ/c Đại)'
      },
      {
        stepNumber: 2,
        title: 'Nộp hồ sơ tại Ô số 1',
        description: 'Khi màn hình gọi số, Bác đến Ô số 1 gặp Đ/c Đinh Phú Thịnh nộp Giấy chứng sinh và tờ khai.',
        counterNote: 'Ô số 1 (Đ/c Đinh Phú Thịnh)'
      },
      {
        stepNumber: 3,
        title: 'Kiểm tra thông tin và Ký sổ hộ tịch',
        description: 'Cán bộ in bản nháp Giấy khai sinh, Bác kiểm tra kỹ họ tên, ngày tháng năm sinh của cháu và ký tên.',
        counterNote: 'Ô số 1'
      },
      {
        stepNumber: 4,
        title: 'Nhận kết quả Giấy khai sinh',
        description: 'Nhận Giấy khai sinh bản chính và trích lục bản sao. Thẻ BHYT sẽ được gửi về sau theo quy trình liên thông.',
        counterNote: 'Ô số 1'
      }
    ],
    faq: [
      {
        question: 'Ông bà có đi làm giấy khai sinh thay cha mẹ của cháu được không?',
        answer: 'Dạ được ạ! Ông, bà hoặc người thân thích khác có thể đi làm khai sinh cho cháu mà không cần giấy ủy quyền của cha mẹ.'
      },
      {
        question: 'Quá thời hạn 60 ngày kể từ ngày sinh có bị phạt tiền không?',
        answer: 'Hiện nay theo quy định mới, đăng ký khai sinh quá hạn không bị phạt tiền, Bác cứ an tâm mang đầy đủ giấy tờ đến Ô số 1 để hoàn tất thủ tục.'
      }
    ],
    legalBasis: ['Luật Hộ tịch năm 2014', 'Nghị định 123/2015/NĐ-CP', 'Thông tư 04/2020/TT-BTP'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000128'
  },

  {
    id: 'srv-ket-hon',
    wardId: 'ward-sontra',
    code: '1.000129',
    name: 'Đăng ký Kết hôn',
    category: 'tu_phap_ho_tich',
    level: 'truc_tiep',
    counterId: 'counter-1',
    summary: 'Thủ tục cấp Giấy chứng nhận kết hôn cho công dân cư trú tại phường.',
    processingDuration: 'Trong ngày làm việc (nếu đủ hồ sơ hợp lệ)',
    fee: 'Miễn phí đối với công dân Việt Nam cư trú trong nước',
    audioScript: 'Chào Bác và các anh chị! Để đăng ký kết hôn, hai bên nam nữ cùng có mặt tại Ô số 1, mang theo Căn cước công dân và Giấy xác nhận tình trạng hôn nhân nếu cư trú ở nơi khác. Đ/c Đinh Phú Thịnh sẽ tiếp nhận và tổ chức trao Giấy chứng nhận kết hôn trang trọng ngay trong ngày.',
    searchKeywords: ['kết hôn', 'đăng ký kết hôn', 'lấy vợ', 'lấy chồng', 'giấy đăng ký kết hôn'],
    isPopular: true,
    requiredDocuments: [
      {
        id: 'doc-kh-1',
        name: 'Tờ khai đăng ký kết hôn',
        note: 'Hai bên nam nữ cùng ký vào tờ khai, có phát miễn phí tại UBND.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-kh-2',
        name: 'Căn cước công dân của cả hai người',
        note: 'Bản chính để xuất trình kiểm tra.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-kh-3',
        name: 'Giấy xác nhận tình trạng hôn nhân',
        note: 'Cần có nếu một trong hai bên có hộ khẩu thường trú ở địa phương khác.',
        isRequired: false,
        isOriginal: true,
        isCopyOrCertified: false
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Chuẩn bị hồ sơ và nộp tại Ô số 1',
        description: 'Hai bên nam nữ cùng đến Ô số 1 gặp Đ/c Đinh Phú Thịnh nộp tờ khai và giấy tờ tùy thân.',
        counterNote: 'Ô số 1'
      },
      {
        stepNumber: 2,
        title: 'Ký Sổ đăng ký kết hôn',
        description: 'Sau khi cán bộ thẩm tra hồ sơ hợp lệ, cả hai bên cùng ký vào Sổ đăng ký kết hôn và Giấy chứng nhận kết hôn.',
        counterNote: 'Ô số 1'
      },
      {
        stepNumber: 3,
        title: 'Trao Giấy chứng nhận kết hôn',
        description: 'Lãnh đạo UBND Phường hoặc Cán bộ Tư pháp trao 02 bản chính Giấy chứng nhận kết hôn cho vợ và chồng.',
        counterNote: 'Phòng tiếp dân một cửa'
      }
    ],
    legalBasis: ['Luật Hộ tịch năm 2014', 'Luật Hôn nhân và Gia đình năm 2014'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000129'
  },

  {
    id: 'srv-khai-tu',
    wardId: 'ward-sontra',
    code: '1.000130',
    name: 'Đăng ký Khai tử (Liên thông Xóa thường trú - Mai táng phí)',
    category: 'tu_phap_ho_tich',
    level: 'toan_trinh',
    counterId: 'counter-1',
    summary: 'Thủ tục đăng ký khai tử khi có người thân qua đời, hỗ trợ liên thông chế độ trợ cấp mai táng.',
    processingDuration: 'Trong ngày làm việc',
    fee: 'Miễn phí nếu đăng ký đúng hạn',
    audioScript: 'Kính chào Bác! Khi gia đình có người thân qua đời, người đại diện gia đình mang theo Giấy báo tử của bệnh viện hoặc trạm y tế, cùng Căn cước công dân của người mất đến nộp tại Ô số 1. Đồng chí Đinh Phú Thịnh sẽ hướng dẫn tận tình và cấp trích lục khai tử ngay trong ngày.',
    searchKeywords: ['khai tử', 'người mất', 'giấy chứng tử', 'báo tử', 'mai táng phí'],
    isPopular: false,
    requiredDocuments: [
      {
        id: 'doc-kt-1',
        name: 'Giấy báo tử hoặc giấy tờ thay thế Giấy báo tử',
        note: 'Do Bệnh viện, Cơ sở y tế hoặc Trưởng thôn/Tổ dân phố cấp.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-kt-2',
        name: 'Tờ khai đăng ký khai tử',
        note: 'Được phát miễn phí tại bộ phận tiếp nhận.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-kt-3',
        name: 'Căn cước công dân của người chết',
        note: 'Để thực hiện thủ tục xóa đăng ký thường trú.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp Giấy báo tử tại Ô số 1',
        description: 'Người thân mang Giấy báo tử đến Ô số 1 để Đ/c Đinh Phú Thịnh kiểm tra và lập hồ sơ.',
        counterNote: 'Ô số 1'
      },
      {
        stepNumber: 2,
        title: 'Ký sổ và nhận Trích lục Khai tử',
        description: 'Nhận kết quả Giấy khai tử bản chính và các bản sao trích lục cần thiết cho gia đình.',
        counterNote: 'Ô số 1'
      }
    ],
    legalBasis: ['Luật Hộ tịch năm 2014'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000130'
  },

  // 2. Tư pháp - Chứng thực (Ô số 2)
  {
    id: 'srv-chung-thuc-ban-sao',
    wardId: 'ward-sontra',
    code: '1.000135',
    name: 'Chứng thực Bản sao từ Bản chính (Công chứng giấy tờ, bằng cấp, CCCD)',
    category: 'tu_phap_ho_tich',
    level: 'truc_tiep',
    counterId: 'counter-2',
    summary: 'Sao y công chứng các loại giấy tờ tùy thân, bằng tốt nghiệp, học bạ, hợp đồng, giấy chứng nhận quyền sử dụng đất.',
    processingDuration: 'Trả kết quả ngay sau 15 - 30 phút',
    fee: '2.000 VNĐ / trang (Trang 1 và 2); từ trang 3 trở đi 1.000 VNĐ / trang',
    audioScript: 'Chào Bác! Để sao y công chứng giấy tờ, Bác chỉ cần mang Bản gốc giấy tờ và bản photo đến Ô số 2, gặp đồng chí Đỗ Tấn Nhật. Nếu Bác chưa photo, bên cạnh có quầy của cô Tâm hỗ trợ photo miễn phí cho người cao tuổi. Thời gian xử lý chỉ mất khoảng 15 đến 20 phút.',
    searchKeywords: ['chứng thực', 'công chứng', 'sao y', 'photo công chứng', 'chứng thực căn cước', 'công chứng bằng cấp'],
    isPopular: true,
    requiredDocuments: [
      {
        id: 'doc-ct-1',
        name: 'Bản chính giấy tờ, văn bản cần chứng thực',
        note: 'Bản chính phải còn nguyên vẹn, rõ chữ, có con dấu và chữ ký hợp lệ.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-ct-2',
        name: 'Bản chụp / Bản photocopy giấy tờ cần chứng thực',
        note: 'Có thể tự photo trước hoặc photo tại Quầy Tiện ích của phường.',
        isRequired: true,
        isOriginal: false,
        isCopyOrCertified: true
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp bản chính và bản photo tại Ô số 2',
        description: 'Đến Ô số 2 gặp Đ/c Đỗ Tấn Nhật nộp bản chính kèm các bản photo cần sao y.',
        counterNote: 'Ô số 2 (Đ/c Đỗ Tấn Nhật)'
      },
      {
        stepNumber: 2,
        title: 'Cán bộ đối chiếu và đóng dấu chứng thực',
        description: 'Cán bộ kiểm tra đối chiếu nội dung bản sao với bản chính, ghi lời chứng và chuyển ký đóng dấu.',
        counterNote: 'Ô số 2'
      },
      {
        stepNumber: 3,
        title: 'Nộp lệ phí và nhận giấy tờ',
        description: 'Nhận lại bản chính và các bản sao đã đóng dấu chứng thực kèm biên lai thu tiền.',
        counterNote: 'Ô số 2 & Quầy thủ quỹ'
      }
    ],
    legalBasis: ['Nghị định 23/2015/NĐ-CP của Chính phủ'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000135'
  },

  {
    id: 'srv-chung-thuc-chu-ky',
    wardId: 'ward-sontra',
    code: '1.000136',
    name: 'Chứng thực Chữ ký trong Giấy tờ, Sơ yếu lý lịch, Giấy ủy quyền',
    category: 'tu_phap_ho_tich',
    level: 'truc_tiep',
    counterId: 'counter-2',
    summary: 'Xác nhận chữ ký của công dân trong sơ yếu lý lịch xin việc, giấy ủy quyền nhận lương hưu, giấy cam kết.',
    processingDuration: 'Trả kết quả ngay sau 20 phút',
    fee: '10.000 VNĐ / trường hợp',
    audioScript: 'Chào Bác! Khi đi chứng thực chữ ký hoặc sơ yếu lý lịch, Bác mang theo Căn cước công dân và bản lý lịch đến Ô số 2 gặp đồng chí Đỗ Tấn Nhật. Lưu ý quan trọng là Bác KHÔNG được ký tên trước ở nhà, mà phải ký trực tiếp trước mặt cán bộ tại quầy.',
    searchKeywords: ['chứng thực chữ ký', 'sơ yếu lý lịch', 'giấy ủy quyền', 'ủy quyền nhận lương hưu', 'ủy quyền nhận tiền'],
    isPopular: true,
    requiredDocuments: [
      {
        id: 'doc-ck-1',
        name: 'Giấy tờ, văn bản cần chứng thực chữ ký (Sơ yếu lý lịch, Giấy ủy quyền)',
        note: 'Chưa được ký tên trước. Người ký phải ký trực tiếp trước mặt người tiếp nhận hồ sơ.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-ck-2',
        name: 'Thẻ Căn cước công dân của người ký',
        note: 'Bản chính còn hạn sử dụng.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Xuất trình CCCD và văn bản tại Ô số 2',
        description: 'Bác đưa giấy tờ cho Đ/c Đỗ Tấn Nhật kiểm tra thông tin nhân thân.',
        counterNote: 'Ô số 2'
      },
      {
        stepNumber: 2,
        title: 'Ký tên trực tiếp trước mặt cán bộ',
        description: 'Bác ký tên vào vị trí người cam kết / người làm đơn dưới sự chứng kiến của cán bộ.',
        counterNote: 'Ô số 2'
      },
      {
        stepNumber: 3,
        title: 'Nhận kết quả đã đóng dấu',
        description: 'Cán bộ ghi lời chứng, đóng dấu xác nhận và trả ngay cho Bác.',
        counterNote: 'Ô số 2'
      }
    ],
    legalBasis: ['Nghị định 23/2015/NĐ-CP'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000136'
  },

  {
    id: 'srv-xac-nhan-hon-nhan',
    wardId: 'ward-sontra',
    code: '1.000137',
    name: 'Cấp Giấy xác nhận Tình trạng Hôn nhân (để mua bán nhà đất, vay vốn, kết hôn)',
    category: 'tu_phap_ho_tich',
    level: 'mot_phan',
    counterId: 'counter-1',
    summary: 'Cấp giấy chứng minh độc thân hoặc tình trạng hôn nhân phục vụ giao dịch bất động sản, vay ngân hàng hoặc đăng ký kết hôn.',
    processingDuration: 'Trong ngày làm việc (không quá 03 ngày nếu cần xác minh nơi cư trú cũ)',
    fee: '15.000 VNĐ / bản',
    audioScript: 'Kính chào Bác! Để xin Giấy xác nhận tình trạng hôn nhân phục vụ mua bán nhà đất hoặc việc gia đình, Bác mang theo Căn cước công dân đến Ô số 1 gặp đồng chí Đinh Phú Thịnh. Nếu trước đây từng ly hôn thì mang theo bản án hoặc quyết định ly hôn của Tòa án.',
    searchKeywords: ['xác nhận tình trạng hôn nhân', 'giấy độc thân', 'mua bán nhà', 'vay vốn ngân hàng', 'ly hôn'],
    isPopular: true,
    requiredDocuments: [
      {
        id: 'doc-xnhn-1',
        name: 'Tờ khai cấp Giấy xác nhận tình trạng hôn nhân',
        note: 'Ghi rõ mục đích sử dụng (Ví dụ: để chuyển nhượng quyền sử dụng đất, hoặc để vay vốn ngân hàng).',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-xnhn-2',
        name: 'Bản án, quyết định ly hôn hoặc Giấy chứng tử của vợ/chồng cũ (nếu có)',
        note: 'Áp dụng đối với người đã từng kết hôn nhưng đã ly hôn hoặc vợ/chồng đã mất.',
        isRequired: false,
        isOriginal: true,
        isCopyOrCertified: true
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp tờ khai và hồ sơ tại Ô số 1',
        description: 'Nộp tờ khai cho Đ/c Đinh Phú Thịnh, cán bộ kiểm tra cơ sở dữ liệu quốc gia về dân cư.',
        counterNote: 'Ô số 1'
      },
      {
        stepNumber: 2,
        title: 'Thẩm tra cơ sở dữ liệu và ký cấp giấy',
        description: 'Cán bộ tư pháp in Giấy xác nhận tình trạng hôn nhân trình Chủ tịch UBND Phường ký duyệt.',
        counterNote: 'Ô số 1'
      },
      {
        stepNumber: 3,
        title: 'Nhận kết quả',
        description: 'Nhận Giấy xác nhận tình trạng hôn nhân có dấu đỏ.',
        counterNote: 'Ô số 1'
      }
    ],
    legalBasis: ['Luật Hộ tịch năm 2014', 'Thông tư 04/2020/TT-BTP'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000137'
  },

  // 3. Dân tộc - Tôn giáo - Nội vụ (Ô số 3)
  {
    id: 'srv-ton-giao-sinh-hoat',
    wardId: 'ward-sontra',
    code: '1.000210',
    name: 'Đăng ký Sinh hoạt Tôn giáo Tập trung / Thông báo Lễ hội Tôn giáo',
    category: 'dan_toc_ton_giao_noi_vu',
    level: 'mot_phan',
    counterId: 'counter-3',
    summary: 'Tiếp nhận thông báo, đăng ký tổ chức sinh hoạt tôn giáo tập trung hoặc lễ hội tôn giáo tại địa bàn phường.',
    processingDuration: '10 ngày làm việc',
    fee: 'Miễn phí',
    audioScript: 'Chào Bác! Với các hoạt động đăng ký sinh hoạt tôn giáo tập trung hoặc lễ hội tín ngưỡng, người đại diện mang văn bản đăng ký đến Ô số 3 gặp đồng chí Trần Đặng Bích Thuận để được hướng dẫn phối hợp và tham mưu giải quyết.',
    searchKeywords: ['tôn giáo', 'sinh hoạt tôn giáo', 'lễ hội', 'chùa', 'nhà thờ', 'tín ngưỡng'],
    isPopular: false,
    requiredDocuments: [
      {
        id: 'doc-tg-1',
        name: 'Văn bản đăng ký nêu rõ tên tổ chức, người đại diện, nội dung và địa điểm sinh hoạt',
        note: 'Bản chính có chữ ký của người đại diện nhóm tôn giáo.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-tg-2',
        name: 'Giấy tờ chứng minh quyền sử dụng hợp pháp địa điểm sinh hoạt',
        note: 'Bản sao có công chứng.',
        isRequired: true,
        isOriginal: false,
        isCopyOrCertified: true
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp hồ sơ tại Ô số 3',
        description: 'Đại diện cơ sở tôn giáo nộp hồ sơ cho Đ/c Trần Đặng Bích Thuận tiếp nhận.',
        counterNote: 'Ô số 3 (Đ/c Trần Đặng Bích Thuận)'
      },
      {
        stepNumber: 2,
        title: 'Xác minh và thẩm định',
        description: 'UBND Phường phối hợp cùng các ban ngành kiểm tra điều kiện thực tế.',
        counterNote: 'Địa bàn phường'
      },
      {
        stepNumber: 3,
        title: 'Nhận văn bản chấp thuận',
        description: 'Nhận văn bản thông báo kết quả chấp thuận tại Ô số 3.',
        counterNote: 'Ô số 3'
      }
    ],
    legalBasis: ['Luật Tín ngưỡng, tôn giáo năm 2016'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000210'
  },

  // 4. Đăng ký Hộ kinh doanh & An toàn thực phẩm (Ô số 4)
  {
    id: 'srv-ho-kinh-doanh-moi',
    wardId: 'ward-sontra',
    code: '1.000301',
    name: 'Đăng ký Thành lập Hộ kinh doanh cá thể (Quán ăn, Tạp hóa, Cửa hàng)',
    category: 'kinh_doanh_attp',
    level: 'toan_trinh',
    counterId: 'counter-4',
    summary: 'Cấp Giấy chứng nhận đăng ký hộ kinh doanh cá thể cho cá nhân, hộ gia đình kinh doanh buôn bán trên địa bàn phường.',
    processingDuration: '03 ngày làm việc',
    fee: '100.000 VNĐ / lần cấp',
    audioScript: 'Chào Bác! Bác muốn mở tiệm tạp hóa, quán ăn, quán cà phê hoặc dịch vụ tại nhà thì cần đăng ký Hộ kinh doanh. Bác chuẩn bị Căn cước công dân và hợp đồng thuê nhà hoặc sổ đỏ rồi đến Ô số 4 gặp đồng chí Lê Thị Hồng Hạnh. Đồng chí Hạnh sẽ hỗ trợ Bác viết đơn và điền ngành nghề phù hợp.',
    searchKeywords: ['hộ kinh doanh', 'mở quán', 'quán ăn', 'tiệm tạp hóa', 'giấy phép kinh doanh', 'buôn bán'],
    isPopular: true,
    requiredDocuments: [
      {
        id: 'doc-hkd-1',
        name: 'Giấy đề nghị đăng ký hộ kinh doanh',
        note: 'Theo mẫu chuẩn quy định tại Thông tư 02/2023/TT-BKHĐT, có phát sẵn tại quầy.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-hkd-2',
        name: 'Bản sao Thẻ Căn cước công dân của chủ hộ kinh doanh',
        note: 'Bản sao chứng thực hoặc xuất trình bản chính để đối chiếu.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: true
      },
      {
        id: 'doc-hkd-3',
        name: 'Giấy tờ chứng minh quyền sử dụng địa điểm kinh doanh (Sổ đỏ hoặc Hợp đồng thuê mặt bằng)',
        note: 'Bản sao photo.',
        isRequired: true,
        isOriginal: false,
        isCopyOrCertified: false
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp hồ sơ tại Ô số 4',
        description: 'Bác đến Ô số 4 gặp Đ/c Lê Thị Hồng Hạnh để nộp Giấy đề nghị và nhận giấy hẹn trả kết quả.',
        counterNote: 'Ô số 4 (Đ/c Lê Thị Hồng Hạnh)'
      },
      {
        stepNumber: 2,
        title: 'Cán bộ thụ lý và liên thông mã số thuế',
        description: 'Hồ sơ được liên thông với cơ quan Thuế để cấp mã số thuế tự động cho hộ kinh doanh.',
        counterNote: 'Hệ thống liên thông'
      },
      {
        stepNumber: 3,
        title: 'Nhận Giấy chứng nhận Đăng ký Hộ kinh doanh',
        description: 'Theo ngày hẹn trên phiếu tiếp nhận, Bác đến Ô số 4 nhận Giấy phép kinh doanh và nộp lệ phí.',
        counterNote: 'Ô số 4'
      }
    ],
    legalBasis: ['Nghị định 01/2021/NĐ-CP về đăng ký doanh nghiệp'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000301'
  },

  {
    id: 'srv-an-toan-thuc-pham',
    wardId: 'ward-sontra',
    code: '1.000305',
    name: 'Cấp Giấy chứng nhận Cơ sở đủ điều kiện An toàn Thực phẩm',
    category: 'kinh_doanh_attp',
    level: 'mot_phan',
    counterId: 'counter-4',
    summary: 'Thẩm định và cấp chứng nhận đủ điều kiện an toàn vệ sinh thực phẩm đối với cơ sở dịch vụ ăn uống, quán ăn, quán giải khát.',
    processingDuration: '15 ngày làm việc (bao gồm thẩm định thực tế)',
    fee: '700.000 VNĐ / lần thẩm định cơ sở theo quy định Bộ Tài chính',
    audioScript: 'Chào Bác! Với các cơ sở kinh doanh dịch vụ ăn uống, sau khi có giấy phép hộ kinh doanh, Bác nộp hồ sơ an toàn thực phẩm tại Ô số 4 cho đồng chí Lê Thị Hồng Hạnh. Đoàn thẩm định của phường sẽ đến kiểm tra bếp ăn, nguồn gốc nguyên liệu và cấp chứng nhận.',
    searchKeywords: ['an toàn thực phẩm', 'vệ sinh an toàn thực phẩm', 'quán cơm', 'bếp ăn', 'chứng nhận attp'],
    isPopular: false,
    requiredDocuments: [
      {
        id: 'doc-attp-1',
        name: 'Đơn đề nghị cấp Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm',
        note: 'Theo mẫu quy định.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-attp-2',
        name: 'Bản sao Giấy chứng nhận đăng ký hộ kinh doanh',
        note: 'Có ngành nghề kinh doanh dịch vụ ăn uống.',
        isRequired: true,
        isOriginal: false,
        isCopyOrCertified: true
      },
      {
        id: 'doc-attp-3',
        name: 'Bản thuyết minh cơ sở vật chất, trang thiết bị và quy trình chế biến',
        note: 'Kèm sơ đồ bố trí khu chế biến ăn uống 1 chiều.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-attp-4',
        name: 'Giấy xác nhận tập huấn kiến thức an toàn thực phẩm của chủ cơ sở và nhân viên',
        note: 'Bản sao có chứng thực.',
        isRequired: true,
        isOriginal: false,
        isCopyOrCertified: true
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp hồ sơ tại Ô số 4',
        description: 'Đ/c Lê Thị Hồng Hạnh tiếp nhận hồ sơ, kiểm tra tính đầy đủ và lập lịch thẩm định.',
        counterNote: 'Ô số 4'
      },
      {
        stepNumber: 2,
        title: 'Đoàn kiểm tra thẩm định thực tế tại quán',
        description: 'Đoàn cán bộ y tế và phường đến cơ sở kiểm tra điều kiện bảo quản, chế biến thực phẩm.',
        counterNote: 'Tại cơ sở kinh doanh'
      },
      {
        stepNumber: 3,
        title: 'Nhận Giấy chứng nhận ATTP',
        description: 'Sau khi có biên bản đạt yêu cầu, Bác đến Ô số 4 nhận Giấy chứng nhận có giá trị 3 năm.',
        counterNote: 'Ô số 4'
      }
    ],
    legalBasis: ['Luật An toàn thực phẩm năm 2010', 'Nghị định 15/2018/NĐ-CP'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000305'
  },

  // 5. Văn hóa - Giáo dục - Y tế - Chính sách Xã hội (Ô số 5)
  {
    id: 'srv-tro-cap-nguoi-cao-tuoi',
    wardId: 'ward-sontra',
    code: '1.000412',
    name: 'Thủ tục Hưởng Trợ cấp Xã hội hàng tháng cho Người Cao tuổi',
    category: 'van_hoa_giao_duc_y_te',
    level: 'mot_phan',
    counterId: 'counter-5',
    summary: 'Chế độ trợ cấp tiền mặt hàng tháng và cấp thẻ Bảo hiểm Y tế miễn phí cho người cao tuổi từ đủ 75-80 tuổi (hộ nghèo/cận nghèo) hoặc từ đủ 80 tuổi trở lên.',
    processingDuration: '15 ngày làm việc',
    fee: 'Miễn phí 100%',
    audioScript: 'Kính chúc Bác luôn dồi dào sức khỏe! Bác hoặc con cháu trong nhà muốn làm hồ sơ hưởng trợ cấp người cao tuổi, Bác chỉ cần mang theo Căn cước công dân đến nộp tại Ô số 5, gặp đồng chí Hà Vương. Phường sẽ hỗ trợ Bác điền mẫu đơn tờ khai thông tin và cấp thẻ Bảo hiểm Y tế miễn phí đi kèm.',
    searchKeywords: ['người cao tuổi', 'trợ cấp người già', 'trợ cấp xã hội', '80 tuổi', 'thẻ bhyt miễn phí', 'bảo trợ xã hội'],
    isPopular: true,
    requiredDocuments: [
      {
        id: 'doc-nct-1',
        name: 'Tờ khai thông tin người cao tuổi đề nghị hưởng trợ cấp xã hội',
        note: 'Theo mẫu 1a (Nghị định 20/2021/NĐ-CP), cán bộ Ô số 5 sẽ hỗ trợ điền trực tiếp cho Bác.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-nct-2',
        name: 'Thẻ Căn cước công dân của người cao tuổi',
        note: 'Bản sao kèm bản chính để đối chiếu độ tuổi.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: true
      },
      {
        id: 'doc-nct-3',
        name: 'Sổ hộ nghèo hoặc cận nghèo (nếu từ đủ 75 đến dưới 80 tuổi)',
        note: 'Đối với người từ đủ 80 tuổi trở lên không có lương hưu thì không cần sổ hộ nghèo.',
        isRequired: false,
        isOriginal: true,
        isCopyOrCertified: true
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp hồ sơ tại Ô số 5',
        description: 'Bác hoặc người đại diện đến Ô số 5 gặp Đ/c Hà Vương để tiếp nhận hồ sơ.',
        counterNote: 'Ô số 5 (Đ/c Hà Vương)'
      },
      {
        stepNumber: 2,
        title: 'Hội đồng xét duyệt trợ cấp xã hội thẩm định',
        description: 'Hội đồng xét duyệt phường họp xem xét và niêm yết công khai danh sách.',
        counterNote: 'UBND Phường Sơn Trà'
      },
      {
        stepNumber: 3,
        title: 'Nhận Quyết định trợ cấp và Thẻ BHYT',
        description: 'Nhận Quyết định trợ cấp hàng tháng và nhận tiền trợ cấp qua tài khoản ngân hàng hoặc nhận tiền mặt tại điểm chi trả bưu điện.',
        counterNote: 'Ô số 5 & Điểm bưu điện'
      }
    ],
    legalBasis: ['Nghị định 20/2021/NĐ-CP của Chính phủ'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000412'
  },

  {
    id: 'srv-tro-cap-khuyet-tat',
    wardId: 'ward-sontra',
    code: '1.000415',
    name: 'Xác định Mức độ Khuyết tật và Cấp Giấy xác nhận Khuyết tật',
    category: 'van_hoa_giao_duc_y_te',
    level: 'mot_phan',
    counterId: 'counter-5',
    summary: 'Đánh giá mức độ khuyết tật, cấp giấy xác nhận và trợ cấp nuôi dưỡng, hỗ trợ người chăm sóc người khuyết tật đặc biệt nặng.',
    processingDuration: '30 ngày làm việc (do cần Hội đồng giám định y khoa họp xét)',
    fee: 'Miễn phí',
    audioScript: 'Chào Bác! Để làm thủ tục xác định mức độ khuyết tật, người nhà hoặc người khuyết tật mang theo bệnh án của bệnh viện và Căn cước công dân đến Ô số 5 gặp đồng chí Hà Vương. Phường sẽ hướng dẫn thủ tục để Hội đồng họp đánh giá và cấp chế độ theo đúng quy định.',
    searchKeywords: ['khuyết tật', 'người tàn tật', 'chất độc da cam', 'trợ cấp khuyết tật', 'giám định y khoa'],
    isPopular: false,
    requiredDocuments: [
      {
        id: 'doc-ktat-1',
        name: 'Đơn đề nghị xác định, xác định lại mức độ khuyết tật',
        note: 'Theo mẫu quy định.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-ktat-2',
        name: 'Bản sao kết luận của cơ sở y tế, bệnh án (nếu có)',
        note: 'Giấy ra viện, giấy giám định y khoa trước đây.',
        isRequired: false,
        isOriginal: false,
        isCopyOrCertified: true
      },
      {
        id: 'doc-ktat-3',
        name: 'Bản sao Căn cước công dân',
        note: 'Của người khuyết tật và người đại diện.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: true
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp hồ sơ tại Ô số 5',
        description: 'Đ/c Hà Vương hướng dẫn điền đơn và nhận hồ sơ ban đầu.',
        counterNote: 'Ô số 5'
      },
      {
        stepNumber: 2,
        title: 'Hội đồng phường họp đánh giá dạng tật',
        description: 'Mời công dân đến tham dự phiên họp đánh giá trực tiếp dạng tật và mức độ khuyết tật.',
        counterNote: 'Hội trường UBND Phường'
      },
      {
        stepNumber: 3,
        title: 'Cấp Giấy xác nhận và ra Quyết định trợ cấp',
        description: 'Công dân nhận Giấy xác nhận khuyết tật và quyết định hưởng tiền trợ cấp hàng tháng.',
        counterNote: 'Ô số 5'
      }
    ],
    legalBasis: ['Luật Người khuyết tật năm 2010', 'Thông tư 01/2019/TT-BLĐTBXH'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000415'
  },

  {
    id: 'srv-mien-giam-hoc-phi',
    wardId: 'ward-sontra',
    code: '1.000418',
    name: 'Xác nhận Đơn xin Miễn, Giảm Học phí và Hỗ trợ Chi phí học tập',
    category: 'van_hoa_giao_duc_y_te',
    level: 'truc_tiep',
    counterId: 'counter-5',
    summary: 'Xác nhận chính sách miễn giảm học phí cho học sinh, sinh viên thuộc diện hộ nghèo, cận nghèo hoặc mồ côi.',
    processingDuration: 'Trong ngày làm việc',
    fee: 'Miễn phí',
    audioScript: 'Chào Bác! Bác đến làm đơn xác nhận miễn giảm học phí cho con cháu đang đi học, Bác mang theo đơn xin miễn giảm có dán ảnh và sổ hộ nghèo hoặc giấy chứng nhận hoàn cảnh khó khăn đến Ô số 5 gặp đồng chí Hà Vương. Thủ tục được ký xác nhận và đóng dấu ngay trong ngày.',
    searchKeywords: ['miễn giảm học phí', 'học sinh sinh viên', 'hỗ trợ chi phí học tập', 'hộ nghèo đi học'],
    isPopular: true,
    requiredDocuments: [
      {
        id: 'doc-hp-1',
        name: 'Đơn đề nghị miễn, giảm học phí (theo mẫu của nhà trường)',
        note: 'Có ghi rõ thông tin lớp học, trường học của học sinh, sinh viên.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-hp-2',
        name: 'Sổ hộ nghèo hoặc giấy tờ chứng minh đối tượng chính sách',
        note: 'Bản chính để đối chiếu.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp đơn tại Ô số 5',
        description: 'Nộp đơn cho Đ/c Hà Vương để đối chiếu với danh sách quản lý hộ nghèo của phường.',
        counterNote: 'Ô số 5'
      },
      {
        stepNumber: 2,
        title: 'Ký duyệt và đóng dấu xác nhận',
        description: 'Lãnh đạo UBND Phường ký xác nhận và đóng dấu đỏ để nộp về trường học.',
        counterNote: 'Ô số 5'
      }
    ],
    legalBasis: ['Nghị định 81/2021/NĐ-CP của Chính phủ'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000418'
  },

  // 6. Công Thương, TTHC khác (Ô số 6)
  {
    id: 'srv-ban-le-thuoc-la-ruou',
    wardId: 'ward-sontra',
    code: '1.000502',
    name: 'Cấp Giấy phép Bán lẻ Sản phẩm Thuốc lá / Rượu, Bia',
    category: 'cong_thuong_khac',
    level: 'mot_phan',
    counterId: 'counter-6',
    summary: 'Cấp phép cho hộ kinh doanh, cửa hàng bán lẻ thuốc lá và đồ uống có cồn theo quy định quản lý thương mại.',
    processingDuration: '10 ngày làm việc',
    fee: '1.200.000 VNĐ / giấy phép (theo biểu phí Bộ Công Thương)',
    audioScript: 'Chào Bác! Để được cấp Giấy phép bán lẻ thuốc lá hoặc đồ uống có cồn, Bác mang theo Giấy phép hộ kinh doanh và hợp đồng nguyên tắc với nhà phân phối đến Ô số 6 gặp đồng chí Phạm Thị Thái Nguyên. Đồng chí Nguyên sẽ hướng dẫn Bác hoàn thiện hồ sơ theo quy chuẩn.',
    searchKeywords: ['bán lẻ thuốc lá', 'bán rượu', 'giấy phép thuốc lá', 'công thương', 'kinh doanh đồ uống'],
    isPopular: false,
    requiredDocuments: [
      {
        id: 'doc-tl-1',
        name: 'Đơn đề nghị cấp Giấy phép bán lẻ sản phẩm thuốc lá / rượu',
        note: 'Theo mẫu của Bộ Công Thương.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-tl-2',
        name: 'Bản sao Giấy chứng nhận đăng ký hộ kinh doanh',
        note: 'Có đăng ký ngành nghề bán lẻ sản phẩm thuốc lá, rượu bia.',
        isRequired: true,
        isOriginal: false,
        isCopyOrCertified: true
      },
      {
        id: 'doc-tl-3',
        name: 'Văn bản giới thiệu hoặc hợp đồng mua bán của thương nhân phân phối',
        note: 'Bản sao có công chứng hoặc mộc đỏ của nhà phân phối.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Nộp hồ sơ tại Ô số 6',
        description: 'Đ/c Phạm Thị Thái Nguyên kiểm tra hồ sơ và hướng dẫn công dân hoàn thiện.',
        counterNote: 'Ô số 6 (Đ/c Phạm Thị Thái Nguyên)'
      },
      {
        stepNumber: 2,
        title: 'Thẩm định hồ sơ và phối hợp kiểm tra điều kiện',
        description: 'Kiểm tra khoảng cách địa điểm kinh doanh theo quy định gần trường học, bệnh viện.',
        counterNote: 'Bộ phận Kinh tế'
      },
      {
        stepNumber: 3,
        title: 'Trả kết quả Giấy phép bán lẻ',
        description: 'Nhận Giấy phép bán lẻ có thời hạn 05 năm tại Ô số 6.',
        counterNote: 'Ô số 6'
      }
    ],
    legalBasis: ['Nghị định 67/2013/NĐ-CP', 'Nghị định 105/2017/NĐ-CP'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=1.000502'
  },

  {
    id: 'srv-ho-tro-vneid-dvc',
    wardId: 'ward-sontra',
    code: '1.000601',
    name: 'Hỗ trợ Cài đặt VNeID Mức 2 và Nộp Hồ sơ Trực tuyến Toàn trình',
    category: 'huong_dan_ho_tro',
    level: 'toan_trinh',
    counterId: 'counter-6',
    summary: 'Chuyên viên trực tiếp cầm tay chỉ việc hỗ trợ người cao tuổi cài đặt định danh điện tử VNeID mức 2, kích hoạt chữ ký số cá nhân và nộp hồ sơ qua điện thoại.',
    processingDuration: 'Xử lý ngay tại chỗ (khoảng 10-15 phút)',
    fee: 'Miễn phí 100%',
    audioScript: 'Chào Bác! Nếu Bác chưa quen dùng điện thoại thông minh hoặc chưa biết cách nộp hồ sơ trực tuyến trên mạng, Bác hãy đến Ô số 6 gặp cô Nguyên hoặc Quầy Hướng dẫn gặp chú Đại. Cán bộ phường sẽ hướng dẫn từng bước, cài đặt tài khoản VNeID và nộp hồ sơ thay Bác hoàn toàn miễn phí.',
    searchKeywords: ['vneid', 'định danh điện tử', 'nộp hồ sơ online', 'hướng dẫn người già dùng mạng', 'chữ ký số', 'dịch vụ công trực tuyến'],
    isPopular: true,
    requiredDocuments: [
      {
        id: 'doc-vneid-1',
        name: 'Thẻ Căn cước công dân gắn chip',
        note: 'Bản chính để quét NFC trên điện thoại.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      },
      {
        id: 'doc-vneid-2',
        name: 'Điện thoại di động cá nhân có số điện thoại chính chủ',
        note: 'Để nhận mã xác thực OTP gửi về tin nhắn.',
        isRequired: true,
        isOriginal: true,
        isCopyOrCertified: false
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Đến Ô số 6 hoặc Quầy Tiếp đón',
        description: 'Cán bộ tiếp nhận điện thoại và hướng dẫn Bác tải ứng dụng VNeID / Cổng DVC Quốc gia.',
        counterNote: 'Ô số 6 (Đ/c Nguyên) & Quầy hướng dẫn (Đ/c Đại)'
      },
      {
        stepNumber: 2,
        title: 'Kích hoạt tài khoản và hướng dẫn thao tác',
        description: 'Hỗ trợ quét chip CCCD, nhận diện khuôn mặt và đặt mật khẩu dễ nhớ cho Bác.',
        counterNote: 'Ô số 6'
      },
      {
        stepNumber: 3,
        title: 'Nộp thử hồ sơ mẫu và in hướng dẫn ghi nhớ',
        description: 'In sẵn bản hướng dẫn chữ to có ghi mã số và số hotline hỗ trợ để Bác mang về nhà.',
        counterNote: 'Ô số 6'
      }
    ],
    legalBasis: ['Đề án 06 của Thủ tướng Chính phủ về Chuyển đổi số quốc gia'],
    nationalPortalUrl: 'https://dichvucong.gov.vn/'
  }
];

export const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  tu_phap_ho_tich: {
    label: 'Tư pháp và hộ tịch',
    icon: 'FileText',
    color: 'bg-blue-500 text-white',
    desc: 'Khai sinh, kết hôn, khai tử, trích lục, chứng thực giấy tờ, sơ yếu lý lịch'
  },
  kinh_doanh_attp: {
    label: 'Hộ kinh doanh và an toàn thực phẩm',
    icon: 'Store',
    color: 'bg-emerald-600 text-white',
    desc: 'Đăng ký kinh doanh quán ăn, cửa hàng, cấp chứng nhận an toàn thực phẩm'
  },
  van_hoa_giao_duc_y_te: {
    label: 'Văn hóa, y tế và xã hội',
    icon: 'HeartHandshake',
    color: 'bg-teal-600 text-white',
    desc: 'Trợ cấp người cao tuổi, người khuyết tật, BHYT, miễn giảm học phí'
  },
  dan_toc_ton_giao_noi_vu: {
    label: 'Dân tộc và tôn giáo',
    icon: 'Landmark',
    color: 'bg-purple-600 text-white',
    desc: 'Sinh hoạt tôn giáo tập trung, lễ hội tín ngưỡng, thi đua khen thưởng'
  },
  cong_thuong_khac: {
    label: 'Công thương và lĩnh vực khác',
    icon: 'ShoppingBag',
    color: 'bg-amber-600 text-white',
    desc: 'Cấp phép bán lẻ rượu, thuốc lá, các thủ tục kinh tế thương mại'
  },
  huong_dan_ho_tro: {
    label: 'Trợ giúp số và VNeID',
    icon: 'Smartphone',
    color: 'bg-indigo-600 text-white',
    desc: 'Hỗ trợ cài đặt VNeID mức 2, nộp hồ sơ trực tuyến, lấy số thứ tự tự động'
  }
};
