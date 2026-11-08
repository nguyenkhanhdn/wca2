import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Eye, 
  Settings, 
  Home, 
  Layers, 
  Tv, 
  ChevronDown,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIAssistantIcon } from './AIAssistantIcon';

export const Navbar: React.FC = () => {
  const { 
    wards, 
    selectedWardId, 
    setSelectedWardId, 
    currentScreen, 
    setCurrentScreen,
    accessibility,
    setTextScale,
    setHighContrast,
    isSpeaking,
    stopAudio,
    readText,
    openAIAssistant
  } = useApp();

  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);
  const currentWard = wards.find(w => w.id === selectedWardId) || wards[0];

  const handleTestAudio = () => {
    if (isSpeaking) {
      stopAudio();
    } else {
      readText(`Kính chào Bác! Hệ thống hỗ trợ dịch vụ công số ${currentWard.name} sẵn sàng phục vụ Bác.`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top National Motto Bar (Màu đỏ cờ chuẩn Chính phủ #be111a) */}
      <div className="bg-[#be111a] text-white py-1 px-4 text-center border-b border-amber-400">
        <p className="text-[11px] sm:text-xs uppercase tracking-widest font-black text-amber-300">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </p>
        <p className="text-[10px] sm:text-[11px] font-semibold text-white tracking-wide border-b border-amber-300/60 inline-block pb-0.5">
          Độc lập - Tự do - Hạnh phúc
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand & Current Ward */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentScreen('citizen_home')}
            className="flex items-center gap-2.5 text-left group"
          >
            {/* Vietnamese Emblem / Crest Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-sm ring-2 ring-red-100 shrink-0">
              <Building2 className="w-5 h-5 text-amber-200" />
            </div>

            <div className="leading-tight">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 block">
                {currentWard.name}
              </span>
              <span className="text-sm font-extrabold text-slate-900 group-hover:text-red-700 transition-colors whitespace-nowrap">
                Phục vụ hành chính công
              </span>
            </div>
          </button>

          {/* Ward Switcher Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setIsWardDropdownOpen(!isWardDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
              title="Đổi Phường/Xã"
            >
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span className="max-w-[120px] truncate">{currentWard.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isWardDropdownOpen && (
              <div 
                className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in"
                onMouseLeave={() => setIsWardDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Chọn Phường / Xã tiếp nhận
                </div>
                {wards.map((ward) => (
                  <button
                    key={ward.id}
                    onClick={() => {
                      setSelectedWardId(ward.id);
                      setIsWardDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      ward.id === selectedWardId ? 'font-bold text-red-700 bg-red-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{ward.name}</div>
                      <div className="text-[10px] text-slate-400">{ward.district}</div>
                    </div>
                    {ward.id === selectedWardId && <Check className="w-4 h-4 text-red-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean, single-line text links) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600 shrink-0">
          <button
            onClick={() => setCurrentScreen('citizen_home')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
              currentScreen === 'citizen_home' ? 'text-red-700 font-bold border-b-2 border-red-700' : 'hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            Tra cứu dịch vụ
          </button>

          <button
            onClick={() => setCurrentScreen('mindmap_view')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
              currentScreen === 'mindmap_view' ? 'text-red-700 font-bold border-b-2 border-red-700' : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Sơ đồ các ô và cán bộ
          </button>

          <button
            onClick={() => setCurrentScreen('standby')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
              currentScreen === 'standby' ? 'text-red-700 font-bold border-b-2 border-red-700' : 'hover:text-slate-900'
            }`}
          >
            <Tv className="w-4 h-4" />
            Màn hình chờ Kiosk
          </button>
        </nav>

        {/* Zone 3: Senior Citizen Accessibility Controls & Voice */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Text Size Adjuster for Elderly */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-1.5 hidden sm:inline">Cỡ chữ:</span>
            <button
              onClick={() => setTextScale('normal')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
                accessibility.textScale === 'normal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cỡ chữ tiêu chuẩn"
            >
              A
            </button>
            <button
              onClick={() => setTextScale('large')}
              className={`px-2 py-1 text-sm font-bold rounded-lg transition-colors ${
                accessibility.textScale === 'large'
                  ? 'bg-white text-red-700 shadow-xs ring-1 ring-red-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cỡ chữ to (Khuyên dùng cho người già)"
            >
              A+
            </button>
            <button
              onClick={() => setTextScale('xlarge')}
              className={`px-2 py-1 text-base font-extrabold rounded-lg transition-colors ${
                accessibility.textScale === 'xlarge'
                  ? 'bg-white text-red-800 shadow-xs ring-1 ring-red-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cỡ chữ rất to"
            >
              A++
            </button>
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={() => setHighContrast(!accessibility.highContrast)}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              accessibility.highContrast
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Bật/Tắt chế độ tương phản cao"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden md:inline">Tương phản</span>
          </button>

          {/* Interactive AI Assistant Robot Launch Button */}
          <button
            onClick={openAIAssistant}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm bg-gradient-to-r from-[#be111a] to-[#990e15] hover:from-red-600 hover:to-[#be111a] text-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-red-100"
            title="Mở Trợ lý AI Một Cửa - Hướng dẫn thủ tục bằng giọng nói"
          >
            <AIAssistantIcon className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Trợ lý AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>

          {/* Voice Prompt Play/Stop */}
          <button
            onClick={handleTestAudio}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
              isSpeaking
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={isSpeaking ? 'Dừng đọc giọng nói' : 'Thử giọng nói hướng dẫn'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Dừng đọc</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Loa đọc</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
