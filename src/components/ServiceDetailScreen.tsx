import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Printer, 
  Clock, 
  CreditCard, 
  CheckSquare, 
  Square, 
  MapPin, 
  User, 
  Phone, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrintableGuideModal } from './PrintableGuideModal';

export const ServiceDetailScreen: React.FC = () => {
  const { 
    selectedService, 
    selectedWard, 
    currentWardCounters, 
    currentWardOfficers,
    setCurrentScreen,
    readText,
    stopAudio,
    isSpeaking,
    activePlayingText,
    accessibility,
    setVoiceSpeed
  } = useApp();

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'hoso' | 'sodo' | 'faq'>('hoso');

  if (!selectedService) {
    return (
      <div className="p-12 text-center">
        <p>Chưa chọn thủ tục nào.</p>
        <button
          onClick={() => setCurrentScreen('citizen_home')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Find assigned Counter and Officer
  const assignedCounter = currentWardCounters.find(c => c.id === selectedService.counterId) || currentWardCounters[0];
  const assignedOfficer = currentWardOfficers.find(o => o.counterId === assignedCounter?.id) || 
    currentWardOfficers.find(o => o.name === assignedCounter?.officerName);

  // Link to National Public Service Portal (strictly official https://dichvucong.gov.vn/)
  const nationalPortalUrl = (selectedService.nationalPortalUrl && selectedService.nationalPortalUrl.trim() !== '' && !selectedService.nationalPortalUrl.includes('dvc-chi-tiet-thu-tuc-hanh-chinh'))
    ? selectedService.nationalPortalUrl
    : 'https://dichvucong.gov.vn/';

  const danangPortalUrl = 'https://dichvucong.danang.gov.vn/';
  const lienthongPortalUrl = 'https://lienthong.dichvucong.gov.vn/';
  const isLienthongService = selectedService.id === 'srv-khai-sinh' || selectedService.id === 'srv-khai-tu';

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCodeAndNavigate = (url: string) => {
    try {
      navigator.clipboard.writeText(`${selectedService.code} ${selectedService.name}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 4000);
    } catch {
      // ignore
    }
  };

  const toggleDocCheck = (docId: string) => {
    setCheckedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handleAudioPlayback = () => {
    if (isSpeaking) {
      stopAudio();
    } else {
      readText(selectedService.audioScript);
    }
  };

  const handleReplayAudio = () => {
    stopAudio();
    setTimeout(() => {
      readText(selectedService.audioScript);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-20">
      
      {/* Top Navigation & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 sticky top-18 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          <button
            onClick={() => {
              stopAudio();
              setCurrentScreen('citizen_home');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-red-600" />
            <span>Quay lại trang tra cứu</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={nationalPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleCopyCodeAndNavigate(nationalPortalUrl)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9b0e15] to-[#be111a] hover:from-[#7f0b11] hover:to-[#9b0e15] text-white font-bold text-xs sm:text-sm shadow-sm border border-amber-300 transition-all hover:scale-102"
              title="Mở Cổng Dịch vụ công Quốc gia (dichvucong.gov.vn)"
            >
              <ExternalLink className="w-4 h-4 text-amber-300" />
              <span>Cổng DVC Quốc gia (dichvucong.gov.vn)</span>
            </a>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>In phiếu</span>
            </button>
            <button
              onClick={() => setCurrentScreen('mindmap_view')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Toàn cảnh sơ đồ</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Service Title Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-lg bg-red-100 text-red-800 font-mono text-xs font-bold">
              Mã TTHC: {selectedService.code}
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
              Cấp thực hiện: UBND {selectedWard.name}
            </span>
            {assignedCounter && (
              <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Tiếp nhận tại: {assignedCounter.code}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {selectedService.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            {selectedService.summary}
          </p>

          {/* Voice Guidance Player Bar (Specially optimized for elderly citizens) */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-2 border-red-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Play / Pause Voice Button */}
              <button
                onClick={handleAudioPlayback}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                  isSpeaking
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5" />
                    <span>Tạm dừng đọc</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Bật giọng nói hướng dẫn</span>
                  </>
                )}
              </button>

              {/* Replay Button */}
              <button
                onClick={handleReplayAudio}
                className="p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-xs"
                title="Đọc lại từ đầu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Soundwaves Visualizer */}
              {isSpeaking && (
                <div className="flex items-center gap-1 h-6 px-2">
                  <span className="w-1 bg-red-600 rounded-full soundwave-bar" style={{ animationDelay: '0s' }}></span>
                  <span className="w-1 bg-red-600 rounded-full soundwave-bar" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1 bg-red-600 rounded-full soundwave-bar" style={{ animationDelay: '0.4s' }}></span>
                  <span className="w-1 bg-red-600 rounded-full soundwave-bar" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-1 bg-red-600 rounded-full soundwave-bar" style={{ animationDelay: '0.3s' }}></span>
                </div>
              )}
            </div>

            {/* Voice Speed Selector */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 w-full sm:w-auto justify-end">
              <span className="text-slate-500">Tốc độ đọc:</span>
              <button
                onClick={() => setVoiceSpeed(0.8)}
                className={`px-2.5 py-1 rounded-lg border ${
                  accessibility.voiceSpeed === 0.8 
                    ? 'bg-red-700 text-white border-red-700 font-bold' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Chậm (0.8x)
              </button>
              <button
                onClick={() => setVoiceSpeed(1.0)}
                className={`px-2.5 py-1 rounded-lg border ${
                  accessibility.voiceSpeed === 1.0 
                    ? 'bg-red-700 text-white border-red-700 font-bold' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Chuẩn (1.0x)
              </button>
            </div>

          </div>

          {/* Quick Metrics Bar: Fees & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Lệ phí thực hiện
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                  {selectedService.fee}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Nộp trực tiếp tại Thủ quỹ (Ô số 3) hoặc quét mã QR chuyển khoản
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Thời hạn giải quyết
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                  {selectedService.processingDuration}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Tính từ thời điểm tiếp nhận đủ hồ sơ hợp lệ
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 2-Column Split: Detailed Guidance (Left) & Sơ đồ Ô Tiếp Nhận (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Dossier Checklist & Steps (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Required Documents Checklist */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Thành phần hồ sơ cần chuẩn bị
                    </h2>
                    <p className="text-xs text-slate-500">
                      Bác có thể chạm vào ô vuông để tích dấu những giấy tờ mình đã có
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedService.requiredDocuments.map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc.id];

                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocCheck(doc.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                        isChecked 
                          ? 'bg-emerald-50/70 border-emerald-300' 
                          : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-slate-400 focus:outline-hidden"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-bold ${isChecked ? 'text-emerald-950 line-through opacity-70' : 'text-slate-900'}`}>
                            {doc.name}
                          </span>
                          {doc.isRequired ? (
                            <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                              Bắt buộc
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                              Tùy trường hợp
                            </span>
                          )}
                        </div>

                        {doc.note && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {doc.note}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-semibold text-slate-500">
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                            {doc.isOriginal ? 'Mang Bản chính' : 'Bản photo'}
                          </span>
                          {doc.isCopyOrCertified && (
                            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                              Bản sao chứng thực
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Elderly Support Assistance Note */}
              <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="block font-bold mb-0.5">Trợ giúp người cao tuổi viết đơn:</strong>
                  Bác không cần lo lắng về việc viết biểu mẫu. Khi đến quầy, Bác chỉ cần xuất trình Căn cước công dân, cán bộ tại 
                  <strong> Quầy Hướng dẫn</strong> hoặc <strong>Ô số 1, Ô số 2</strong> sẽ in sẵn tờ khai và điền thông tin giúp Bác hoàn toàn miễn phí.
                </div>
              </div>
            </div>

            {/* Step-by-Step Procedure */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-4 pb-3 border-b border-slate-100">
                Trình tự các bước thực hiện
              </h2>

              <div className="space-y-4">
                {selectedService.steps.map((step) => (
                  <div key={step.stepNumber} className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {step.stepNumber}
                    </div>

                    <div className="flex-1 pb-4 border-b border-slate-100 last:border-b-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-slate-900">
                          {step.title}
                        </h3>
                        {step.counterNote && (
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                            {step.counterNote}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ & Legal Basis */}
            {selectedService.faq && selectedService.faq.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Câu hỏi thường gặp của người dân
                </h2>

                <div className="space-y-3">
                  {selectedService.faq.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                      <p className="font-bold text-slate-900 mb-1">
                        Q: {item.question}
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        A: {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA: Chuyển đến Cổng Dịch vụ công Quốc gia (dichvucong.gov.vn) */}
            <div className="bg-gradient-to-br from-[#fef2f2] via-white to-amber-50/70 rounded-3xl p-6 sm:p-7 border-2 border-[#be111a]/30 shadow-md">
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#be111a] text-xs font-bold border border-red-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#be111a]" />
                    Cổng Dịch vụ công Quốc gia · dichvucong.gov.vn
                  </div>

                  {/* Copy Procedure Code Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyCodeAndNavigate(nationalPortalUrl)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#be111a] px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    title="Sao chép tên và mã thủ tục để dán vào ô tìm kiếm"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{copiedCode ? 'Đã sao chép!' : `Sao chép mã TTHC: ${selectedService.code}`}</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Nộp hồ sơ trực tuyến qua Cổng Dịch vụ công Quốc gia
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1">
                    Công dân có thể truy cập trực tiếp Cổng Dịch vụ công Quốc gia tại địa chỉ chính thức <strong>https://dichvucong.gov.vn/</strong>, đăng nhập tài khoản Định danh điện tử (VNeID) và thực hiện nộp hồ sơ trực tuyến ngay tại nhà.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Primary Button: Cổng DVC Quốc gia */}
                  <a
                    href="https://dichvucong.gov.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopyCodeAndNavigate('https://dichvucong.gov.vn/')}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#9b0e15] via-[#be111a] to-[#9b0e15] hover:from-[#7f0b11] hover:to-[#9b0e15] text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 border-2 border-amber-300 transition-all text-center"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-300" />
                    <span>ĐẾN CỔNG DVC QUỐC GIA (dichvucong.gov.vn)</span>
                  </a>

                  {/* Secondary Button: Cổng DVC TP. Đà Nẵng */}
                  <a
                    href="https://dichvucong.danang.gov.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopyCodeAndNavigate('https://dichvucong.danang.gov.vn/')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs border border-slate-300 transition-all hover:border-[#be111a]"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Cổng DVC TP. Đà Nẵng</span>
                  </a>

                  {/* Inter-connected services link */}
                  {isLienthongService && (
                    <a
                      href="https://lienthong.dichvucong.gov.vn/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs shadow-xs border border-amber-300 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Cổng Liên thông Đề án 06</span>
                    </a>
                  )}
                </div>

                {copiedCode && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã sao chép mã [{selectedService.code}] và tên thủ tục vào bộ nhớ tạm để Bác dễ dàng dán tìm kiếm trên cổng.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Sơ đồ Ô Tiếp Nhận Một Cửa & Officer Highlight (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Visual Floor & Counter Layout Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-red-200 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Sơ đồ quầy tiếp nhận
                    </h2>
                    <p className="text-xs text-slate-500">
                      Vị trí ô làm việc của thủ tục này
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-600 text-white animate-pulse">
                  ĐẾN {assignedCounter?.code.toUpperCase()}
                </span>
              </div>

              {/* Assigned Officer Spotlight Card */}
              {assignedOfficer && (
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 border border-red-200 flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-sm">
                    {assignedOfficer.name.split(' ').pop()?.[0] || 'C'}
                  </div>

                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
                      Cán bộ phụ trách tiếp nhận:
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      {assignedOfficer.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {assignedOfficer.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-red-600" />
                      Điện thoại liên hệ: <strong className="text-slate-800">{assignedOfficer.phone || selectedWard.hotline}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Visual Counter Layout Diagram (Map of Hall) */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  <span>Mặt bằng Hội trường Một Cửa</span>
                  <span className="text-amber-400">Cửa vào phía dưới ↓</span>
                </div>

                {/* Counters 1 to 6 Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  {currentWardCounters.slice(0, 6).map((counter) => {
                    const isTarget = counter.id === assignedCounter?.id;

                    return (
                      <div
                        key={counter.id}
                        className={`p-3 rounded-xl border transition-all text-center relative ${
                          isTarget
                            ? 'bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/40 shadow-lg scale-102 font-bold z-10'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
                        }`}
                      >
                        {isTarget && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                            Đích đến của Bác!
                          </span>
                        )}

                        <div className="text-xs font-black uppercase">
                          {counter.code}
                        </div>
                        <div className={`text-[11px] truncate mt-0.5 ${isTarget ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                          {counter.officerName}
                        </div>
                        <div className={`text-[10px] truncate mt-0.5 ${isTarget ? 'text-slate-800' : 'text-slate-500'}`}>
                          {counter.primaryField}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hallway / Waiting Area */}
                <div className="py-2 px-3 rounded-xl bg-slate-800/50 border border-dashed border-slate-700 text-center text-[11px] text-slate-400 mb-3">
                  Hàng ghế chờ của công dân & Màn hình gọi số điện tử
                </div>

                {/* Reception & Utility Desks (Entrance Area) */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Quầy hướng dẫn */}
                  <div className={`p-2.5 rounded-xl border text-center text-xs ${
                    assignedCounter?.id === 'counter-guide'
                      ? 'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300'
                      : 'bg-indigo-950/60 border-indigo-800 text-indigo-200'
                  }`}>
                    <div className="font-bold">Quầy Hướng dẫn (Đ/c Đại)</div>
                    <div className="text-[10px] opacity-80">Phát số thứ tự & Hướng dẫn số</div>
                  </div>

                  {/* Khu Tiện ích */}
                  <div className={`p-2.5 rounded-xl border text-center text-xs ${
                    assignedCounter?.id === 'counter-facility'
                      ? 'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300'
                      : 'bg-rose-950/60 border-rose-800 text-rose-200'
                  }`}>
                    <div className="font-bold">Khu Tiện ích (Đ/c Tâm)</div>
                    <div className="text-[10px] opacity-80">Nước uống & Photo miễn phí</div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-center text-[10px] text-slate-400">
                  Cửa chính vào trụ sở UBND {selectedWard.name}
                </div>
              </div>

              {/* View Full Mindmap Button */}
              <button
                onClick={() => setCurrentScreen('mindmap_view')}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                <Layers className="w-4 h-4 text-red-600" />
                <span>Xem toàn văn sơ đồ phân công 8 cán bộ phường</span>
              </button>
            </div>

            {/* Quick Action Button Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Thao tác nhanh cho công dân
              </h3>

              {/* Nộp trực tuyến qua Cổng DVC Quốc gia */}
              <a
                href={nationalPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#9b0e15] via-[#be111a] to-[#9b0e15] hover:from-[#7f0b11] hover:to-[#9b0e15] text-white font-bold text-sm shadow-md hover:shadow-lg border-2 border-amber-300 transition-all hover:scale-101 group"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>Đến Cổng DVC Quốc gia (Nộp online)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0" />
              </a>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Printer className="w-5 h-5 text-white" />
                  <span>In Phiếu hướng dẫn mang về</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleAudioPlayback}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-sm transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-5 h-5 text-emerald-700" />
                  <span>{isSpeaking ? 'Dừng đọc giọng nói' : 'Nghe đọc lại hướng dẫn'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Printable Guidance Receipt Modal */}
      <PrintableGuideModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        service={selectedService}
        counter={assignedCounter}
        officer={assignedOfficer}
        ward={selectedWard}
      />

    </div>
  );
};
