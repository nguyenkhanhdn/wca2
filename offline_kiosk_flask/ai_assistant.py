import json
import os
import re
import unicodedata
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional


def remove_vietnamese_tones(text: str) -> str:
    if not text:
        return ''
    nfd = unicodedata.normalize('NFD', text)
    stripped = ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
    stripped = stripped.replace('đ', 'd').replace('Đ', 'D')
    return stripped.lower().strip()


def _clean_officer_title(officer_raw: str) -> str:
    return re.sub(r'[Đđ]/c\.?\s*', 'đồng chí ', officer_raw or 'Cán bộ phụ trách')


def _clean_service_name(raw_name: str) -> str:
    return re.sub(r'^thủ\s+tục\s+', '', raw_name or '', flags=re.IGNORECASE).strip()


def _format_number_ranges_for_speech(text: str) -> str:
    if not text:
        return ''
    return re.sub(r'(\d+)\s*[-–]\s*(\d+)', r'từ \1 đến \2', text)


def _format_structured_from_service(
    srv: Dict[str, Any],
    counters: List[Dict[str, Any]],
    officers: List[Dict[str, Any]],
    focus: str = 'general',
) -> Dict[str, Any]:
    matched_counter = next(
        (c for c in counters if c.get('id') == srv.get('counterId')),
        counters[0] if counters else {},
    )
    matched_officer = next(
        (o for o in officers if o.get('counterId') == matched_counter.get('id')),
        None,
    )
    if not matched_officer:
        matched_officer = next(
            (o for o in officers if o.get('name') == matched_counter.get('officerName')),
            None,
        )

    officer_raw = matched_counter.get('officerName', 'Cán bộ phụ trách')
    spoken_officer = _clean_officer_title(officer_raw)
    clean_name = _clean_service_name(srv.get('name', ''))
    counter_code = matched_counter.get('code', 'Ô tiếp nhận')
    pos_num = matched_counter.get('positionNumber', 1)
    counter_name = matched_counter.get('name', '')

    docs = srv.get('requiredDocuments', []) or []
    required_forms_and_docs: List[str] = []
    for d in docs:
        d_name = (d.get('name') or '').strip()
        if not d_name:
            continue
        parts = [d_name]
        if d.get('sampleFormName'):
            parts.append(f"Mẫu quy định: {d['sampleFormName']}")
        tag = 'Bắt buộc' if d.get('isRequired') else 'Nếu có'
        orig = 'Bản chính' if d.get('isOriginal') else 'Bản sao'
        parts.append(f"({tag}, {orig})")
        if d.get('note'):
            parts.append(f"- {d['note']}")
        required_forms_and_docs.append(' '.join(parts))

    if not required_forms_and_docs:
        required_forms_and_docs = ['Mang theo Căn cước công dân gắn chip bản chính để cán bộ đối chiếu.']

    # Nhắc hỗ trợ cho người cao tuổi tại Quầy Hướng dẫn & Khu Tiện ích
    required_forms_and_docs.append(
        'Lưu ý cho người cao tuổi: Bác không cần tự tải hay in đơn ở nhà. Quầy Hướng dẫn (Đ/c Phạm Duy Đại) phát mẫu miễn phí và viết hộ tờ khai; Khu Tiện ích (Đ/c Mai Thị Thanh Tâm) hỗ trợ photo miễn phí.'
    )

    steps = srv.get('steps', []) or []
    step_by_step = [
        f"Bước {st.get('stepNumber', idx + 1)}: {st.get('title', '')}. {st.get('description', '')}".strip()
        for idx, st in enumerate(steps)
    ]
    if not step_by_step:
        step_by_step = [
            f'Bước 1: Lấy số thứ tự tại Quầy Hướng dẫn (Đ/c Phạm Duy Đại).',
            f'Bước 2: Nộp hồ sơ tại {counter_code} (Bàn số {pos_num}) gặp {officer_raw}.',
            'Bước 3: Nhận giấy hẹn và nhận kết quả đúng thời hạn quy định.',
        ]

    legal_regs = srv.get('legalBasis') or [
        'Luật và Nghị định hiện hành áp dụng tại Bộ phận Một cửa cấp xã/phường',
        'Đề án 06 Chính phủ về sử dụng VNeID và liên thông dữ liệu dân cư',
    ]

    fee_raw = (srv.get('fee') or 'Theo quy định hiện hành').strip()
    duration_raw = (srv.get('processingDuration') or 'Theo quy định').strip()
    fee_spoken = _format_number_ranges_for_speech(fee_raw)
    duration_spoken = _format_number_ranges_for_speech(duration_raw)
    fee_and_duration = f'Lệ phí: {fee_raw} · Thời hạn giải quyết: {duration_raw}'

    top_docs_spoken = ', '.join([d.get('name', '') for d in docs[:3] if d.get('name')])
    forms_list = [d.get('sampleFormName') for d in docs if d.get('sampleFormName')]

    if focus == 'forms':
        if forms_list:
            forms_text = '; '.join(forms_list)
            answer = (
                f'Dạ thưa Bác, với thủ tục {clean_name}, Bác cần sử dụng mẫu tờ khai theo quy định là: {forms_text}. '
                f'Bác không cần tự in hay viết trước ở nhà đâu ạ. Khi đến UBND phường, Bác ghé ngay Quầy Hướng dẫn gặp đồng chí Phạm Duy Đại để được phát mẫu miễn phí và viết hộ tờ khai, '
                f'nếu cần photo giấy tờ thì Khu Tiện ích của đồng chí Mai Thị Thanh Tâm hỗ trợ photo miễn phí. '
                f'Sau đó Bác nộp tại {counter_code}, Bàn số {pos_num} gặp {spoken_officer}.'
            )
        else:
            answer = (
                f'Dạ thưa Bác, thủ tục {clean_name} không yêu cầu mẫu đơn phức tạp hoặc sẽ được cán bộ hỗ trợ lập trực tiếp trên hệ thống. '
                f'Bác chỉ cần mang theo {top_docs_spoken or "Căn cước công dân"} đến {counter_code}, Bàn số {pos_num} gặp {spoken_officer}. '
                f'Nếu cần viết hộ hoặc photo giấy tờ, Quầy Hướng dẫn và Khu Tiện ích hỗ trợ hoàn toàn miễn phí cho Bác ạ.'
            )
    elif focus == 'fee_duration':
        answer = (
            f'Dạ thưa Bác, thủ tục {clean_name} có mức lệ phí là {fee_spoken}, thời hạn giải quyết là {duration_spoken}. '
            f'Bác nộp hồ sơ tại {counter_code}, Bàn số {pos_num} gặp {spoken_officer} ạ.'
        )
    elif focus == 'steps':
        first_steps = ' '.join(step_by_step[:3])
        answer = (
            f'Dạ thưa Bác, cách thức thực hiện thủ tục {clean_name} rất đơn giản ạ. '
            f'Bác mang theo {top_docs_spoken or "Căn cước công dân"} đến {counter_code}, Bàn số {pos_num} gặp {spoken_officer}. '
            f'{_format_number_ranges_for_speech(first_steps)} Thời hạn giải quyết là {duration_spoken}, {fee_spoken}.'
        )
    else:
        fee_phrase = (
            f"và được {fee_spoken[0].lower() + fee_spoken[1:]}"
            if re.match(r'^miễn\s+phí', fee_spoken, flags=re.IGNORECASE)
            else f"với lệ phí là {fee_spoken}"
        )
        answer = (
            f'Dạ thưa Bác! Với thủ tục {clean_name}, Bác vui lòng đến {counter_code}, '
            f'Bàn số {pos_num} gặp {spoken_officer} để được tiếp nhận. '
            f'Thời gian giải quyết là {duration_spoken} {fee_phrase}. '
            f'Bác chuẩn bị các giấy tờ chính gồm: {top_docs_spoken or "Căn cước công dân"}. '
            f'Nếu cần phát mẫu đơn hoặc viết hộ tờ khai, Quầy Hướng dẫn (đồng chí Phạm Duy Đại) hỗ trợ miễn phí ngay tại cửa ạ.'
        )

    spoken_summary = (
        f'Thưa Bác, thủ tục {clean_name} tiếp nhận tại {counter_code}, Bàn số {pos_num} gặp {spoken_officer}. '
        f'Thời hạn {duration_spoken}, lệ phí {fee_spoken}.'
    )

    follow_ups = [
        f'Thủ tục {clean_name} dùng mẫu tờ khai nào?',
        'Cần mang theo những giấy tờ gì?',
        'Lệ phí và thời gian trả kết quả bao lâu?',
    ]

    return {
        'mode': 'offline_sqlite',
        'answer': answer,
        'spokenSummary': spoken_summary,
        'spokenResponse': answer,
        'matchedServiceId': srv.get('id', ''),
        'counterInfo': f'{counter_code} · Bàn số {pos_num} ({counter_name}) · {officer_raw}',
        'requiredFormsAndDocs': required_forms_and_docs,
        'stepByStepGuide': step_by_step,
        'feeAndDuration': fee_and_duration,
        'legalRegulations': legal_regs,
        'followUpSuggestions': follow_ups,
        'service': srv,
        'counter': matched_counter,
        'officer': matched_officer,
        'isConfirmation': False,
        'suggestedQuestions': follow_ups,
    }


