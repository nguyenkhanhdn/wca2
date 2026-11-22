import React, { useEffect, useState } from 'react';
import {
  X,
  Printer,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  FileText,
  FilePenLine,
  Sparkles,
  UserCheck,
  PenLine,
  MapPin,
} from 'lucide-react';
import { SampleFormTemplate } from '../data/sampleForms';
import { Counter, Ward } from '../types';

interface SampleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: SampleFormTemplate;
  serviceName: string;
  serviceCode: string;
  ward: Ward;
  counter?: Counter;
  initialMode?: 'filled' | 'blank';
  onReadText: (text: string) => void;
  onStopAudio: () => void;
  isSpeaking: boolean;
}

export const SampleFormModal: React.FC<SampleFormModalProps> = ({
  isOpen,
  onClose,
  form,
  serviceName,
  serviceCode,
  ward,
  counter,
  initialMode = 'filled',
  onReadText,
  onStopAudio,
  isSpeaking,
}) => {
  const [mode, setMode] = useState<'filled' | 'blank'>(initialMode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const textScaleClass =
    fontSize === 'xlarge'
      ? 'text-[17px] leading-relaxed'
      : fontSize === 'large'
        ? 'text-[15.5px] leading-relaxed'
        : 'text-sm leading-relaxed';

  const handleSpeakSampleTip = () => {
    if (isSpeaking) {
      onStopAudio();
    } else {
      const citizenFields = form.sections
        .flatMap((sec) => sec.fields)
        .filter((f) => f.citizenMustFill)
        .slice(0, 5)
        .map((f) => f.label)
        .join(', ');
      const fullScript = `${form.spokenTip} ${form.elderlyTip} Các mục chính Bác cần chú ý gồm: ${citizenFields}.`;
      onReadText(fullScript);
    }
  };

  const handlePrintForm = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:static print:bg-white print:p-0 print:block"
      onClick={onClose}
    >
      <div
        className={`relative bg-white shadow-2xl border border-slate-300 flex flex-col overflow-hidden transition-all print:shadow-none print:border-none print:rounded-none print:max-h-none print:w-full print:max-w-none ${
          isFullscreen
            ? 'w-full h-full max-w-none rounded-none sm:rounded-2xl max-h-[98vh]'
            : 'w-full max-w-4xl rounded-3xl max-h-[92vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar (Not printed) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-sm sm:text-base truncate">
                Xem mẫu tờ khai minh họa
              </h2>
              <p className="text-xs text-slate-300 truncate">
                {form.formCode} · Mã TTHC: {serviceCode}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Font Size Control */}
            <div className="hidden md:flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  fontSize === 'normal'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Vừa
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  fontSize === 'large'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                To
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  fontSize === 'xlarge'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Rất to
              </button>
            </div>

            {/* Voice Guide Button */}
            <button
              type="button"
              onClick={handleSpeakSampleTip}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Dừng đọc</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe hướng dẫn ghi mẫu</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrintForm}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#be111a] hover:bg-red-700 text-white text-xs font-bold shadow transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In mẫu tờ khai này</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={isFullscreen ? 'Thu gọn cửa sổ' : 'Phóng to toàn màn hình'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                onStopAudio();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ xem mẫu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Bar (Not printed) */}
        <div className="px-4 sm:px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setMode('filled')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                mode === 'filled'
                  ? 'bg-[#be111a] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Mẫu điền sẵn (Ví dụ minh họa)</span>
            </button>
            {form.hasBlankPrintableForm && (
              <button
                type="button"
                onClick={() => setMode('blank')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  mode === 'blank'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FilePenLine className="w-4 h-4" />
                <span>Mẫu trắng để in</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
              <PenLine className="w-3.5 h-3.5" />
              Mục màu vàng: Bác cần điền/kiểm tra
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Mục màu xanh: Cán bộ hỗ trợ
            </span>
          </div>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8fafc] print:bg-white print:p-0 print:overflow-visible">
          <div
            className={`sample-form-print-sheet max-w-3xl mx-auto bg-white border border-slate-300 rounded-2xl shadow-sm p-6 sm:p-10 text-slate-900 ${textScaleClass} print:border-none print:shadow-none print:rounded-none print:p-2`}
          >
            {/* Official National Header (Quốc hiệu & Tiêu ngữ) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center pb-5 border-b-2 border-slate-900 mb-6">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-600">
                  ỦY BAN NHÂN DÂN THÀNH PHỐ ĐÀ NẴNG
                </p>
                <p className="text-sm uppercase font-black text-red-800 mt-0.5">
                  UBND {ward.name.toUpperCase()}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bộ phận Tiếp nhận và Trả kết quả
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-black tracking-wide text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="text-xs font-bold border-b border-slate-800 inline-block pb-0.5 mt-0.5">
                  Độc lập - Tự do - Hạnh phúc
                </p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {form.formCode}
                </p>
              </div>
            </div>

            {/* Form Title */}
            <div className="text-center mb-6">
              {mode === 'filled' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase mb-2 print:hidden">
                  Ví dụ điền sẵn minh họa · Không phải hồ sơ thật
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-950 tracking-tight">
                {form.title}
              </h3>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {form.subtitle}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Áp dụng cho thủ tục: <strong className="text-slate-700">{serviceName}</strong>
              </p>
            </div>

            {/* Elderly Assistance Callout (shown in Filled Example mode, hidden on clean blank print) */}
            {mode === 'filled' && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3 print:border print:bg-white">
                <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                  <strong className="font-black block mb-0.5">
                    Lời khuyên dành cho Bác trước khi viết đơn:
                  </strong>
                  {form.elderlyTip}
                  {counter && (
                    <span className="block mt-1 font-bold text-red-800">
                      Nơi tiếp nhận: {counter.code} · Bàn {counter.positionNumber} ({counter.officerName})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Form Sections */}
            <div className="space-y-6">
              {form.sections.map((section, sIdx) => (
                <div
                  key={sIdx}
                  className={
                    mode === 'filled'
                      ? 'rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3.5'
                      : 'space-y-3'
                  }
                >
                  <h4 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-tight border-b border-slate-200 pb-2">
                    {section.heading}
                  </h4>

                  {mode === 'filled' ? (
                    <div className="space-y-3">
                      {section.fields.map((field, fIdx) => (
                        <div
                          key={fIdx}
                          className={`p-3.5 rounded-xl border ${
                            field.citizenMustFill
                              ? 'bg-white border-amber-300 shadow-2xs'
                              : 'bg-sky-50/70 border-sky-200'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">
                              {field.label}
                            </span>
                            {field.citizenMustFill ? (
                              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                Bác điền mục này
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                                Cán bộ hỗ trợ
                              </span>
                            )}
                          </div>

                          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-dashed border-slate-300 font-semibold text-red-900">
                            {field.sampleValue}
                          </div>

                          {field.fillHint && (
                            <p className="text-xs text-slate-600 mt-1.5 flex items-start gap-1.5">
                              <span className="font-bold text-emerald-700 shrink-0">Gợi ý:</span>
                              <span>{field.fillHint}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Blank Printable Form Layout */
                    <div className="space-y-4">
                      {section.fields.map((field, fIdx) => {
                        const lineCount = field.blankLines || 1;
                        return (
                          <div key={fIdx} className="space-y-1.5">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {field.label}:
                              </span>
                              <span className="text-[11px] text-slate-500 italic shrink-0 print:hidden">
                                {field.citizenMustFill ? '(Công dân ghi)' : '(Cán bộ hỗ trợ nếu cần)'}
                              </span>
                            </div>
                            {Array.from({ length: lineCount }).map((_, lIdx) => (
                              <div
                                key={lIdx}
                                className="h-7 border-b border-dotted border-slate-500 w-full"
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Signature & Date Section */}
            <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
              <div className="text-left text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Lưu ý khi nộp trực tiếp tại UBND Phường Sơn Trà:</p>
                <p>- Địa chỉ: {ward.address}</p>
                <p>- Đường dây nóng hỗ trợ: {ward.hotline}</p>
                <p>- Căn cứ pháp lý: {form.legalNote}</p>
              </div>
              <div>
                <p className="text-xs italic text-slate-700">
                  Phường Sơn Trà, ngày ....... tháng ....... năm 20......
                </p>
                <p className="text-sm font-black text-slate-900 uppercase mt-1">
                  {form.signatureLabel}
                </p>
                <div className="h-20 flex items-end justify-center text-xs italic text-slate-400">
                  {mode === 'filled' ? 'Ví dụ: Nguyễn Văn Hùng (Ký và ghi rõ họ tên)' : '(Ký và ghi rõ họ tên)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Modal Bar (Not printed) */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <p className="text-xs text-slate-500">
            {form.legalNote}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {form.hasBlankPrintableForm && (
              <button
                type="button"
                onClick={() => setMode((m) => (m === 'filled' ? 'blank' : 'filled'))}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                {mode === 'filled' ? 'Chuyển sang Mẫu trắng để in' : 'Xem lại Ví dụ điền sẵn'}
              </button>
            )}
            <button
              type="button"
              onClick={handlePrintForm}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#be111a] hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In mẫu tờ khai này</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onStopAudio();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
