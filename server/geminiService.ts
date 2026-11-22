import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export interface ServiceContextDoc {
  name: string;
  note?: string;
  isRequired?: boolean;
  isOriginal?: boolean;
  sampleFormName?: string;
}

export interface ServiceContextStep {
  stepNumber: number;
  title: string;
  description: string;
  counterNote?: string;
}

export interface ServiceContextItem {
  id: string;
  code: string;
  name: string;
  category: string;
  level: string;
  counterId: string;
  summary: string;
  processingDuration: string;
  fee: string;
  requiredDocuments: ServiceContextDoc[];
  steps: ServiceContextStep[];
  legalBasis?: string[];
  faq?: Array<{ question: string; answer: string }>;
  nationalPortalUrl?: string;
}

export interface CounterContextItem {
  id: string;
  code: string;
  name: string;
  officerName: string;
  primaryField: string;
  positionNumber: number;
}

export interface WardContextItem {
  id: string;
  name: string;
  address: string;
  hotline: string;
  workingHours: string;
  supportOfficer?: string;
}

export interface ChatHistoryTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface AskCitizenRequest {
  question: string;
  history?: ChatHistoryTurn[];
  ward?: WardContextItem;
  counters?: CounterContextItem[];
  services?: ServiceContextItem[];
}

export interface AskCitizenStructuredAnswer {
  answer: string;
  spokenSummary: string;
  matchedServiceId: string;
  counterInfo: string;
  requiredFormsAndDocs: string[];
  stepByStepGuide: string[];
  feeAndDuration: string;
  legalRegulations: string[];
  followUpSuggestions: string[];
}

export interface AskCitizenError {
  status: number;
  code: string;
  error: string;
}

export type AskCitizenResult =
  | { ok: true; data: AskCitizenStructuredAnswer }
  | { ok: false; error: AskCitizenError };

