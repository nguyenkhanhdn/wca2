import React, { useEffect, useState } from 'react';
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
  Phone, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Copy,
  MessageSquareText,
  Eye,
  FilePenLine,
  ClipboardCheck,
  ShieldAlert
} from 'lucide-react';
import { useApp, sanitizeServiceNationalPortalUrl } from '../context/AppContext';
import { SAMPLE_FORMS_BY_SERVICE } from '../data/sampleForms';
import { PrintableGuideModal } from './PrintableGuideModal';
import { SampleFormModal } from './SampleFormModal';

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
    accessibility,
    setVoiceSpeed,
    openAIAssistant
  } = useApp();

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSampleFormModalOpen, setIsSampleFormModalOpen] = useState(false);
  const [sampleFormInitialMode, setSampleFormInitialMode] = useState<'filled' | 'blank'>('filled');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Restore session checklist marks per service
  useEffect(() => {
    if (!selectedService?.id) {
      setCheckedDocs({});
      return;
    }
    try {
      const saved = sessionStorage.getItem(`kiosk-checklist-${selectedService.id}`);
      setCheckedDocs(saved ? JSON.parse(saved) : {});
    } catch {
      setCheckedDocs({});
    }
  }, [selectedService?.id]);

  // Toggle body print isolation class when any print modal is open
  useEffect(() => {
    const isAnyModalOpen = isPrintModalOpen || isSampleFormModalOpen;
    document.body.classList.toggle('printing-modal-only', isAnyModalOpen);
    return () => {
      document.body.classList.remove('printing-modal-only');
    };
  }, [isPrintModalOpen, isSampleFormModalOpen]);

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
  const nationalPortalUrl = sanitizeServiceNationalPortalUrl(selectedService);

  const danangPortalUrl = 'https://dichvucong.danang.gov.vn/';
  const lienthongPortalUrl = 'https://lienthong.dichvucong.gov.vn/';
  const isLienthongService = selectedService.id === 'srv-khai-sinh' || selectedService.id === 'srv-khai-tu';

  const handleCopyCodeAndNavigate = (url: string) => {
    try {
      navigator.clipboard.writeText(`${selectedService.code} ${selectedService.name}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 4000);
    } catch {
      // ignore
    }
  };

  const handleCopyLink = (url: string) => {
    try {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 4000);
    } catch {
      // ignore
    }
  };

  const toggleDocCheck = (docId: string) => {
    setCheckedDocs(prev => {
      const next = { ...prev, [docId]: !prev[docId] };
      try {
        sessionStorage.setItem(`kiosk-checklist-${selectedService.id}`, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const resetChecklist = () => {
    setCheckedDocs({});
    try {
      sessionStorage.removeItem(`kiosk-checklist-${selectedService.id}`);
    } catch {
      // ignore
    }
  };

  const sampleForm = SAMPLE_FORMS_BY_SERVICE[selectedService.id];

  const openSampleForm = (mode: 'filled' | 'blank' = 'filled') => {
    stopAudio();
    setSampleFormInitialMode(mode);
    setIsSampleFormModalOpen(true);
  };

  // Pre-submission readiness calculation
  const requiredDocs = selectedService.requiredDocuments.filter(d => d.isRequired);
  const optionalDocs = selectedService.requiredDocuments.filter(d => !d.isRequired);
  const checkedRequiredDocs = requiredDocs.filter(d => !!checkedDocs[d.id]);
  const missingRequiredDocs = requiredDocs.filter(d => !checkedDocs[d.id]);
  const checkedOptionalCount = optionalDocs.filter(d => !!checkedDocs[d.id]).length;
  const totalCheckedCount = Object.values(checkedDocs).filter(Boolean).length;
  const totalRequired = requiredDocs.length;
  const readinessPct = totalRequired > 0 ? Math.round((checkedRequiredDocs.length / totalRequired) * 100) : 100;
  const isReadyToSubmit = missingRequiredDocs.length === 0;

  const isDocFormItem = (docName: string, sampleFormName?: string) =>
    Boolean(sampleFormName) || /tờ khai|mẫu|đơn đề nghị|giấy đề nghị|giấy cam kết|phiếu/i.test(docName);

  const missingHasForm = missingRequiredDocs.some(d => isDocFormItem(d.name, d.sampleFormName));
  const missingHasCCCD = missingRequiredDocs.some(d => /cccd|căn cước|định danh|tùy thân/i.test(d.name));
  const missingHasCopy = missingRequiredDocs.some(d => !d.isOriginal || d.isCopyOrCertified || /bản sao|photo|trích lục/i.test(d.name));

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

  const handleSpeakReadiness = () => {
    if (isSpeaking) {
      stopAudio();
      return;
    }
    const targetCounterText = assignedCounter
      ? `${assignedCounter.code}, bàn số ${assignedCounter.positionNumber}, gặp ${assignedCounter.officerName}`
      : 'Bộ phận Một cửa';
    if (isReadyToSubmit) {
      readText(
        `Chúc mừng Bác! Bác đã đánh dấu đủ ${totalRequired} loại giấy tờ bắt buộc cho thủ tục ${selectedService.name}. Bác vui lòng đến ${targetCounterText} để nộp hồ sơ nhé.`
      );
    } else {
      const missingList = missingRequiredDocs.map(d => d.name).join(', ');
      readText(
        `Bác đã chuẩn bị ${checkedRequiredDocs.length} trên ${totalRequired} giấy tờ bắt buộc. Hiện còn thiếu ${missingRequiredDocs.length} mục là: ${missingList}. Nếu thiếu đơn mẫu hoặc bản photo, Bác ghé Quầy Hướng dẫn ở cửa vào để được hỗ trợ miễn phí nhé.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-20">
      <div className={isPrintModalOpen || isSampleFormModalOpen ? 'print:hidden' : ''}>
      
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
            {sampleForm && (
              <button
                type="button"
                onClick={() => openSampleForm('filled')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-xs border border-amber-500/40 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Xem mẫu tờ khai</span>
              </button>
            )}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>In phiếu</span>
            </button>
            <button
              onClick={() => setCurrentScreen('mindmap_view')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
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
            
            {/* Required Documents Checklist & Pre-Submission Self-Check */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold shrink-0">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Thành phần hồ sơ &amp; Tự kiểm tra trước khi vào quầy
                    </h2>
                    <p className="text-xs text-slate-500">
                      Chạm vào từng ô vuông để đánh dấu giấy tờ Bác đã mang theo
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {sampleForm && (
                    <button
                      type="button"
                      onClick={() => openSampleForm('filled')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem mẫu điền sẵn</span>
                    </button>
                  )}
                  {totalCheckedCount > 0 && (
                    <button
                      type="button"
                      onClick={resetChecklist}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Đặt lại đánh dấu</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Pre-Check Progress Meter */}
              <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold mb-2">
                  <span className="text-slate-800">
                    Tiến độ chuẩn bị giấy tờ bắt buộc:{' '}
                    <strong className={isReadyToSubmit ? 'text-emerald-700' : 'text-red-700'}>
                      {checkedRequiredDocs.length}/{totalRequired} loại đã sẵn sàng
                    </strong>
                    {optionalDocs.length > 0 && checkedOptionalCount > 0 && (
                      <span className="text-slate-500 font-medium ml-1.5">
                        (+{checkedOptionalCount} giấy tờ tùy trường hợp)
                      </span>
                    )}
                  </span>
                  <span className={`font-mono ${isReadyToSubmit ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {readinessPct}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isReadyToSubmit ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${readinessPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {selectedService.requiredDocuments.map((doc) => {
                  const isChecked = !!checkedDocs[doc.id];
                  const showSampleBtn = sampleForm && isDocFormItem(doc.name, doc.sampleFormName);

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
                        aria-label={`Đánh dấu ${doc.name}`}
                        className="mt-0.5 text-slate-400 focus:outline-hidden shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-bold ${isChecked ? 'text-emerald-950 line-through opacity-75' : 'text-slate-900'}`}>
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

                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                              {doc.isOriginal ? 'Mang Bản chính' : 'Bản photo'}
                            </span>
                            {doc.isCopyOrCertified && (
                              <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                                Bản sao chứng thực
                              </span>
                            )}
                          </div>

                          {showSampleBtn && (
                            <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => openSampleForm('filled')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] border border-amber-300 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem mẫu điền sẵn</span>
                              </button>
                              {sampleForm.hasBlankPrintableForm && (
                                <button
                                  type="button"
                                  onClick={() => openSampleForm('blank')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-300 transition-colors cursor-pointer"
                                >
                                  <FilePenLine className="w-3.5 h-3.5" />
                                  <span>Mẫu trắng để in</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Pre-Submission Readiness Banner */}
              {isReadyToSubmit ? (
                <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-emerald-950">
                        Hồ sơ của Bác đã sẵn sàng để vào quầy!
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-900 mt-0.5 leading-relaxed">
                        Bác đã kiểm tra đủ <strong>{totalRequired}/{totalRequired} giấy tờ bắt buộc</strong>. Vui lòng di chuyển tới{' '}
                        <strong>
                          {assignedCounter
                            ? `${assignedCounter.code} (Bàn ${assignedCounter.positionNumber} · ${assignedCounter.officerName})`
                            : 'Quầy tiếp nhận Một cửa'}
                        </strong>{' '}
                        để nộp hồ sơ.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSpeakReadiness}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe xác nhận hồ sơ đủ</span>
                  </button>
                </div>
              ) : (
                <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-black text-amber-950">
                          Còn {missingRequiredDocs.length} giấy tờ bắt buộc chưa được đánh dấu
                        </h3>
                        <p className="text-xs text-amber-900 mt-0.5">
                          Bác kiểm tra xem mình đã có đủ những giấy tờ dưới đây chưa trước khi lấy số vào quầy nhé:
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSpeakReadiness}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-800" />
                      <span>Nghe nhắc giấy tờ còn thiếu</span>
                    </button>
                  </div>

                  <ul className="space-y-1.5 pl-2">
                    {missingRequiredDocs.map((missing) => (
                      <li key={missing.id} className="text-xs font-bold text-red-900 flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>{missing.name}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Contextual Ward Assistance Solutions */}
                  <div className="pt-2.5 border-t border-amber-200/80 space-y-1.5 text-xs text-amber-950 leading-relaxed">
                    <p className="font-black text-amber-900 uppercase tracking-wide text-[11px]">
                      Giải pháp hỗ trợ miễn phí ngay tại Phường Sơn Trà:
                    </p>
                    {missingHasForm && (
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                        <span>
                          • <strong>Chưa có tờ khai / khó viết đơn:</strong> Ghé <strong>Quầy Hướng dẫn (Đ/c Phạm Duy Đại)</strong> ở cửa vào để được in sẵn và viết hộ miễn phí.
                        </span>
                        {sampleForm && (
                          <button
                            type="button"
                            onClick={() => openSampleForm('filled')}
                            className="shrink-0 px-2.5 py-1 rounded-lg bg-[#be111a] hover:bg-red-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Xem mẫu điền sẵn ngay
                          </button>
                        )}
                      </div>
                    )}
                    {missingHasCCCD && (
                      <p>
                        • <strong>Quên mang thẻ CCCD bản cứng:</strong> Bác có thể xuất trình ứng dụng <strong>VNeID mức độ 2</strong> trên điện thoại, cán bộ quầy chấp nhận tương đương bản chính.
                      </p>
                    )}
                    {missingHasCopy && (
                      <p>
                        • <strong>Chưa có bản photo giấy tờ:</strong> Đến <strong>Khu Tiện ích (Đ/c Mai Thị Thanh Tâm)</strong> ngay trong hội trường để được photocopy hoàn toàn miễn phí.
                      </p>
                    )}
                    {!missingHasForm && !missingHasCCCD && !missingHasCopy && (
                      <p>
                        • Bác vui lòng mang đầy đủ giấy tờ bản chính đối chiếu hoặc liên hệ <strong>Quầy Hướng dẫn (Đ/c Phạm Duy Đại)</strong> để được kiểm tra trước khi bấm số.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Elderly Support Assistance Note */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="block font-bold text-slate-900 mb-0.5">Hỗ trợ người cao tuổi viết đơn:</strong>
                  Bác không cần lo lắng về việc viết biểu mẫu. Khi đến quầy, Bác chỉ cần xuất trình Căn cước công dân, cán bộ tại{' '}
                  <strong>Quầy Hướng dẫn</strong> hoặc <strong>{assignedCounter?.code || 'Ô tiếp nhận'}</strong> sẽ hỗ trợ kiểm tra và điền thông tin giúp Bác hoàn toàn miễn phí.
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
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#be111a] text-xs font-bold border border-red-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#be111a]" />
                    Cổng Dịch vụ công Quốc gia · dichvucong.gov.vn
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Copy Procedure Code Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyCodeAndNavigate(nationalPortalUrl)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#be111a] px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                      title="Sao chép tên và mã thủ tục để dán vào ô tìm kiếm"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>{copiedCode ? 'Đã sao chép mã!' : `Mã TTHC: ${selectedService.code}`}</span>
                    </button>

                    {/* Copy Direct Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(nationalPortalUrl)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#be111a] px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                      title="Sao chép đường liên kết chính thức đến thủ tục này"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>{copiedLink ? 'Đã sao chép liên kết!' : 'Sao chép link'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Nộp hồ sơ trực tuyến qua Cổng Dịch vụ công Quốc gia
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1">
                    Công dân có thể truy cập trực tiếp trang chi tiết và nộp hồ sơ của thủ tục này tại địa chỉ chính thức của Cổng DVC Quốc gia, đăng nhập tài khoản Định danh điện tử (VNeID) và thực hiện nộp trực tuyến ngay tại nhà.
                  </p>
                </div>

                {/* Direct Procedure Link display */}
                <div className="p-3 bg-white/90 rounded-2xl border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="truncate w-full sm:w-auto">
                    <span className="font-bold text-slate-500 block sm:inline mr-2">Liên kết chính thức:</span>
                    <a
                      href={nationalPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-red-700 hover:underline break-all"
                    >
                      {nationalPortalUrl}
                    </a>
                  </div>
                  <a
                    href={nationalPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-[11px] inline-flex items-center gap-1"
                  >
                    <span>Mở tab mới</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Primary Button: Direct to this procedure on Cổng DVC Quốc gia */}
                  <a
                    href={nationalPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopyCodeAndNavigate(nationalPortalUrl)}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#9b0e15] via-[#be111a] to-[#9b0e15] hover:from-[#7f0b11] hover:to-[#9b0e15] text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 border-2 border-amber-300 transition-all text-center"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-300" />
                    <span>MỞ TRỰC TIẾP TRÊN DVC QUỐC GIA (dichvucong.gov.vn)</span>
                  </a>

                  {/* Secondary Button: Cổng DVC TP. Đà Nẵng */}
                  <a
                    href={danangPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopyCodeAndNavigate(danangPortalUrl)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs border border-slate-300 transition-all hover:border-[#be111a]"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Cổng DVC TP. Đà Nẵng</span>
                  </a>

                  {/* Inter-connected services link */}
                  {isLienthongService && (
                    <a
                      href={lienthongPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs shadow-xs border border-amber-300 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Cổng DVC Liên thông Đề án 06</span>
                    </a>
                  )}

                  {/* Portal Home link */}
                  <a
                    href="https://dichvucong.gov.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>Trang chủ Cổng DVC</span>
                  </a>
                </div>

                {copiedCode && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã sao chép mã [{selectedService.code}] và tên thủ tục vào bộ nhớ tạm để Bác dễ dàng dán tìm kiếm trên cổng.
                  </p>
                )}

                {copiedLink && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã sao chép đường dẫn chính thức ({nationalPortalUrl}) vào bộ nhớ tạm!
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

              {sampleForm && (
                <button
                  type="button"
                  onClick={() => openSampleForm('filled')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm shadow-sm border border-amber-500/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-amber-950" />
                    <span>Xem mẫu tờ khai minh họa &amp; In mẫu trắng</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Printer className="w-5 h-5 text-white" />
                  <span>In Phiếu hướng dẫn mang về</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleAudioPlayback}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-sm transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-5 h-5 text-emerald-700" />
                  <span>{isSpeaking ? 'Dừng đọc giọng nói' : 'Nghe đọc lại hướng dẫn'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() =>
                  openAIAssistant(
                    `Cho tôi hỏi chi tiết về thủ tục "${selectedService.name}" (mã ${selectedService.code}): cần mẫu tờ khai nào, giấy tờ gì và thực hiện từng bước ra sao?`
                  )
                }
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquareText className="w-5 h-5 text-amber-300" />
                  <span>Hỏi Trợ lý AI về thủ tục &amp; mẫu đơn này</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>

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

      {/* Illustrated Sample Form & Blank Printable Form Modal */}
      {sampleForm && (
        <SampleFormModal
          isOpen={isSampleFormModalOpen}
          onClose={() => setIsSampleFormModalOpen(false)}
          form={sampleForm}
          serviceName={selectedService.name}
          serviceCode={selectedService.code}
          ward={selectedWard}
          counter={assignedCounter}
          initialMode={sampleFormInitialMode}
          onReadText={readText}
          onStopAudio={stopAudio}
          isSpeaking={isSpeaking}
        />
      )}

    </div>
  );
};