def _try_gemini_if_configured(
    query_text: str,
    history: List[Dict[str, str]],
    services: List[Dict[str, Any]],
    counters: List[Dict[str, Any]],
    ward: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    api_key = (os.environ.get('GEMINI_API_KEY') or '').strip()
    if not api_key:
        return None

    counter_map = {c.get('id'): c for c in counters if c.get('id')}
    services_lines = []
    for s in services[:30]:
        c = counter_map.get(s.get('counterId'), {})
        docs_text = '; '.join(
            f"{d.get('name', '')}" + (f" [Mẫu: {d.get('sampleFormName')}]" if d.get('sampleFormName') else '')
            for d in (s.get('requiredDocuments') or [])[:6]
        )
        services_lines.append(
            f"ID:{s.get('id')} | Mã:{s.get('code')} | Tên:{s.get('name')} | "
            f"Ô:{c.get('code', '')} Bàn {c.get('positionNumber', '')} ({c.get('officerName', '')}) | "
            f"Thời hạn:{s.get('processingDuration')} | Lệ phí:{s.get('fee')} | Giấy tờ:{docs_text}"
        )

    history_block = '\n'.join(
        f"{'Công dân' if h.get('role') == 'user' else 'Trợ lý'}: {(h.get('text') or '')[:400]}"
        for h in history[-4:]
        if isinstance(h, dict) and h.get('text')
    )

    prompt = (
        f"Bạn là Trợ lý AI Hướng dẫn Thủ tục Hành chính Công thân thiện cho người cao tuổi tại UBND {ward.get('name', 'Phường Sơn Trà')} "
        f"({ward.get('address', '')}, Hotline: {ward.get('hotline', '')}).\n"
        f"Luôn xưng 'cháu', gọi 'Bác', văn bản thuần KHÔNG Markdown (không **, *, #), ghi khoảng số bằng chữ 'từ ... đến ...'.\n"
        f"Dữ liệu thủ tục của phường:\n" + '\n'.join(services_lines) + "\n\n"
        + (f"Lịch sử hỏi đáp:\n{history_block}\n\n" if history_block else '')
        + f"Câu hỏi hiện tại của Bác: {query_text}\n"
        "Trả về đúng 1 JSON object có các khóa: answer (string), spokenSummary (string), matchedServiceId (string), "
        "counterInfo (string), requiredFormsAndDocs (array of strings), stepByStepGuide (array of strings), "
        "feeAndDuration (string), legalRegulations (array of strings), followUpSuggestions (array of strings)."
    )

    payload = {
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {
            'responseMimeType': 'application/json',
            'temperature': 0.2,
        },
    }

    url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'x-goog-api-key': api_key,
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            raw = json.loads(resp.read().decode('utf-8'))
        text = raw['candidates'][0]['content']['parts'][0]['text']
        parsed = json.loads(text)
        matched_id = (parsed.get('matchedServiceId') or '').strip()
        matched_srv = next((s for s in services if s.get('id') == matched_id), None)
        matched_counter = counter_map.get(matched_srv.get('counterId')) if matched_srv else None

        return {
            'mode': 'gemini_online',
            'answer': (parsed.get('answer') or '').strip(),
            'spokenSummary': (parsed.get('spokenSummary') or parsed.get('answer') or '').strip(),
            'spokenResponse': (parsed.get('answer') or '').strip(),
            'matchedServiceId': matched_id,
            'counterInfo': (parsed.get('counterInfo') or '').strip(),
            'requiredFormsAndDocs': parsed.get('requiredFormsAndDocs') or [],
            'stepByStepGuide': parsed.get('stepByStepGuide') or [],
            'feeAndDuration': (parsed.get('feeAndDuration') or '').strip(),
            'legalRegulations': parsed.get('legalRegulations') or [],
            'followUpSuggestions': parsed.get('followUpSuggestions') or [],
            'service': matched_srv,
            'counter': matched_counter,
            'officer': None,
            'isConfirmation': False,
            'suggestedQuestions': parsed.get('followUpSuggestions') or [],
        }
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, KeyError, ValueError, OSError):
        # Khi chạy offline / mất mạng, tự động chuyển về tra cứu SQLite tại chỗ
        return None