function sanitizeString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function buildCatalogContext(body: AskCitizenRequest): string {
  const ward = body.ward;
  const counters = Array.isArray(body.counters) ? body.counters.slice(0, 20) : [];
  const services = Array.isArray(body.services) ? body.services.slice(0, 40) : [];

  const counterMap = new Map<string, CounterContextItem>();
  counters.forEach((c) => {
    if (c && typeof c.id === 'string') {
      counterMap.set(c.id, c);
    }
  });

  const wardBlock = ward
    ? `ĐƠN VỊ TIẾP NHẬN: UBND ${sanitizeString(ward.name, 120)}
Địa chỉ: ${sanitizeString(ward.address, 250)}
Hotline hỗ trợ: ${sanitizeString(ward.hotline, 60)}
Giờ làm việc: ${sanitizeString(ward.workingHours, 160)}
Cán bộ hỗ trợ đầu vào: ${sanitizeString(ward.supportOfficer || '', 120)}`
    : 'ĐƠN VỊ TIẾP NHẬN: Bộ phận Một cửa UBND Phường Sơn Trà, TP. Đà Nẵng.';

  const countersBlock = counters
    .map(
      (c) =>
        `- ${sanitizeString(c.code, 40)} (Bàn ${Number(c.positionNumber) || 1}): ${sanitizeString(c.name, 150)} | Lĩnh vực: ${sanitizeString(c.primaryField, 120)} | Cán bộ: ${sanitizeString(c.officerName, 120)}`
    )
    .join('\n');

  const servicesBlock = services
    .map((s) => {
      const counter = counterMap.get(s.counterId);
      const docs = Array.isArray(s.requiredDocuments)
        ? s.requiredDocuments
            .slice(0, 10)
            .map((d) => {
              const formInfo = d.sampleFormName ? ` [Biểu mẫu: ${sanitizeString(d.sampleFormName, 120)}]` : '';
              const reqInfo = d.isRequired ? 'Bắt buộc' : 'Nếu có';
              const origInfo = d.isOriginal ? 'Bản chính/xuất trình' : 'Bản sao';
              return `  * ${sanitizeString(d.name, 180)} (${reqInfo}, ${origInfo}${formInfo})${d.note ? ` - ${sanitizeString(d.note, 220)}` : ''}`;
            })
            .join('\n')
        : '';
      const steps = Array.isArray(s.steps)
        ? s.steps
            .slice(0, 8)
            .map(
              (st) =>
                `  * Bước ${Number(st.stepNumber) || 1}: ${sanitizeString(st.title, 150)} - ${sanitizeString(st.description, 260)}${st.counterNote ? ` (${sanitizeString(st.counterNote, 100)})` : ''}`
            )
            .join('\n')
        : '';
      const legal = Array.isArray(s.legalBasis)
        ? s.legalBasis.slice(0, 8).map((l) => sanitizeString(l, 160)).join('; ')
        : '';
      const faq = Array.isArray(s.faq)
        ? s.faq
            .slice(0, 5)
            .map((f) => `  * Hỏi: ${sanitizeString(f.question, 200)} -> Đáp: ${sanitizeString(f.answer, 320)}`)
            .join('\n')
        : '';

      return `ID: ${sanitizeString(s.id, 60)} | Mã TTHC: ${sanitizeString(s.code, 40)} | Tên: ${sanitizeString(s.name, 200)}
Nơi nộp: ${counter ? `${sanitizeString(counter.code, 40)} - Bàn ${counter.positionNumber} (${sanitizeString(counter.officerName, 100)})` : sanitizeString(s.counterId, 60)}
Mức độ DVC: ${sanitizeString(s.level, 40)} | Thời hạn: ${sanitizeString(s.processingDuration, 140)} | Lệ phí: ${sanitizeString(s.fee, 160)}
Tóm tắt: ${sanitizeString(s.summary, 350)}
Giấy tờ & Mẫu biểu:
${docs || '  * Mang theo CCCD gắn chip để đối chiếu.'}
Các bước thực hiện:
${steps || '  * Liên hệ Quầy Hướng dẫn để lấy số thứ tự và nộp tại ô chuyên môn.'}
Căn cứ pháp lý: ${legal || 'Theo quy định pháp luật hiện hành'}
${faq ? `Câu hỏi thường gặp:\n${faq}` : ''}
Link Cổng DVC Quốc gia: ${sanitizeString(s.nationalPortalUrl || '', 300)}`;
    })
    .join('\n\n---\n\n');

  return `${wardBlock}\n\nDANH SÁCH CÁC Ô TIẾP NHẬN & CÁN BỘ:\n${countersBlock}\n\nCƠ SỞ DỮ LIỆU THỦ TỤC HÀNH CHÍNH TẠI ĐƠN VỊ:\n${servicesBlock}`;
}

