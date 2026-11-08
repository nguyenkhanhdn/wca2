import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Sparkles, 
  Volume2, 
  Mic, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  ChevronRight, 
  Landmark, 
  Lock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Counter, PublicService } from '../types';
import { KioskProcedureGuideModal } from './KioskProcedureGuideModal';

const DigitalClock: React.FC = React.memo(() => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[currentTime.getDay()];
  const day = currentTime.getDate().toString().padStart(2, '0');
  const month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
  const year = currentTime.getFullYear();
  const dateStr = `${dayName}, ngày ${day}/${month}/${year}`;

  return (
    <div className="text-center md:text-right bg-black/25 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-inner">
      <div className="text-3xl font-mono font-black text-amber-300 tabular-nums tracking-wider">
        {currentTime.toLocaleTimeString('vi-VN', { hour12: false })}
      </div>
      <div className="text-xs font-semibold text-white/90 mt-0.5">
        {dateStr}
      </div>
    </div>
  );
});

export const StandbyScreen: React.FC = () => {
  const { 
    selectedWard, 
    currentWardCounters, 
    currentWardOfficers,
    currentWardServices,
    setCurrentScreen,
    selectService,
    readText,
    isAdminLoggedIn,
    setIsAdminLoginModalOpen
  } = useApp();

  const [selectedCounterForGuide, setSelectedCounterForGuide] = useState<Counter | null>(null);

  // Memoize active counter services so references are stable
  const activeCounterServices = useMemo(() => {
    if (!selectedCounterForGuide) return [];
    return currentWardServices.filter(s => s.counterId === selectedCounterForGuide.id);
  }, [currentWardServices, selectedCounterForGuide?.id]);

  const activeCounterOfficer = useMemo(() => {
    if (!selectedCounterForGuide) return null;
    return currentWardOfficers.find(o => o.counterId === selectedCounterForGuide.id) || 
      currentWardOfficers.find(o => o.name === selectedCounterForGuide.officerName) || null;
  }, [currentWardOfficers, selectedCounterForGuide]);

  const handleStart = () => {
    // Friendly audio welcome for elderly citizens
    readText(`Kính chào Bác! Chào mừng Bác đến với Trung tâm Phục vụ Hành chính công ${selectedWard.name}. Bác hãy chọn thủ tục hoặc bấm micro để nói yêu cầu.`);
    setCurrentScreen('citizen_home');
  };

  const handleOpenCounterGuide = (counter: Counter) => {
    setSelectedCounterForGuide(counter);
  };

  return (
    <div 
      onClick={handleStart}
      className="relative min-h-screen flex flex-col justify-between bg-[#f4f6f9] text-slate-800 cursor-pointer selection:bg-none"
    >
      {/* Top National Header Band (Màu đỏ cờ chuẩn Cổng TTĐT Chính phủ #be111a) */}
      <header className="relative bg-gradient-to-r from-[#9b0e15] via-[#be111a] to-[#9b0e15] text-white shadow-md border-b-4 border-[#ca8a04] px-4 sm:px-8 py-4 sm:py-5">
        
        {/* National Motto - Prominently Centered Across Full Screen */}
        <div className="max-w-7xl mx-auto text-center pb-3 mb-3 border-b border-white/20">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-amber-300 font-black">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="text-xs sm:text-sm text-white font-bold tracking-wide border-b border-amber-300/50 inline-block pb-0.5 mt-0.5">
            Độc lập - Tự do - Hạnh phúc
          </p>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* National Emblem & Ward Title */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#be111a] to-[#7f0b11] flex items-center justify-center shadow-lg ring-3 ring-amber-300 shrink-0">
              <Landmark className="w-8 h-8 text-amber-300" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
                TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG {selectedWard.name.toUpperCase()}
              </h1>
              <p className="text-xs text-amber-100 flex items-center justify-center md:justify-start gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  {selectedWard.address}
                </span>
                <span>·</span>
                <span>Hotline: <strong className="text-white">{selectedWard.hotline}</strong></span>
              </p>
            </div>
          </div>

          {/* Government Digital Clock */}
          <DigitalClock />

        </div>
      </header>

      {/* Main Kiosk Hero Canvas (Màu nền xám nhạt trang nhã #f4f6f9) */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        
        {/* Slogan & National Digital Transformation Banner */}
        <div className="text-center max-w-3xl mx-auto mb-2 sm:mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[#be111a] text-[11px] sm:text-xs font-bold tracking-wide mb-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#be111a]" />
            CHUYỂN ĐỔI SỐ QUỐC GIA THEO ĐỀ ÁN 06 CHÍNH PHỦ · LẤY NGƯỜI DÂN LÀM TRUNG TÂM
          </div>

          <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-800 tracking-tight leading-snug">
            CỔNG THÔNG TIN DỊCH VỤ CÔNG MỘT CỬA <br />
            <span className="text-xs sm:text-sm lg:text-base font-extrabold text-[#be111a]">
              THÂN THIỆN VỚI NGƯỜI CAO TUỔI · CÓ GIỌNG NÓI HƯỚNG DẪN
            </span>
          </h2>

          <p className="text-slate-600 text-xs mt-1 max-w-2xl mx-auto">
            Hệ thống hỗ trợ công dân tra cứu thành phần hồ sơ, lệ phí, thời hạn giải quyết và sơ đồ ô tiếp nhận một cửa nhanh chóng, thuận tiện nhất.
          </p>
        </div>

        {/* Live Counter Preview Grid (Cards on #f4f6f9 canvas) */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 px-1">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#be111a]" />
              SƠ ĐỒ BỐ TRÍ CÁC Ô TIẾP NHẬN VÀ CHUYÊN VIÊN PHỤ TRÁCH {selectedWard.name.toUpperCase()}
            </span>
            <span className="text-slate-500 font-medium lowercase">
              (Chạm vào bất kỳ vị trí nào để tra cứu thủ tục)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            {currentWardCounters.map((counter) => {
              const counterServices = currentWardServices.filter(s => s.counterId === counter.id);
              return (
                <div
                  key={counter.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCounterGuide(counter);
                  }}
                  className="p-4 rounded-2xl bg-white hover:bg-red-50/50 border border-slate-200 hover:border-[#be111a] transition-all duration-200 shadow-xs hover:shadow-md group flex flex-col justify-between cursor-pointer"
                  title={`Chạm để xem hướng dẫn thủ tục tại ${counter.code}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#fef2f2] text-[#be111a] border border-[#fecaca]">
                        {counter.code}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        Bàn {counter.positionNumber}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#be111a] transition-colors line-clamp-1">
                      {counter.primaryField}
                    </h3>

                    <p className="text-xs text-[#be111a] font-bold mt-1">
                      {counter.officerName}
                    </p>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {counter.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#be111a] font-bold group-hover:text-red-700">
                    <span className="flex items-center gap-1 group-hover:underline">
                      Xem thủ tục
                      {counterServices.length > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-red-100 text-[#be111a] ml-1">
                          {counterServices.length} TTHC
                        </span>
                      )}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#be111a]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Big Pulsing Touch-To-Start Button (Government Red with Gold Border) */}
        <div className="text-center my-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            className="group relative inline-flex items-center justify-center gap-4 px-8 sm:px-14 py-5 sm:py-6 rounded-3xl bg-gradient-to-r from-[#9b0e15] via-[#be111a] to-[#9b0e15] text-white font-black text-lg sm:text-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-3 border-amber-300"
          >
            <div className="relative flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-amber-400 text-[#9b0e15] flex items-center justify-center shrink-0 shadow-md">
                <Mic className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
              </div>

              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-amber-200 font-bold">
                  Bác chạm ngón tay vào đây để bắt đầu
                </span>
                <span className="text-lg sm:text-2xl font-black tracking-tight">
                  CHẠM ĐỂ BẮT ĐẦU TRA CỨU
                </span>
              </div>

              <ChevronRight className="w-7 h-7 text-amber-300 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </button>

          <p className="text-xs text-slate-600 mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              Có loa giọng nói tiếng Việt hướng dẫn
            </span>
            <span className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-[#be111a]" />
              Nói vào micro để tìm thủ tục
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Chữ to rõ, dễ nhìn cho người lớn tuổi
            </span>
          </p>
        </div>

      </main>

      {/* Footer (Government Portal Clean Footer) */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#be111a]" />
              Chuẩn Danh mục Dịch vụ công Quốc gia (dichvucong.gov.vn)
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              UBND {selectedWard.name} · Hotline: <strong className="text-slate-800">{selectedWard.hotline}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentScreen('mindmap_view');
              }}
              className="text-[#be111a] hover:underline font-bold"
            >
              Xem Sơ đồ 8 Cán bộ & Các Ô tiếp nhận
            </button>
            <span>·</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isAdminLoggedIn) {
                  setCurrentScreen('admin');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#be111a] font-semibold transition-colors"
              title="Đăng nhập cán bộ quản trị"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? 'Bảng quản trị (Đã đăng nhập)' : 'Đăng nhập quản trị'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Hướng dẫn quy trình, hồ sơ, lệ phí, thời gian của dịch vụ tương ứng tại Kiosk */}
      <KioskProcedureGuideModal
        isOpen={Boolean(selectedCounterForGuide)}
        onClose={() => setSelectedCounterForGuide(null)}
        counter={selectedCounterForGuide}
        officer={activeCounterOfficer}
        services={activeCounterServices}
        ward={selectedWard}
        onOpenFullDetail={(service) => {
          setSelectedCounterForGuide(null);
          selectService(service);
        }}
      />

    </div>
  );
};