def analyze_citizen_speech(
    query_text: str,
    services: List[Dict[str, Any]],
    counters: List[Dict[str, Any]],
    officers: List[Dict[str, Any]],
    ward: Dict[str, Any],
    active_service_id: Optional[str] = None,
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    norm_query = remove_vietnamese_tones(query_text)

    # 1. Kiểm tra xác nhận đã hiểu / cảm ơn
    confirmation_keywords = [
        'da ro', 'da hieu', 'hieu roi', 'cam on', 'cam on chau', 'cam on em',
        'biet roi', 'duoc roi', 'xong roi', 'khong can nua', 'thoi duoc roi',
    ]
    if any(k in norm_query for k in confirmation_keywords):
        msg = (
            'Dạ vâng, cháu rất vui vì đã hỗ trợ được Bác! '
            'Kính chúc Bác luôn dồi dào sức khỏe và một ngày thật nhiều niềm vui. '
            'Bác có thể bấm đóng cửa sổ hoặc hỏi tiếp bất cứ lúc nào ạ.'
        )
        return {
            'mode': 'offline_sqlite',
            'answer': msg,
            'spokenSummary': msg,
            'spokenResponse': msg,
            'matchedServiceId': '',
            'counterInfo': '',
            'requiredFormsAndDocs': [],
            'stepByStepGuide': [],
            'feeAndDuration': '',
            'legalRegulations': [],
            'followUpSuggestions': [
                'Làm giấy khai sinh cho cháu',
                'Thủ tục trợ cấp người cao tuổi',
                'Chứng thực bản sao căn cước',
            ],
            'service': None,
            'counter': None,
            'officer': None,
            'isConfirmation': True,
            'suggestedQuestions': [],
        }

    # 2. Nếu có kết nối mạng và cấu hình GEMINI_API_KEY trên máy chủ, ưu tiên hỏi Gemini;
    # nếu không có mạng / không có khóa, tự động chuyển ngay sang bộ tra cứu SQLite tại chỗ.
    gemini_result = _try_gemini_if_configured(
        query_text=query_text,
        history=history or [],
        services=services,
        counters=counters,
        ward=ward,
    )
    if gemini_result and gemini_result.get('answer'):
        return gemini_result

    # 3. Các thủ tục ngoài thẩm quyền UBND phường (trả lời đúng quy định Nhà nước, không bịa ô tiếp nhận)
    if any(w in norm_query for w in ['lam can cuoc', 'cap can cuoc', 'doi can cuoc', 'cccd gan chip', 'the can cuoc']):
        msg = (
            'Dạ thưa Bác, thủ tục cấp mới, cấp đổi hoặc cấp lại thẻ Căn cước và tài khoản định danh VNeID mức 2 '
            'thuộc thẩm quyền của cơ quan Công an (Công an phường hoặc điểm cấp Căn cước Công an thành phố), '
            'không tiếp nhận tại Bộ phận Một cửa UBND phường ạ. '
            'Tuy nhiên nếu Bác cần cài đặt, kích hoạt hoặc hướng dẫn nộp hồ sơ trực tuyến bằng VNeID tại phường, '
            'Bác có thể đến Quầy Hướng dẫn gặp đồng chí Phạm Duy Đại hoặc Quầy Hỗ trợ Số hóa gặp đồng chí Nguyễn Văn Minh để được giúp đỡ miễn phí ạ.'
        )
        return {
            'mode': 'offline_sqlite',
            'answer': msg,
            'spokenSummary': 'Thưa Bác, cấp đổi thẻ Căn cước do cơ quan Công an thực hiện. Tại phường có hỗ trợ cài đặt VNeID và nộp hồ sơ trực tuyến miễn phí.',
            'spokenResponse': msg,
            'matchedServiceId': 'srv-ho-tro-vneid-dvc',
            'counterInfo': 'Thẩm quyền cấp thẻ Căn cước: Cơ quan Công an · Hỗ trợ VNeID tại phường: Quầy Hướng dẫn (Đ/c Phạm Duy Đại)',
            'requiredFormsAndDocs': [
                'Mang theo Căn cước công dân cũ (nếu cấp đổi) hoặc số định danh cá nhân.',
                'Đến trụ sở Công an phường hoặc điểm tiếp nhận hồ sơ Căn cước của Công an.',
            ],
            'stepByStepGuide': [
                'Bước 1: Bác mang giấy tờ tùy thân đến Công an phường hoặc đặt lịch trên ứng dụng VNeID.',
                'Bước 2: Thu nhận vân tay, chụp ảnh chân dung và xác nhận thông tin tại cơ quan Công an.',
                'Bước 3: Nếu cần hướng dẫn thao tác VNeID trên điện thoại, ghé Quầy Hướng dẫn UBND phường để cán bộ hỗ trợ miễn phí.',
            ],
            'feeAndDuration': 'Theo quy định của Bộ Công an và Thông tư 59/2019/TT-BTC (người cao tuổi thuộc diện được miễn/giảm theo quy định).',
            'legalRegulations': [
                'Luật Căn cước số 26/2023/QH15',
                'Nghị định 70/2024/NĐ-CP quy định chi tiết Luật Căn cước',
            ],
            'followUpSuggestions': [
                'Hỗ trợ cài đặt VNeID và nộp hồ sơ trực tuyến',
                'Chứng thực bản sao căn cước công dân',
                'Thủ tục trợ cấp người cao tuổi',
            ],
            'service': next((s for s in services if s.get('id') == 'srv-ho-tro-vneid-dvc'), None),
            'counter': None,
            'officer': None,
            'isConfirmation': False,
            'suggestedQuestions': [],
        }

    if any(w in norm_query for w in ['so do', 'cap so do', 'sang ten dat', 'giay chung nhan quyen su dung dat', 'bien dong dat dai']):
        msg = (
            'Dạ thưa Bác, thủ tục cấp Giấy chứng nhận quyền sử dụng đất (Sổ đỏ) lần đầu hoặc đăng ký biến động, sang tên nhà đất '
            'thuộc thẩm quyền tiếp nhận của Văn phòng Đăng ký đất đai / Chi nhánh Văn phòng Đăng ký đất đai khu vực và cơ quan có thẩm quyền theo Luật Đất đai 2024. '
            'Tại UBND phường sẽ hỗ trợ Bác phần chứng thực bản sao giấy tờ, chứng thực chữ ký hợp đồng hoặc xác nhận tình trạng hôn nhân để bổ sung hồ sơ nhà đất ạ.'
        )
        return {
            'mode': 'offline_sqlite',
            'answer': msg,
            'spokenSummary': 'Thưa Bác, hồ sơ cấp sổ đỏ và sang tên nhà đất nộp tại Văn phòng Đăng ký đất đai. Phường hỗ trợ chứng thực giấy tờ và xác nhận tình trạng hôn nhân.',
            'spokenResponse': msg,
            'matchedServiceId': 'srv-xac-nhan-hon-nhan',
            'counterInfo': 'Cơ quan tiếp nhận chính: Văn phòng Đăng ký đất đai / Chi nhánh khu vực · UBND phường hỗ trợ chứng thực & xác nhận hôn nhân (Ô số 1)',
            'requiredFormsAndDocs': [
                'Giấy chứng nhận quyền sử dụng đất (bản gốc), CCCD các bên, hợp đồng chuyển nhượng/tặng cho công chứng.',
                'Giấy xác nhận tình trạng hôn nhân hoặc Giấy đăng ký kết hôn (có thể xin cấp tại Ô số 1 UBND phường).',
            ],
            'stepByStepGuide': [
                'Bước 1: Chuẩn bị bản sao chứng thực giấy tờ và Giấy xác nhận tình trạng hôn nhân (làm tại Ô số 1 UBND phường nếu cần).',
                'Bước 2: Nộp hồ sơ tại Bộ phận Một cửa cấp khu vực hoặc Văn phòng Đăng ký đất đai.',
                'Bước 3: Thực hiện nghĩa vụ tài chính theo thông báo của cơ quan thuế và nhận kết quả.',
            ],
            'feeAndDuration': 'Phí thẩm định và lệ phí trước bạ theo quy định của Luật Đất đai 2024 và HĐND thành phố.',
            'legalRegulations': [
                'Luật Đất đai năm 2024 (Luật số 31/2024/QH15)',
                'Nghị định 101/2024/NĐ-CP về điều tra cơ bản đất đai và đăng ký cấp Giấy chứng nhận',
            ],
            'followUpSuggestions': [
                'Cấp Giấy xác nhận tình trạng hôn nhân',
                'Chứng thực bản sao giấy tờ',
                'Chứng thực chữ ký',
            ],
            'service': next((s for s in services if s.get('id') == 'srv-xac-nhan-hon-nhan'), None),
            'counter': None,
            'officer': None,
            'isConfirmation': False,
            'suggestedQuestions': [],
        }

    # 4. Nhận diện trọng tâm câu hỏi (mẫu đơn, lệ phí/thời hạn, hay quy trình)
    focus = 'general'
    if any(w in norm_query for w in ['mau don', 'form', 'to khai', 'bieu mau', 'mau gi', 'giay to']):
        focus = 'forms'
    elif any(w in norm_query for w in ['le phi', 'bao nhieu tien', 'mat phi', 'mien phi', 'bao lau', 'may ngay', 'thoi han']):
        focus = 'fee_duration'
    elif any(w in norm_query for w in ['cach thuc', 'cac buoc', 'quy trinh', 'lam sao', 'nhu the nao']):
        focus = 'steps'

    # 5. Đối chiếu thủ tục trong SQLite (loại bỏ các từ hỏi chung chung để tránh khớp nhầm)
    generic_stopwords = {
        'le', 'phi', 'bao', 'nhieu', 'tien', 'mat', 'lau', 'ngay', 'thoi', 'han',
        'giay', 'to', 'mau', 'don', 'bieu', 'khai', 'lam', 'sao', 'nhu', 'the',
        'nao', 'can', 'gi', 'cho', 'cua', 'nay', 'thu', 'tuc', 'nop', 'dau',
        'ban', 'so', 'xin', 'hoi', 've', 'va', 'hoac', 'hay', 'duoc', 'khong',
        'co', 'phai', 'cach', 'thuc', 'cac', 'buoc', 'quy', 'trinh',
    }
    tokens = [t for t in norm_query.split() if len(t) > 1 and t not in generic_stopwords]
    best_match: Optional[Dict[str, Any]] = None
    highest_score = 0

    for srv in services:
        score = 0
        norm_name = remove_vietnamese_tones(srv.get('name', ''))
        norm_summary = remove_vietnamese_tones(srv.get('summary', ''))
        keywords = srv.get('searchKeywords', [])
        norm_keywords = ' '.join(remove_vietnamese_tones(k) for k in keywords)
        code = (srv.get('code') or '').lower()

        if len(norm_query) >= 4 and norm_query in norm_name:
            score += 35
        if len(norm_query) >= 4 and norm_query in norm_keywords:
            score += 30
        if len(norm_query) >= 6 and norm_query in norm_summary:
            score += 20
        if code and code in norm_query:
            score += 40

        for tok in tokens:
            if tok in norm_name:
                score += 6
            if tok in norm_keywords:
                score += 5
            if tok in norm_summary:
                score += 2

        srv_id = srv.get('id', '')
        if any(w in norm_query for w in ['khai sinh', 'sinh con', 'chau moi sinh', 'giay khai sinh']) and srv_id == 'srv-khai-sinh':
            score += 50
        if any(w in norm_query for w in ['ket hon', 'lay vo', 'lay chong']) and srv_id == 'srv-ket-hon':
            score += 50
        if any(w in norm_query for w in ['khai tu', 'nguoi mat', 'qua doi', 'mai tang', 'chung tu']) and srv_id == 'srv-khai-tu':
            score += 50
        if any(w in norm_query for w in ['cong chung', 'sao y', 'sao i', 'photo cong chung', 'chung thuc ban sao']) and srv_id == 'srv-chung-thuc-ban-sao':
            score += 45
        if any(w in norm_query for w in ['chu ky', 'so yeu ly lich', 'uy quyen', 'nhan luong huu']) and srv_id == 'srv-chung-thuc-chu-ky':
            score += 45
        if any(w in norm_query for w in ['doc than', 'tinh trang hon nhan', 'mua dat', 'vay von']) and srv_id == 'srv-xac-nhan-hon-nhan':
            score += 45
        if any(w in norm_query for w in ['ho kinh doanh', 'mo quan', 'tap hoa', 'buon ban', 'cua hang']) and srv_id == 'srv-ho-kinh-doanh-moi':
            score += 45
        if any(w in norm_query for w in ['an toan thuc pham', 'attp', 've sinh quan an']) and srv_id == 'srv-an-toan-thuc-pham':
            score += 45
        if any(w in norm_query for w in ['70 tuoi', '75 tuoi', '80 tuoi', 'nguoi gia', 'tro cap xa hoi', 'nguoi cao tuoi', 'huu tri xa hoi']) and srv_id == 'srv-tro-cap-nguoi-cao-tuoi':
            score += 55
        if any(w in norm_query for w in ['huu tri', 'luong huu', 'bao hiem xa hoi', 'bhxh', 'tuat']) and srv_id == 'srv-huu-tri':
            score += 50
        if any(w in norm_query for w in ['khuyet tat', 'tan tat', 'da cam']) and srv_id == 'srv-tro-cap-khuyet-tat':
            score += 45
        if any(w in norm_query for w in ['hoc phi', 'mien giam', 'sinh vien']) and srv_id == 'srv-mien-giam-hoc-phi':
            score += 45
        if any(w in norm_query for w in ['thuoc la', 'ruou', 'bia']) and srv_id == 'srv-ban-le-thuoc-la-ruou':
            score += 45
        if any(w in norm_query for w in ['vneid', 'vi en ai di', 'dinh danh', 'online', 'nop tren mang']) and srv_id == 'srv-ho-tro-vneid-dvc':
            score += 50

        if score > highest_score:
            highest_score = score
            best_match = srv

    # Nếu câu hỏi là câu hỏi tiếp nối (ví dụ: "mẫu đơn gì?", "lệ phí bao nhiêu?") và không nêu tên thủ tục khác -> dùng active_service_id
    if active_service_id and focus != 'general' and (not best_match or highest_score < 25):
        active_srv = next((s for s in services if s.get('id') == active_service_id), None)
        if active_srv:
            return _format_structured_from_service(active_srv, counters, officers, focus=focus)

    if best_match and highest_score >= 10:
        return _format_structured_from_service(best_match, counters, officers, focus=focus)

    # 6. Quầy hướng dẫn / lấy số / viết hộ đơn
    if any(w in norm_query for w in ['so thu tu', 'viet don', 'viet ho', 'gap ai dau tien', 'huong dan', 'mau don', 'to khai']):
        guide_counter = next((c for c in counters if c.get('id') == 'counter-guide'), counters[0] if counters else {})
        guide_officer = next((o for o in officers if o.get('counterId') == 'counter-guide'), None)
        msg = (
            'Dạ thưa Bác! Để lấy số thứ tự, nhận mẫu tờ khai theo quy định hoặc nhờ viết hộ đơn, '
            'Bác đến ngay Quầy Hướng dẫn ở cửa ra vào gặp đồng chí Phạm Duy Đại nhé ạ. '
            'Đồng chí Đại sẽ phát mẫu đơn, viết hộ miễn phí cho người cao tuổi và hướng dẫn Bác đến đúng ô chuyên môn ạ!'
        )
        return {
            'mode': 'offline_sqlite',
            'answer': msg,
            'spokenSummary': 'Thưa Bác, Quầy Hướng dẫn ở ngay cửa ra vào (đồng chí Phạm Duy Đại) phát mẫu tờ khai, viết hộ và lấy số thứ tự miễn phí cho Bác ạ.',
            'spokenResponse': msg,
            'matchedServiceId': '',
            'counterInfo': f"{guide_counter.get('code', 'Quầy Hướng dẫn')} · {guide_counter.get('officerName', 'Đ/c Phạm Duy Đại')}",
            'requiredFormsAndDocs': [
                'Mang theo Căn cước công dân gắn chip để cán bộ kiểm tra và điền thông tin chính xác.',
                'Không cần mua hay tự in mẫu đơn từ nhà, Quầy Hướng dẫn phát miễn phí.',
            ],
            'stepByStepGuide': [
                'Bước 1: Ghé Quầy Hướng dẫn ngay cửa vào gặp Đ/c Phạm Duy Đại.',
                'Bước 2: Nêu nhu cầu để được phát mẫu tờ khai, viết hộ (nếu cần) và bấm số thứ tự.',
                'Bước 3: Ngồi chờ tại ghế chờ và vào đúng Ô tiếp nhận khi được gọi số.',
            ],
            'feeAndDuration': 'Hỗ trợ hướng dẫn, viết hộ và lấy số hoàn toàn miễn phí.',
            'legalRegulations': ['Quy chế thực hiện cơ chế một cửa, một cửa liên thông theo Nghị định 61/2018/NĐ-CP'],
            'followUpSuggestions': [
                'Làm giấy khai sinh cho cháu',
                'Thủ tục trợ cấp người cao tuổi (70 - 80 tuổi)',
                'Chứng thực bản sao căn cước công dân',
            ],
            'service': None,
            'counter': guide_counter,
            'officer': guide_officer,
            'isConfirmation': False,
            'suggestedQuestions': [],
        }

    # 7. Khu tiện ích / photo miễn phí
    if any(w in norm_query for w in ['photo', 'sao chup', 'nuoc uong', 'kinh lup']):
        facility_counter = next((c for c in counters if c.get('id') == 'counter-facility'), counters[0] if counters else {})
        facility_officer = next((o for o in officers if o.get('counterId') == 'counter-facility'), None)
        msg = (
            'Dạ thưa Bác! UBND phường có bố trí máy photocopy miễn phí, kính lúp đọc chữ và nước uống nóng lạnh phục vụ bà con '
            'tại Khu Tiện ích, do đồng chí Mai Thị Thanh Tâm phụ trách. Bác cứ ghé qua photo giấy tờ mà không tốn tiền đâu ạ!'
        )
        return {
            'mode': 'offline_sqlite',
            'answer': msg,
            'spokenSummary': 'Thưa Bác, Khu Tiện ích (đồng chí Mai Thị Thanh Tâm) hỗ trợ photocopy, nước uống và kính lúp miễn phí cho người dân ạ.',
            'spokenResponse': msg,
            'matchedServiceId': '',
            'counterInfo': f"{facility_counter.get('code', 'Khu Tiện ích')} · {facility_counter.get('officerName', 'Đ/c Mai Thị Thanh Tâm')}",
            'requiredFormsAndDocs': ['Mang theo giấy tờ bản chính cần sao chụp.'],
            'stepByStepGuide': ['Ghé Khu Tiện ích gặp Đ/c Mai Thị Thanh Tâm để được photocopy miễn phí.'],
            'feeAndDuration': 'Hoàn toàn miễn phí phục vụ công dân.',
            'legalRegulations': ['Mô hình Bộ phận Một cửa thân thiện phục vụ nhân dân UBND Phường Sơn Trà'],
            'followUpSuggestions': [
                'Chứng thực bản sao căn cước công dân',
                'Làm giấy khai sinh cho cháu',
                'Đăng ký kết hôn',
            ],
            'service': None,
            'counter': facility_counter,
            'officer': facility_officer,
            'isConfirmation': False,
            'suggestedQuestions': [],
        }

    # 8. Chưa nhận diện rõ -> gợi ý các câu hỏi thường gặp
    fallback_msg = (
        'Dạ thưa Bác! Cháu chưa nhận diện rõ thủ tục Bác đang hỏi. '
        'Bác có thể bấm vào micro nói rõ tên việc cần làm (ví dụ: "Làm giấy khai sinh", "Trợ cấp người cao tuổi 70 tuổi", "Đăng ký kết hôn", "Chứng thực căn cước") '
        'hoặc chạm vào một trong các câu hỏi mẫu bên dưới để cháu hướng dẫn ngay ạ!'
    )
    return {
        'mode': 'offline_sqlite',
        'answer': fallback_msg,
        'spokenSummary': fallback_msg,
        'spokenResponse': fallback_msg,
        'matchedServiceId': '',
        'counterInfo': '',
        'requiredFormsAndDocs': [],
        'stepByStepGuide': [],
        'feeAndDuration': '',
        'legalRegulations': [],
        'followUpSuggestions': [
            'Làm giấy khai sinh cho cháu cần giấy tờ và mẫu đơn gì?',
            'Thủ tục trợ cấp hàng tháng cho người cao tuổi từ 70 đến 80 tuổi',
            'Đăng ký kết hôn nộp ở đâu và mất bao lâu?',
            'Chứng thực bản sao căn cước công dân hết bao nhiêu tiền?',
            'Làm thẻ Căn cước công dân hoặc VNeID ở đâu?',
            'Đăng ký hộ kinh doanh quán ăn, cửa hàng cần gì?',
        ],
        'service': None,
        'counter': None,
        'officer': None,
        'isConfirmation': False,
        'suggestedQuestions': [
            'Làm giấy khai sinh cho cháu',
            'Thủ tục trợ cấp người cao tuổi (70 - 80 tuổi)',
            'Đăng ký kết hôn',
            'Chứng thực bản sao căn cước công dân',
            'Đăng ký hộ kinh doanh quán ăn, cửa hàng',
            'Làm thẻ Căn cước ở đâu?',
        ],
    }