export async function askCitizenAssistant(body: AskCitizenRequest): Promise<AskCitizenResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: {
        status: 503,
        code: 'MISSING_API_KEY',
        error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng thêm GEMINI_API_KEY trong phần Settings > Secrets (hoặc biến môi trường máy chủ).'
      }
    };
  }

  const question = sanitizeString(body?.question, 1000);
  if (!question) {
    return {
      ok: false,
      error: {
        status: 400,
        code: 'INVALID_QUESTION',
        error: 'Vui lòng nhập hoặc nói câu hỏi cần tra cứu.'
      }
    };
  }

  const catalogText = buildCatalogContext(body);
  const historyLines = Array.isArray(body.history)
    ? body.history
        .slice(-6)
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string')
        .map((m) => `${m.role === 'user' ? 'Công dân hỏi' : 'Trợ lý đã trả lời'}: ${sanitizeString(m.text, 700)}`)
        .join('\n')
    : '';

  const systemInstruction = `Bạn là Trợ lý AI Hướng dẫn Thủ tục Hành chính Công thân thiện dành riêng cho người cao tuổi và người dân ít tiếp xúc công nghệ tại Bộ phận Một cửa UBND Phường.

NGUYÊN TẮC BẮT BUỘC:
1. Xưng hô lễ phép, ấm áp: luôn xưng "cháu", gọi người dân là "Bác". Câu văn ngắn gọn, rõ ràng, dễ hiểu, không dùng từ ngữ kỹ thuật rối rắm.
2. Căn cứ chính xác vào CƠ SỞ DỮ LIỆU DỊCH VỤ CÔNG của phường được cung cấp bên dưới (đúng ô số, số bàn, tên cán bộ, số hotline, thời hạn giải quyết, mức phí/lệ phí, danh sách giấy tờ, mẫu tờ khai) VÀ đúng quy định pháp luật hiện hành của Nhà nước Việt Nam (Luật Hộ tịch 2014, Nghị định 123/2015/NĐ-CP, Thông tư 04/2020/TT-BTP, Nghị định 23/2015/NĐ-CP về chứng thực, Luật Bảo hiểm xã hội 2024, Nghị định 176/2025/NĐ-CP về trợ cấp hưu trí xã hội, Nghị định 20/2021/NĐ-CP, Nghị định 01/2021/NĐ-CP, Đề án 06/VNeID...).
3. Nếu người dân hỏi về form mẫu / tờ khai: nêu rõ tên mẫu tờ khai theo quy định, đồng thời trấn an rằng Bác không cần tự tải hay in ở nhà — tại Quầy Hướng dẫn (Đ/c Phạm Duy Đại) sẽ phát mẫu miễn phí và viết hộ cho người cao tuổi, và Khu Tiện ích (Đ/c Mai Thị Thanh Tâm) hỗ trợ photocopy miễn phí.
4. Nếu thủ tục nằm ngoài danh mục của phường hoặc thuộc thẩm quyền cơ quan khác (ví dụ: cấp/đổi Căn cước công dân do Công an thực hiện; đăng ký biến động đất đai/cấp sổ đỏ lần đầu tại Văn phòng Đăng ký Đất đai; cấp đổi hộ chiếu trên Cổng DVC Bộ Công an): trả lời trung thực, rõ ràng đúng quy định Nhà nước và chỉ đúng cơ quan tiếp nhận, tuyệt đối KHÔNG bịa số ô hoặc lệ phí sai.
5. Định dạng văn bản thuần (PLAIN TEXT) trong "answer" và "spokenSummary": KHÔNG dùng ký tự Markdown như **, *, #, dấu gạch đầu dòng -, hay URL dài, để hệ thống đọc to bằng giọng nói tiếng Việt nghe tự nhiên và rõ ràng cho người lớn tuổi. Ghi rõ khoảng số bằng chữ "từ ... đến ..." trong câu nói (ví dụ "từ 15 đến 30 phút").
6. Nếu câu hỏi khớp với một thủ tục trong cơ sở dữ liệu, điền chính xác "matchedServiceId" bằng ID tương ứng (ví dụ "srv-khai-sinh"); nếu không khớp trực tiếp thủ tục nào, để chuỗi rỗng "".`;

  const userPrompt = `${catalogText}

${historyLines ? `LỊCH SỬ HỘI THOẠI GẦN ĐÂY:\n${historyLines}\n\n` : ''}CÂU HỎI HIỆN TẠI CỦA BÁC: "${question}"

Hãy phân tích câu hỏi dựa trên cơ sở dữ liệu dịch vụ công của phường và quy định Nhà nước để trả về JSON đúng cấu trúc.`;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: userPrompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: 'Câu trả lời đầy đủ, thân thiện bằng văn bản thuần (không Markdown), xưng cháu gọi Bác.'
            },
            spokenSummary: {
              type: Type.STRING,
              description: 'Đoạn tóm tắt ngắn 2-4 câu tự nhiên để đọc to cho người cao tuổi nghe ngay.'
            },
            matchedServiceId: {
              type: Type.STRING,
              description: 'ID thủ tục khớp nhất trong cơ sở dữ liệu (ví dụ srv-khai-sinh), hoặc chuỗi rỗng nếu không có.'
            },
            counterInfo: {
              type: Type.STRING,
              description: 'Nơi tiếp nhận và tên cán bộ phụ trách (hoặc cơ quan có thẩm quyền nếu ngoài phường).'
            },
            requiredFormsAndDocs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Danh sách giấy tờ cần chuẩn bị và tên form mẫu quy định.'
            },
            stepByStepGuide: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Cách thức thực hiện từng bước thật ngắn gọn, dễ làm theo.'
            },
            feeAndDuration: {
              type: Type.STRING,
              description: 'Mức lệ phí và thời hạn giải quyết theo quy định.'
            },
            legalRegulations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Các văn bản quy định của Nhà nước làm căn cứ.'
            },
            followUpSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 câu hỏi gợi ý ngắn gọn tiếp theo để Bác bấm hỏi tiếp.'
            }
          },
          required: [
            'answer',
            'spokenSummary',
            'matchedServiceId',
            'counterInfo',
            'requiredFormsAndDocs',
            'stepByStepGuide',
            'feeAndDuration',
            'legalRegulations',
            'followUpSuggestions'
          ]
        }
      }
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return {
        ok: false,
        error: {
          status: 502,
          code: 'EMPTY_RESPONSE',
          error: 'Trợ lý Gemini chưa trả về nội dung. Bác vui lòng thử gửi lại câu hỏi nhé.'
        }
      };
    }

    const parsed = JSON.parse(rawText) as AskCitizenStructuredAnswer;
    return {
      ok: true,
      data: {
        answer: sanitizeString(parsed.answer, 4000),
        spokenSummary: sanitizeString(parsed.spokenSummary || parsed.answer, 1200),
        matchedServiceId: sanitizeString(parsed.matchedServiceId || '', 80),
        counterInfo: sanitizeString(parsed.counterInfo || '', 300),
        requiredFormsAndDocs: Array.isArray(parsed.requiredFormsAndDocs)
          ? parsed.requiredFormsAndDocs.map((x) => sanitizeString(x, 300)).filter(Boolean)
          : [],
        stepByStepGuide: Array.isArray(parsed.stepByStepGuide)
          ? parsed.stepByStepGuide.map((x) => sanitizeString(x, 350)).filter(Boolean)
          : [],
        feeAndDuration: sanitizeString(parsed.feeAndDuration || '', 300),
        legalRegulations: Array.isArray(parsed.legalRegulations)
          ? parsed.legalRegulations.map((x) => sanitizeString(x, 220)).filter(Boolean)
          : [],
        followUpSuggestions: Array.isArray(parsed.followUpSuggestions)
          ? parsed.followUpSuggestions.slice(0, 4).map((x) => sanitizeString(x, 120)).filter(Boolean)
          : []
      }
    };
  } catch (err: unknown) {
    const errObj = err as { status?: number; message?: string };
    const status = typeof errObj?.status === 'number' ? errObj.status : 500;
    const message = errObj?.message || 'Lỗi kết nối đến dịch vụ Gemini.';

    if (status === 400 || status === 401 || status === 403 || /API_KEY|PERMISSION_DENIED/i.test(message)) {
      return {
        ok: false,
        error: {
          status: status === 401 || status === 403 ? status : 400,
          code: 'API_KEY_INVALID',
          error: 'Khóa GEMINI_API_KEY chưa hợp lệ hoặc chưa đủ quyền. Vui lòng kiểm tra lại cấu hình trong Settings > Secrets.'
        }
      };
    }

    if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(message)) {
      return {
        ok: false,
        error: {
          status: 429,
          code: 'RATE_LIMITED',
          error: 'Hệ thống đang có nhiều lượt hỏi cùng lúc. Bác vui lòng chờ vài giây rồi thử lại ạ.'
        }
      };
    }

    return {
      ok: false,
      error: {
        status: 502,
        code: 'UPSTREAM_ERROR',
        error: 'Không thể kết nối tới trợ lý Gemini lúc này. Bác có thể thử lại hoặc dùng tra cứu danh mục tại chỗ.'
      }
    };
  }
}
