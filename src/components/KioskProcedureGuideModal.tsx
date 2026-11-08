import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CreditCard, 
  FileText, 
  ListOrdered, 
  MapPin, 
  User, 
  Phone, 
  Volume2, 
  VolumeX, 
  Printer, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Counter, Officer, PublicService, Ward } from '../types';
import { useApp } from '../context/AppContext';

interface KioskProcedureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  counter: Counter | null;
  officer?: Officer | null;
  services: PublicService[];
  ward: Ward;
  onOpenFullDetail: (service: PublicService) => void;
}

export const KioskProcedureGuideModal: React.FC<KioskProcedureGuideModalProps> = ({
  isOpen,
  onClose,
  counter,
  officer,
  services,
  ward,
  onOpenFullDetail
}) => {
  const { readText, stopAudio, isSpeaking } = useApp();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Only set initial selectedServiceId when modal opens or counter changes
  useEffect(() => {
    if (!isOpen || !counter) {
      stopAudio();
      return;
    }

    if (services.length > 0) {
      setSelectedServiceId(prev => {
        // If current selected service already exists in this counter's services, keep user's selection!
        const stillExists = services.some(s => s.id === prev);
        if (stillExists) return prev;
        const popular = services.find(s => s.isPopular);
        return popular ? popular.id : services[0].id;
      });
    } else {
      setSelectedServiceId('');
    }
  }, [counter?.id, isOpen]);

  if (!isOpen || !counter) return null;

  const currentService = services.find(s => s.id === selectedServiceId) || services[0];

  const handleAudioPlayback = () => {
    if (!currentService) return;
    if (isSpeaking) {
      stopAudio();
    } else {
      readText(currentService.audioScript || currentService.summary);
    }
  };

  const handleSelectService = (serviceId: string) => {
    stopAudio();
    setSelectedServiceId(serviceId);
  };

  const handleProceedToDetail = (service: PublicService) => {
    stopAudio();
    onOpenFullDetail(service);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
      onClick={e => {
        e.stopPropagation();
        stopAudio();
        onClose();
      }}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-red-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header: Counter Code, Name & Officer */}
        <div className="bg-gradient-to-r from-[#9b0e15] via-[#be111a] to-[#9b0e15] text-white p-4 sm:p-6 border-b-4 border-amber-400 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#9b0e15] font-black text-base flex flex-col items-center justify-center shadow-md ring-2 ring-white/50 shrink-0 leading-none">
                <span className="text-[10px] uppercase font-bold tracking-tighter">Bàn</span>
                <span className="text-xl font-mono">{counter.positionNumber}</span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-amber-200 font-extrabold text-xs uppercase tracking-wide">
                    {counter.code}
                  </span>
                  <span className="text-xs text-white/90 font-medium">
                    {ward.name} · Bộ phận một cửa
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                  {counter.name}
                </h2>
                <p className="text-xs text-amber-200 font-bold flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                  Cán bộ phụ trách: <span className="text-white underline underline-offset-2">{counter.officerName}</span>
                  {officer?.phone && (
                    <span className="text-amber-100 font-normal">· Hotline: {officer.phone}</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 border border-white/20"
              title="Đóng bảng hướng dẫn"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Procedure Tabs (If multiple services belong to this counter) */}
          {services.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap gap-2">
              <span className="text-xs text-amber-200 font-bold self-center mr-1 hidden sm:inline">
                Chọn thủ tục:
              </span>
              {services.map(srv => {
                const isSelected = srv.id === selectedServiceId;
                return (
                  <button
                    key={srv.id}
                    onClick={() => handleSelectService(srv.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900 ring-2 ring-white scale-102 font-black'
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    <span>{srv.name}</span>
                    {srv.isPopular && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-600 text-white">
                        Phổ biến
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#f8fafc]">
          
          {/* Case 1: Special Utility Counter (Quầy Hướng dẫn / Khu Tiện ích) */}
          {services.length === 0 ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#be111a]" />
                  Chức năng phục vụ công dân tại {counter.code}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {counter.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Thời gian phục vụ
                  </div>
                  <p className="text-xs text-emerald-900 font-medium">
                    Sáng: 07h30 - 11h30 | Chiều: 13h30 - 17h00 (Thứ 2 đến Thứ 6)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-1">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Lệ phí hỗ trợ
                  </div>
                  <p className="text-xs text-blue-900 font-bold">
                    Hoàn toàn miễn phí 100% cho người dân
                  </p>
                </div>
              </div>

              {counter.id === 'counter-guide' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <h4 className="font-bold text-amber-900 text-xs sm:text-sm">
                    Quy trình hỗ trợ tại Quầy Hướng Dẫn:
                  </h4>
                  <ul className="text-xs text-amber-950 space-y-1.5 list-disc pl-4">
                    <li>Lấy số thứ tự điện tử vào các Ô chuyên môn (Tư pháp, Đăng ký kinh doanh, Trợ cấp xã hội...).</li>
                    <li>Phát miễn phí các mẫu tờ khai, hỗ trợ người cao tuổi viết đơn tờ khai.</li>
                    <li>Hướng dẫn cài đặt định danh điện tử VNeID mức 2 và tạo tài khoản Dịch vụ công Quốc gia.</li>
                  </ul>
                </div>
              )}

              {counter.id === 'counter-facility' && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <h4 className="font-bold text-rose-900 text-xs sm:text-sm">
                    Các tiện ích miễn phí tại Khu Tiện Ích:
                  </h4>
                  <ul className="text-xs text-rose-950 space-y-1.5 list-disc pl-4">
                    <li>Máy photocopy giấy tờ tùy thân (CCCD, sổ hộ khẩu, bằng cấp) miễn phí cho công dân.</li>
                    <li>Bàn viết có sẵn bút mực, kính lúp đọc chữ cho người cao tuổi.</li>
                    <li>Nước uống nóng lạnh và ghế ngồi chờ ưu tiên người lớn tuổi, phụ nữ mang thai.</li>
                  </ul>
                </div>
              )}
            </div>
          ) : currentService ? (
            /* Case 2: Standard Administrative Public Service */
            <div className="space-y-5">
              
              {/* Service Title and Summary */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-red-100 text-[#be111a] font-mono text-xs font-bold">
                    Mã TTHC: {currentService.code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentService.level === 'toan_trinh'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentService.level === 'mot_phan'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentService.level === 'toan_trinh' ? 'DVC Toàn trình (Trực tuyến)' : currentService.level === 'mot_phan' ? 'DVC Một phần' : 'Thực hiện trực tiếp tại quầy'}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {currentService.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {currentService.summary}
                </p>

                {/* Voice Assistant Button for this procedure */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={handleAudioPlayback}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 transition-colors cursor-pointer"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4 text-emerald-700 animate-pulse" />
                        <span>Dừng đọc giọng nói</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-700" />
                        <span>Nghe đọc hướng dẫn cho người cao tuổi</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                    Giọng đọc chậm rãi, to rõ
                  </span>
                </div>
              </div>

              {/* 4 CORE INFO CARDS: THỜI GIAN, LỆ PHÍ, ĐỊA ĐIỂM, HÌNH THỨC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Thời hạn giải quyết */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 flex items-start gap-3 shadow-2xs">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-800 block">
                      Thời hạn giải quyết
                    </span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {currentService.processingDuration}
                    </p>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Tính theo ngày làm việc hành chính
                    </span>
                  </div>
                </div>

                {/* 2. Mức Lệ phí */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-200 flex items-start gap-3 shadow-2xs">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                      Mức phí & Lệ phí
                    </span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {currentService.fee}
                    </p>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Nộp tại Quầy Thủ quỹ cơ quan hoặc thanh toán online
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. THÀNH PHẦN HỒ SƠ CẦN CHUẨN BỊ */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#be111a]" />
                    Hồ sơ & Giấy tờ cần chuẩn bị ({currentService.requiredDocuments.length} loại giấy tờ)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Người dân cần mang theo
                  </span>
                </div>

                <div className="space-y-2.5">
                  {currentService.requiredDocuments.map((doc, idx) => (
                    <div 
                      key={doc.id || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs"
                    >
                      <div className="w-6 h-6 rounded-lg bg-red-100 text-[#be111a] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {doc.name}
                          </span>
                          {doc.isRequired && (
                            <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                              Bắt buộc
                            </span>
                          )}
                          {doc.isOriginal && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">
                              Bản chính
                            </span>
                          )}
                          {doc.isCopyOrCertified && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 font-semibold text-[10px]">
                              Bản sao / Photo
                            </span>
                          )}
                        </div>

                        {doc.note && (
                          <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                            💡 {doc.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. QUY TRÌNH CÁC BƯỚC THỰC HIỆN */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-[#be111a]" />
                    Quy trình thực hiện ({currentService.steps.length} bước tại một cửa)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Đến đúng ô tiếp nhận
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentService.steps.map((st) => (
                    <div 
                      key={st.stepNumber}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-[#be111a] text-white font-black text-xs">
                          Bước {st.stepNumber}
                        </span>
                        {st.counterNote && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            {st.counterNote}
                          </span>
                        )}
                      </div>

                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm pt-0.5">
                        {st.title}
                      </h5>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {st.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : null}

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span className="font-bold text-slate-700">UBND {ward.name}</span> · Bộ phận một cửa phục vụ công dân
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Đóng lại
            </button>

            {currentService && (
              <button
                onClick={() => handleProceedToDetail(currentService)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#9b0e15] to-[#be111a] hover:from-[#7f0b11] hover:to-[#9b0e15] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all border border-amber-300 cursor-pointer"
              >
                <span>Xem chi tiết, In phiếu & Nộp online</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
