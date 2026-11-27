import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  ClipboardList,
  MapPin,
  Printer,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  Clock,
  CheckSquare,
  Square,
  Phone,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  consolidateDocumentsForServices,
  getServiceLevelInfo,
  getWardOfficeStatus
} from '../utils/officeHours';

export const VisitPlanModal: React.FC = () => {
  const {
    isVisitPlanModalOpen,
    setIsVisitPlanModalOpen,
    visitPlanIds,
    removeFromVisitPlan,
    clearVisitPlan,
    currentWardServices,
    currentWardCounters,
    selectedWard,
    selectService,
    readText,
    stopAudio,
    isSpeaking
  } = useApp();

  const [checkedKeys, setCheckedKeys] = useState<Record<string, boolean>>({});
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('printing-modal-only', isVisitPlanModalOpen);
    return () => {
      document.body.classList.remove('printing-modal-only');
    };
  }, [isVisitPlanModalOpen]);

  const plannedServices = useMemo(() => {
    return visitPlanIds
      .map((id) => currentWardServices.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  }, [visitPlanIds, currentWardServices]);

  const consolidatedDocs = useMemo(
    () => consolidateDocumentsForServices(plannedServices),
    [plannedServices]
  );

  const counterRoute = useMemo(() => {
    const map = new Map<string, { counter: (typeof currentWardCounters)[number]; serviceNames: string[] }>();
    for (const srv of plannedServices) {
      const counter = currentWardCounters.find((c) => c.id === srv.counterId);
      if (!counter) continue;
      const existing = map.get(counter.id);
      if (existing) {
        existing.serviceNames.push(srv.name);
      } else {
        map.set(counter.id, { counter, serviceNames: [srv.name] });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => a.counter.positionNumber - b.counter.positionNumber
    );
  }, [plannedServices, currentWardCounters]);

  const officeStatus = getWardOfficeStatus();

  if (!isVisitPlanModalOpen) return null;

  const toggleDocKey = (key: string) => {
    setCheckedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const buildShareText = () => {
    const lines: string[] = [
      `KẾ HOẠCH CHUẨN BỊ HỒ SƠ — UBND ${selectedWard.name.toUpperCase()}`,
      `Địa chỉ: ${selectedWard.address}`,
      `Giờ làm việc: ${selectedWard.workingHours} · Hotline: ${selectedWard.hotline}`,
      '',
      `1. DANH SÁCH THỦ TỤC DỰ ĐỊNH LÀM (${plannedServices.length}):`
    ];

    plannedServices.forEach((srv, idx) => {
      const counter = currentWardCounters.find((c) => c.id === srv.counterId);
      const levelInfo = getServiceLevelInfo(srv.level);
      lines.push(
        `  ${idx + 1}. ${srv.name} (Mã: ${srv.code})`,
        `     - Quầy: ${counter ? `${counter.code} · Bàn ${counter.positionNumber} (${counter.officerName})` : 'Một cửa'}`,
        `     - Lệ phí: ${srv.fee} · Thời hạn: ${srv.processingDuration}`,
        `     - Hình thức: ${levelInfo.shortLabel}`
      );
    });

    lines.push('', '2. TẬP GIẤY TỜ CẦN MANG THEO (ĐÃ GỘP TRÙNG):');
    consolidatedDocs.forEach((doc, idx) => {
      const reqTag = doc.isRequired ? '[Bắt buộc]' : '[Tùy trường hợp]';
      lines.push(`  ${idx + 1}. ${doc.displayName} ${reqTag}`);
    });

    lines.push(
      '',
      'Lưu ý: Tại Quầy Hướng dẫn (Đ/c Phạm Duy Đại) hỗ trợ viết hộ đơn miễn phí; Khu Tiện ích (Đ/c Mai Thị Thanh Tâm) photocopy miễn phí cho người dân.'
    );
    return lines.join('\n');
  };

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3500);
    } catch {
      // Ignore clipboard failure in restricted iframes
    }
  };

  const handleSpeakPlan = () => {
    if (isSpeaking) {
      stopAudio();
      return;
    }
    if (plannedServices.length === 0) return;

    const procNames = plannedServices.map((s) => s.name).join(', ');
    const routeNames = counterRoute
      .map((r) => `${r.counter.code} bàn số ${r.counter.positionNumber}`)
      .join(', rồi sang ');
    const docNames = consolidatedDocs
      .filter((d) => d.isRequired)
      .map((d) => d.displayName)
      .join(', ');

    const script = `Kế hoạch chuẩn bị của Bác gồm ${plannedServices.length} thủ tục là: ${procNames}. Khi đến ${selectedWard.name}, Bác sẽ ghé ${routeNames}. Những giấy tờ bắt buộc Bác cần mang theo gồm: ${docNames}. Bác nhớ kiểm tra đủ trước khi xuất phát nhé.`;
    readText(script);
  };

  const checkedRequiredCount = consolidatedDocs.filter((d) => d.isRequired && checkedKeys[d.key]).length;
  const totalRequiredCount = consolidatedDocs.filter((d) => d.isRequired).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:static print:bg-white print:p-0 print:block"
      onClick={() => {
        stopAudio();
        setIsVisitPlanModalOpen(false);
      }}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header (Not printed) */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg">
                Kế hoạch chuẩn bị trước khi đến Phường
              </h2>
              <p className="text-xs text-slate-300">
                Gộp giấy tờ, lộ trình các ô và dự trù lệ phí cho {plannedServices.length} thủ tục đã lưu
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {plannedServices.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleSpeakPlan}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? 'Dừng đọc' : 'Nghe danh sách mang theo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#be111a] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In bảng chuẩn bị</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                stopAudio();
                setIsVisitPlanModalOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
              aria-label="Đóng bảng kế hoạch"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-[#f8fafc] print:bg-white print:p-2 print:overflow-visible">
          {/* Print Header */}
          <div className="hidden print:block text-center pb-4 border-b-2 border-slate-900">
            <p className="text-xs font-bold uppercase text-slate-600">
              UBND {selectedWard.name.toUpperCase()} · TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG
            </p>
            <h1 className="text-xl font-black uppercase text-red-800 mt-1">
              BẢNG KẾ HOẠCH CHUẨN BỊ HỒ SƠ MANG THEO
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Địa chỉ: {selectedWard.address} · Hotline: {selectedWard.hotline}
            </p>
          </div>

          {plannedServices.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Bác chưa lưu thủ tục nào vào kế hoạch
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Khi tra cứu danh mục thủ tục ở nhà, Bác chạm nút <strong>"+ Lưu kế hoạch"</strong> trên các thủ tục muốn làm để hệ thống gộp sẵn toàn bộ giấy tờ cần mang trong một chuyến đi.
              </p>
            </div>
          ) : (
            <>
              {/* Office Hours & Visit Timing Notice */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Clock className={`w-4 h-4 shrink-0 ${officeStatus.isOpen ? 'text-emerald-600' : 'text-amber-700'}`} />
                    <span>{officeStatus.statusLabel}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {officeStatus.detailText} {officeStatus.bestVisitTip}
                  </p>
                </div>
                <div className="text-xs text-slate-600 shrink-0 sm:text-right space-y-0.5">
                  <div className="font-bold text-slate-900">{selectedWard.address}</div>
                  <div className="flex items-center sm:justify-end gap-1 text-red-700 font-bold tabular-nums">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedWard.hotline}</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Planned Procedures & Submission Channel */}
              <section className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    1. Thủ tục dự định thực hiện ({plannedServices.length})
                  </h3>
                  <button
                    type="button"
                    onClick={clearVisitPlan}
                    className="print:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tất cả</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {plannedServices.map((srv, idx) => {
                    const counter = currentWardCounters.find((c) => c.id === srv.counterId);
                    const levelInfo = getServiceLevelInfo(srv.level);

                    return (
                      <div
                        key={srv.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="font-mono font-bold text-red-800">#{idx + 1} · {srv.code}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-bold text-slate-800">
                              {counter ? `${counter.code} (Bàn ${counter.positionNumber})` : 'Quầy Một cửa'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className={levelInfo.canOnlineFromHome ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
                              {levelInfo.shortLabel}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            {srv.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 tabular-nums">
                            <span>Lệ phí: <strong className="text-red-700">{srv.fee}</strong></span>
                            <span aria-hidden="true">·</span>
                            <span>Thời hạn: <strong>{srv.processingDuration}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 print:hidden">
                          <button
                            type="button"
                            onClick={() => {
                              setIsVisitPlanModalOpen(false);
                              selectService(srv);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs cursor-pointer"
                          >
                            <span>Chi tiết</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromVisitPlan(srv.id)}
                            className="px-2.5 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-200 font-semibold text-xs cursor-pointer"
                            title="Bỏ khỏi kế hoạch"
                          >
                            Bỏ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 2: Ordered Counter Route inside Ward */}
              {counterRoute.length > 0 && (
                <section className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-700" />
                    <span>2. Lộ trình các Ô sẽ ghé tại Hội trường Một cửa</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {counterRoute.map((stop, idx) => (
                      <div key={stop.counter.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-red-700">
                          Điểm dừng {idx + 1} · {stop.counter.code} (Bàn {stop.counter.positionNumber})
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {stop.counter.officerName}
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-2">
                          Làm: {stop.serviceNames.join('; ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 3: Consolidated Document Bag Checklist */}
              <section className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      3. Tập giấy tờ cần bỏ vào túi mang đi (Đã gộp trùng)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đã tích sẵn ở nhà: <strong className="text-emerald-700 tabular-nums">{checkedRequiredCount}/{totalRequiredCount}</strong> loại giấy tờ bắt buộc
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 print:hidden">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Thủ tục Toàn trình có thể nộp online trước ở nhà</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {consolidatedDocs.map((doc) => {
                    const checked = !!checkedKeys[doc.key];
                    return (
                      <div
                        key={doc.key}
                        onClick={() => toggleDocKey(doc.key)}
                        className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 select-none ${
                          checked
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {checked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className={`text-sm font-bold ${checked ? 'line-through text-emerald-950 opacity-75' : 'text-slate-900'}`}>
                              {doc.displayName}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 shrink-0">
                              {doc.isRequired ? 'Bắt buộc' : 'Tùy trường hợp'} · {doc.isOriginal ? 'Mang bản chính' : 'Bản photo'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Dùng cho: {doc.serviceNames.join(' · ')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Bottom Modal Footer (Not printed) */}
        <div className="px-5 sm:px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Con cháu có thể sao chép bảng này gửi Zalo/SMS cho ông bà trước khi đi nộp.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {plannedServices.length > 0 && (
              <button
                type="button"
                onClick={handleCopyShare}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSummary ? 'Đã sao chép gửi Zalo!' : 'Sao chép gửi người thân'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopAudio();
                setIsVisitPlanModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
