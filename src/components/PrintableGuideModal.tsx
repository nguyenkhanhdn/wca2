import React from 'react';
import { X, Printer, CheckSquare, Clock, MapPin, User, Phone, AlertCircle } from 'lucide-react';
import { PublicService, Counter, Officer, Ward } from '../types';
import { sanitizeServiceNationalPortalUrl } from '../context/AppContext';

interface PrintableGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: PublicService;
  counter?: Counter;
  officer?: Officer;
  ward: Ward;
}

export const PrintableGuideModal: React.FC<PrintableGuideModalProps> = ({
  isOpen,
  onClose,
  service,
  counter,
  officer,
  ward
}) => {
  if (!isOpen) return null;

  const officialProcedureUrl = sanitizeServiceNationalPortalUrl(service);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Controls (Not printed) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Xem trước Phiếu Hướng Dẫn Hồ Sơ</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              In phiếu ngay
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 sm:p-12 text-slate-900 font-sans print:p-0">
          {/* Header Quốc hiệu */}
          <div className="grid grid-cols-2 text-center pb-6 border-b-2 border-slate-900 mb-6">
            <div>
              <p className="text-xs uppercase font-medium tracking-wide">ỦY BAN NHÂN DÂN THÀNH PHỐ ĐÀ NẴNG</p>
              <p className="text-sm uppercase font-bold tracking-tight text-red-700">
                UBND {ward.name.toUpperCase()}
              </p>
              <p className="text-[11px] text-slate-600">Trung tâm Phục vụ Hành chính công</p>
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wide">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-xs font-semibold tracking-wide border-b border-slate-700 inline-block pb-0.5 mb-1">
                Độc lập - Tự do - Hạnh phúc
              </p>
              <p className="text-[11px] italic text-slate-500">
                Đà Nẵng, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-red-800">
              PHIẾU HƯỚNG DẪN HOÀN THIỆN HỒ SƠ
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              Thủ tục: {service.name}
            </p>
            <p className="text-xs text-slate-500">
              Mã thủ tục: <span className="font-mono font-bold text-slate-900">{service.code}</span>
            </p>
          </div>

          {/* Location & Officer Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-700" />
              Địa điểm và Cán bộ tiếp nhận:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-600 text-xs">Vị trí nộp hồ sơ:</p>
                <p className="font-bold text-base text-red-700">
                  {counter ? counter.code : 'Quầy một cửa'} - {counter ? counter.name : ''}
                </p>
              </div>
              <div>
                <p className="text-slate-600 text-xs">Cán bộ phụ trách:</p>
                <p className="font-bold text-slate-900">
                  {officer ? officer.name : counter?.officerName || 'Chuyên viên tiếp nhận'}
                </p>
                <p className="text-xs text-slate-500">{officer?.title || ''}</p>
              </div>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-2 mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-red-700" />
              1. Thành phần hồ sơ Bác cần chuẩn bị mang theo:
            </h3>
            <div className="space-y-2.5">
              {service.requiredDocuments.map((doc, idx) => (
                <div key={doc.id} className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-5 h-5 rounded border-2 border-slate-400 shrink-0 mt-0.5 flex items-center justify-center font-bold text-xs text-slate-700">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {doc.name}
                      {doc.isRequired && (
                        <span className="text-xs font-semibold text-red-600 ml-1.5">(Bắt buộc)</span>
                      )}
                    </p>
                    {doc.note && (
                      <p className="text-xs text-slate-600 mt-0.5 italic">{doc.note}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>Loại: {doc.isOriginal ? 'Mang Bản chính' : 'Bản chụp/Photo'}</span>
                      {doc.isCopyOrCertified && <span>· Bản sao có chứng thực</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fee & Duration */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-slate-100 border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">Thời hạn giải quyết:</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                {service.processingDuration}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Lệ phí nhà nước:</span>
              <span className="text-sm font-bold text-red-700 mt-0.5 block">
                {service.fee}
              </span>
            </div>
          </div>

          {/* Procedure Steps */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-2 mb-3">
              2. Trình tự các bước thực hiện:
            </h3>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-800">
              {service.steps.map(step => (
                <li key={step.stepNumber} className="flex gap-2">
                  <span className="font-bold text-red-700 shrink-0">Bước {step.stepNumber}:</span>
                  <div>
                    <span className="font-semibold text-slate-900">{step.title}</span> - {step.description}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Important note for elderly citizens */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-bold">Lưu ý hỗ trợ người cao tuổi:</p>
              <p className="mt-0.5">
                Nếu Bác gặp khó khăn khi viết đơn hoặc chưa có bản photo, Bác vui lòng liên hệ ngay 
                <strong> Quầy Tiếp đón (Đ/c Phạm Duy Đại)</strong> hoặc <strong>Khu Tiện ích (Đ/c Mai Thị Thanh Tâm)</strong> để được hỗ trợ viết hộ và photo hoàn toàn miễn phí.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center text-xs mt-8 pt-4 border-t border-slate-300">
            <div>
              <p className="font-semibold text-slate-600">NGƯỜI ĐƯỢC HƯỚNG DẪN</p>
              <p className="text-[11px] italic text-slate-400 mt-1">(Ký, ghi rõ họ tên nếu cần)</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 uppercase">CÁN BỘ HƯỚNG DẪN TIẾP NHẬN</p>
              <p className="text-[11px] italic text-slate-500 mt-1">(Đã hướng dẫn và phát phiếu)</p>
              <div className="h-14 flex items-center justify-center font-bold text-red-800 italic">
                {officer ? officer.name : counter?.officerName || 'Bộ phận một cửa'}
              </div>
            </div>
          </div>

          {/* Footer Contact & National Portal */}
          <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-center text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-red-800 break-all">
              Đường dẫn tra cứu & nộp hồ sơ trực tuyến: {officialProcedureUrl}
            </p>
            <p className="text-slate-500">
              Cổng DVC Quốc gia: https://dichvucong.gov.vn · Cổng DVC TP. Đà Nẵng: https://dichvucong.danang.gov.vn
            </p>
            <p>UBND {ward.name} · Địa chỉ: {ward.address}</p>
            <p>Hotline hỗ trợ: {ward.hotline} · Giờ làm việc: {ward.workingHours}</p>
          </div>
        </div>

        {/* Modal Bottom (Not printed) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <p className="text-xs text-slate-500">
            Bác có thể nhờ cán bộ tại quầy in phiếu này ra giấy để mang về nhà đối chiếu.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              In phiếu này
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
