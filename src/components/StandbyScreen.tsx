import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Mic,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Landmark,
  Lock,
  MessageSquareText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import kioskHeroIllustration from '../assets/images/kiosk_hero_illustration_1795352996100.jpg';

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
  const timeStr = currentTime.toLocaleTimeString('vi-VN', { hour12: false }).replace(/:/g, ' : ');

  return (
    <div className="text-center md:text-right bg-black/25 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-inner shrink-0">
      <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tabular-nums tracking-wider whitespace-nowrap">
        {timeStr}
      </div>
      <div className="text-xs font-semibold text-white/95 mt-0.5 whitespace-nowrap">
        {dateStr}
      </div>
    </div>
  );
});

export const StandbyScreen: React.FC = () => {
  const {
    selectedWard,
    setCurrentScreen,
    readText,
    openAIAssistant,
    isAdminLoggedIn,
    setIsAdminLoginModalOpen
  } = useApp();

  const [imgError, setImgError] = useState(false);

  const handleStart = () => {
    readText(
      `Kính chào Bác! Chào mừng Bác đến với Trung tâm Phục vụ Hành chính công ${selectedWard.name}. Bác hãy chọn thủ tục hoặc bấm micro để nói yêu cầu.`
    );
    setCurrentScreen('citizen_home');
  };

  return (
    <div
      onClick={handleStart}
      className="relative min-h-screen flex flex-col justify-between bg-[#f4f6f9] text-slate-800 cursor-pointer selection:bg-none"
    >
      {/* Top National Header Band */}
      <header className="relative bg-gradient-to-r from-[#861419] via-[#9f191f] to-[#861419] text-white shadow-md border-b-4 border-[#ca8a04] px-4 sm:px-8 py-4">
        {/* National Motto */}
        <div className="max-w-7xl mx-auto text-center pb-2.5 mb-2.5 border-b border-white/15">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-amber-300 font-black">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="text-xs sm:text-sm text-white font-bold tracking-wide border-b border-amber-300/60 inline-block pb-0.5 mt-0.5">
            Độc lập - Tự do - Hạnh phúc
          </p>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Emblem & Center Title */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#be111a] to-[#7f0b11] flex items-center justify-center shadow-lg ring-2 ring-amber-300 shrink-0">
              <Landmark className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
            </div>

            <div>
              <h1 className="text-base sm:text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
                TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG {selectedWard.name.toUpperCase()}
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-0.5 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{selectedWard.address}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Hotline: <strong className="text-white">{selectedWard.hotline}</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Digital Clock */}
          <DigitalClock />
        </div>
      </header>

      {/* Main Simplified Landing Canvas */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-4 sm:py-6 flex-1 flex flex-col justify-center gap-5 sm:gap-6">
        {/* Welcoming Illustrated Scene of the Administrative Center & Staff */}
        <section
          aria-label="Minh họa Trung tâm Phục vụ Hành chính công sẵn sàng đón tiếp công dân"
          className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-b from-stone-100 to-stone-200 border border-stone-200/90 shadow-lg"
        >
          {!imgError ? (
            <div className="relative w-full h-[300px] sm:h-[380px] lg:h-[440px] xl:h-[470px]">
              <img
                src={kioskHeroIllustration}
                alt={`Minh họa cán bộ tại các ô tiếp nhận Trung tâm Phục vụ Hành chính công ${selectedWard.name} trong trang phục lịch lãm, sẵn sàng hỗ trợ người dân`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-stone-900/35 via-stone-900/10 to-transparent pointer-events-none"
              />
              <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-white pointer-events-none">
                <p className="text-xs sm:text-sm font-bold bg-black/45 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/20">
                  Kính chào Bác! Cán bộ các ô tiếp nhận luôn sẵn sàng đón tiếp và hướng dẫn tận tình
                </p>
                <p className="hidden sm:block text-xs font-semibold bg-black/45 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20">
                  {selectedWard.workingHours}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-[300px] sm:h-[380px] lg:h-[430px] flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-stone-100 to-red-50 p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#9f191f] text-amber-300 flex items-center justify-center shadow-md mb-4">
                <Landmark className="w-10 h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Trung tâm Phục vụ Hành chính công {selectedWard.name}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl">
                Các ô tiếp nhận luôn sẵn sàng đón tiếp, hướng dẫn thủ tục rõ ràng và tận tình phục vụ nhân dân.
              </p>
            </div>
          )}
        </section>

        {/* Big Touch-To-Start & AI Q&A Buttons */}
        <section className="text-center">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              className="w-full sm:w-auto min-w-[300px] sm:min-w-[380px] group relative inline-flex items-center justify-between gap-4 px-7 sm:px-9 py-4 sm:py-5 rounded-3xl bg-gradient-to-r from-[#8b1318] via-[#a9161d] to-[#8b1318] text-white shadow-xl hover:shadow-2xl hover:scale-[1.015] active:scale-[0.98] transition-all duration-200 border-3 border-amber-300 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-[#8b1318] flex items-center justify-center shrink-0 shadow-md">
                  <Mic className="w-6 h-6" />
                </div>

                <div className="text-left">
                  <span className="block text-[11px] sm:text-xs uppercase tracking-wider text-amber-200 font-bold">
                    Chạm vào đây để xem danh mục
                  </span>
                  <span className="text-base sm:text-xl font-black tracking-tight whitespace-nowrap">
                    CHẠM ĐỂ BẮT ĐẦU TRA CỨU
                  </span>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openAIAssistant();
              }}
              className="w-full sm:w-auto min-w-[300px] sm:min-w-[380px] group inline-flex items-center justify-between gap-4 px-7 sm:px-9 py-4 sm:py-5 rounded-3xl bg-[#0b132b] hover:bg-[#131e3f] text-white shadow-xl hover:shadow-2xl hover:scale-[1.015] active:scale-[0.98] transition-all duration-200 border-3 border-amber-300 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <MessageSquareText className="w-6 h-6" />
                </div>

                <div className="text-left">
                  <span className="block text-[11px] sm:text-xs uppercase tracking-wider text-emerald-300 font-bold">
                    Nói hoặc gõ câu hỏi cho Trợ lý
                  </span>
                  <span className="text-base sm:text-xl font-black tracking-tight whitespace-nowrap">
                    HỎI ĐÁP THỦ TỤC VỚI AI
                  </span>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mt-3.5 flex flex-wrap items-center justify-center gap-4 sm:gap-7 font-medium">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Có loa giọng nói tiếng Việt hướng dẫn</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-[#be111a] shrink-0" />
              <span>Nói vào micro để tìm thủ tục</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chữ to rõ, dễ nhìn cho người lớn tuổi</span>
            </span>
          </p>
        </section>
      </main>

      {/* Clean Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-4 sm:px-8 lg:pr-28 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#be111a] shrink-0" />
              <span>Chuẩn Danh mục Dịch vụ công Quốc gia (dichvucong.gov.vn)</span>
            </span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline">
              UBND {selectedWard.name} · Hotline: <strong className="text-slate-800">{selectedWard.hotline}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentScreen('mindmap_view');
              }}
              className="text-[#be111a] hover:underline font-bold cursor-pointer"
            >
              Xem Sơ đồ 8 Cán bộ &amp; Các Ô tiếp nhận
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isAdminLoggedIn) {
                  setCurrentScreen('admin');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#be111a] font-semibold transition-colors cursor-pointer"
              title="Đăng nhập cán bộ quản trị"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? 'Bảng quản trị (Đã đăng nhập)' : 'Đăng nhập quản trị'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
