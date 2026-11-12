import re
import unicodedata
from typing import Dict, List, Any, Optional

def remove_vietnamese_tones(text: str) -> str:
    if not text:
        return ''
    # Normalize unicode to NFD and strip combining accents
    nfd = unicodedata.normalize('NFD', text)
    stripped = ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
    stripped = stripped.replace('đ', 'd').replace('Đ', 'D')
    return stripped.lower().strip()

def analyze_citizen_speech(
    query_text: str,
    services: List[Dict[str, Any]],
    counters: List[Dict[str, Any]],
    officers: List[Dict[str, Any]],
    ward: Dict[str, Any]
) -> Dict[str, Any]:
    norm_query = remove_vietnamese_tones(query_text)

    # 1. Kiểm tra xác nhận đã hiểu / cảm ơn
    confirmation_keywords = [
        'da ro', 'da hieu', 'hieu roi', 'cam on', 'cam on chau', 'cam on em',
        'biet roi', 'duoc roi', 'ok', 'xong roi', 'khong can nua', 'thoi duoc roi'
    ]
    if any(k in norm_query for k in confirmation_keywords):
        return {
            'service': None,
            'counter': None,
            'officer': None,
            'spokenResponse': 'Dạ vâng, cháu rất vui vì đã hỗ trợ được Bác! Kính chúc Bác luôn dồi dào sức khỏe và một ngày thật nhiều niềm vui. Cháu xin phép trở về màn hình chờ Kiosk nhé ạ!',
            'isConfirmation': True,
            'suggestedQuestions': []
        }

    tokens = [t for t in norm_query.split() if len(t) > 1]
    best_match: Optional[Dict[str, Any]] = None
    highest_score = 0

    for srv in services:
        score = 0
        norm_name = remove_vietnamese_tones(srv.get('name', ''))
        norm_summary = remove_vietnamese_tones(srv.get('summary', ''))
        keywords = srv.get('searchKeywords', [])
        norm_keywords = ' '.join(remove_vietnamese_tones(k) for k in keywords)
        code = srv.get('code', '').lower()

        if norm_query in norm_name:
            score += 35
        if norm_query in norm_keywords:
            score += 30
        if norm_query in norm_summary:
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

        # Semantic mappings cho cách nói tự nhiên của người cao tuổi
        srv_id = srv.get('id', '')
        if any(w in norm_query for w in ['khai sinh', 'sinh con', 'chau moi sinh']) and srv_id == 'srv-khai-sinh':
            score += 50
        if any(w in norm_query for w in ['ket hon', 'lay vo', 'lay chong']) and srv_id == 'srv-ket-hon':
            score += 50
        if any(w in norm_query for w in ['khai tu', 'nguoi mat', 'mai tang', 'chung tu']) and srv_id == 'srv-khai-tu':
            score += 50
        if any(w in norm_query for w in ['cong chung', 'sao y', 'sao i', 'photo cong chung', 'chung thuc']) and srv_id == 'srv-chung-thuc-ban-sao':
            score += 45
        if any(w in norm_query for w in ['chu ky', 'so yeu ly lich', 'uy quyen', 'nhan luong huu']) and srv_id == 'srv-chung-thuc-chu-ky':
            score += 45
        if any(w in norm_query for w in ['doc than', 'tinh trang hon nhan', 'mua dat', 'vay von']) and srv_id == 'srv-xac-nhan-hon-nhan':
            score += 45
        if any(w in norm_query for w in ['ho kinh doanh', 'mo quan', 'tap hoa', 'buon ban', 'cua hang']) and srv_id == 'srv-ho-kinh-doanh-moi':
            score += 45
        if any(w in norm_query for w in ['an toan thuc pham', 'attp', 've sinh quan an']) and srv_id == 'srv-an-toan-thuc-pham':
            score += 45
        if any(w in norm_query for w in ['80 tuoi', 'nguoi gia', 'tro cap xa hoi', 'nguoi cao tuoi']) and srv_id == 'srv-tro-cap-nguoi-cao-tuoi':
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

    # 2. Khớp thủ tục
    if best_match and highest_score >= 10:
        matched_counter = next((c for c in counters if c.get('id') == best_match.get('counterId')), counters[0] if counters else {})
        matched_officer = next((o for o in officers if o.get('counterId') == matched_counter.get('id')), None)
        if not matched_officer:
            matched_officer = next((o for o in officers if o.get('name') == matched_counter.get('officerName')), None)

        docs = best_match.get('requiredDocuments', [])
        doc_names = ', '.join([d.get('name', '') for d in docs[:3]])

        officer_raw = matched_counter.get('officerName', 'Cán bộ phụ trách')
        spoken_officer = re.sub(r'[Đđ]/c\.?\s*', 'đồng chí ', officer_raw)

        spoken = (
            f"Dạ thưa Bác! Với thủ tục {best_match.get('name')}, Bác vui lòng đến {matched_counter.get('code')}, "
            f"Bàn số {matched_counter.get('positionNumber')} gặp {spoken_officer} nhé ạ. "
            f"Thời gian giải quyết là {best_match.get('processingDuration')}, lệ phí là {best_match.get('fee')}. "
            f"Bác chỉ cần mang theo: {doc_names}. Bác kiểm tra thông tin chi tiết trên màn hình nhé! Bác đã nắm rõ chưa ạ?"
        )

        return {
            'service': best_match,
            'counter': matched_counter,
            'officer': matched_officer,
            'spokenResponse': spoken,
            'isConfirmation': False,
            'suggestedQuestions': [
                'Hồ sơ gồm những giấy tờ gì?',
                'Thời gian trả kết quả bao lâu?',
                'Lệ phí làm thủ tục này hết bao nhiêu?',
                'Tôi đã hiểu rõ, cảm ơn cháu!'
            ]
        }

    # 3. Quầy hướng dẫn / lấy số
    if any(w in norm_query for w in ['so thu tu', 'viet don', 'gap ai dau tien', 'huong dan']):
        guide_counter = next((c for c in counters if c.get('id') == 'counter-guide'), counters[0] if counters else {})
        guide_officer = next((o for o in officers if o.get('counterId') == 'counter-guide'), None)
        return {
            'service': None,
            'counter': guide_counter,
            'officer': guide_officer,
            'spokenResponse': 'Dạ thưa Bác! Để lấy số thứ tự hoặc nhờ viết hộ đơn tờ khai, Bác đến ngay Quầy Hướng dẫn ở cửa ra vào gặp đồng chí Phạm Duy Đại nhé ạ. Đồng chí Đại sẽ phát số và chỉ Bác đến đúng ô chuyên môn hoàn toàn miễn phí ạ!',
            'isConfirmation': False,
            'suggestedQuestions': [
                'Làm giấy khai sinh cho cháu',
                'Đăng ký kết hôn',
                'Công chứng căn cước công dân',
                'Tôi đã hiểu rõ, cảm ơn cháu!'
            ]
        }

    # 4. Khu tiện ích / photo miễn phí
    if any(w in norm_query for w in ['photo', 'sao chup', 'nuoc uong', 'kinh lup']):
        facility_counter = next((c for c in counters if c.get('id') == 'counter-facility'), counters[0] if counters else {})
        facility_officer = next((o for o in officers if o.get('counterId') == 'counter-facility'), None)
        return {
            'service': None,
            'counter': facility_counter,
            'officer': facility_officer,
            'spokenResponse': 'Dạ thưa Bác! Phường có bố trí máy photocopy miễn phí và nước uống nóng lạnh phục vụ bà con tại Khu Tiện ích, do đồng chí Mai Thị Thanh Tâm phụ trách. Bác cứ ghé qua photo giấy tờ mà không tốn tiền đâu ạ!',
            'isConfirmation': False,
            'suggestedQuestions': [
                'Sao y công chứng căn cước',
                'Làm giấy khai sinh cho cháu',
                'Tôi đã hiểu rõ, cảm ơn cháu!'
            ]
        }

    # 5. Chưa nhận diện rõ
    return {
        'service': None,
        'counter': None,
        'officer': None,
        'spokenResponse': 'Dạ thưa Bác! Cháu chưa nghe rõ tên thủ tục Bác cần làm. Bác có thể bấm vào micro nói lại (ví dụ như: "Làm giấy khai sinh", "Đăng ký kết hôn", "Công chứng căn cước", "Trợ cấp 80 tuổi") hoặc chạm vào các gợi ý bên dưới để cháu chỉ dẫn ngay nhé ạ!',
        'isConfirmation': False,
        'suggestedQuestions': [
            'Làm giấy khai sinh cho cháu',
            'Đăng ký kết hôn',
            'Công chứng căn cước công dân',
            'Xác nhận tình trạng hôn nhân (độc thân)',
            'Đăng ký kinh doanh quán ăn, cửa hàng',
            'Trợ cấp hàng tháng cho người 80 tuổi'
        ]
    }
